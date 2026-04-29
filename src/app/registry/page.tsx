'use client';

import { useState, useEffect } from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { getStudents, saveStudent, deleteStudent, Student } from '@/lib/attendance';
import { Camera, Users, Trash2, UserPlus, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function RegistryPage() {
  const { isLoaded, isDetecting, faceDetected, faceDescriptor, videoRef, canvasRef, startVideo, stopVideo, handleVideoOnPlay } = useFaceDetection();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    if (enrolling) {
      // Small delay to ensure video element is mounted
      const timer = setTimeout(() => {
        startVideo();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopVideo();
      };
    }
  }, [enrolling]);

  const handleEnroll = async () => {
    if (!name || !faceDescriptor) return;
    
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      descriptor: Array.from(faceDescriptor),
      enrolledAt: new Date().toISOString(),
    };

    saveStudent(newStudent);
    setStudents(getStudents());
    setName('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setStudents(getStudents());
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-nike-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-4">
            <Link href="/" className="text-nike-gray hover:text-nike-white flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
              <ArrowLeft size={14} /> BACK
            </Link>
            <div className="space-y-1">
              <h1 className="text-6xl nike-heading">REGISTRY</h1>
              <p className="text-[10px] text-nike-gray font-black tracking-widest uppercase flex items-center gap-2">
                STUDENT BIOMETRIC ENROLLMENT <span className="text-nike-green">● SECURE</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setEnrolling(!enrolling)}
            className={`nike-button px-8 py-4 ${enrolling ? 'bg-nike-red text-nike-white' : 'bg-nike-white text-nike-black'} text-[10px] uppercase tracking-widest flex items-center gap-2`}
          >
            {enrolling ? <Trash2 size={14} /> : <UserPlus size={14} />}
            {enrolling ? 'CANCEL ENROLLMENT' : 'NEW ENROLLMENT'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enrollment Panel */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {enrolling ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="nike-card p-0 overflow-hidden bg-nike-dark/50"
                >
                  <div className="aspect-video relative bg-nike-black">
                    {!isLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-nike-gray">
                        <Loader2 className="animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading AI Models...</p>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      onPlay={handleVideoOnPlay}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-100"
                    />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                    
                    {isLoaded && !faceDetected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 bg-nike-black/80 border border-white/10 rounded-nike-md text-[10px] font-black text-nike-gray uppercase tracking-widest animate-pulse">
                          Position face in frame
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-nike-white">Student Name</h4>
                        <p className="text-xs text-nike-gray">Enter the full legal name for registry</p>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. JOHN DOE"
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                        className="w-full bg-nike-black border border-white/10 rounded-nike-md px-6 py-4 text-sm font-bold text-nike-white outline-none focus:border-nike-white/20 transition-all"
                      />
                    </div>

                    <button
                      disabled={!name || !faceDetected}
                      onClick={handleEnroll}
                      className="w-full nike-button py-5 bg-nike-green text-nike-black text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:grayscale hover:bg-nike-green/80"
                    >
                      COMPLETE ENROLLMENT
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="nike-card p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-white/10"
                >
                  <div className="w-20 h-20 bg-nike-white/5 rounded-full flex items-center justify-center text-nike-gray">
                    <Users size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="nike-heading text-2xl">REGISTRY STANDBY</h3>
                    <p className="text-sm text-nike-gray uppercase font-bold tracking-tighter max-w-xs">
                      Ready to enroll new students into the biometric database
                    </p>
                  </div>
                  <button 
                    onClick={() => { setEnrolling(true); startVideo(); }}
                    className="nike-button px-12 py-4 bg-nike-white text-nike-black text-[10px] font-black tracking-widest"
                  >
                    INITIALIZE CAMERA
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-nike-green text-nike-black rounded-nike-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={24} />
                  <div>
                    <h4 className="font-black text-lg uppercase italic tracking-tighter leading-none">Enrollment Successful</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Biometric data secured in registry</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Student List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="nike-heading text-lg">ENROLLED <span className="text-nike-gray">STUDENTS</span></h3>
              <span className="text-[10px] font-black text-nike-gray">{students.length} TOTAL</span>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {students.map((student) => (
                <div key={student.id} className="nike-card p-4 group hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nike-white/5 flex items-center justify-center text-nike-gray font-black text-xs">
                        {student.name[0]}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase tracking-tight text-nike-white">{student.name}</h4>
                        <p className="text-[8px] text-nike-gray font-bold uppercase tracking-widest">ID: {student.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-nike-gray hover:text-nike-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-20">
                  <Users size={32} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No students enrolled</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
