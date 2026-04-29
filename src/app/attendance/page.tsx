'use client';

import { useState, useEffect } from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { AttendanceStatus, classifyReason, saveRecord, getSettings, AttendanceRecord, matchStudent, saveStudent, Student } from '@/lib/attendance';
import { Camera, CheckCircle2, AlertCircle, Clock, ArrowRight, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AttendancePage() {
  const {
    isLoaded,
    faceDetected,
    faceDescriptor,
    videoRef,
    canvasRef,
    startVideo,
    stopVideo,
    handleVideoOnPlay
  } = useFaceDetection();

  const [step, setStep] = useState<'scan' | 'result' | 'reason' | 'success'>('scan');
  const [status, setStatus] = useState<AttendanceStatus>('On Time');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const [isAutoIdentified, setIsAutoIdentified] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    startVideo();
    return () => stopVideo();
  }, []);

  // Auto-identification logic
  useEffect(() => {
    if (step === 'scan' && faceDescriptor && !isAutoIdentified) {
      const match = matchStudent(faceDescriptor);
      if (match) {
        setStudentName(match.name);
        setStudentId(match.id);
        setIsAutoIdentified(true);

        // Auto-advance after a brief delay for visual feedback
        setTimeout(() => {
          handleScanComplete();
        }, 400);
      }
    }
  }, [faceDescriptor, step, isAutoIdentified]);

  const checkLateness = () => {
    const settings = getSettings();
    const now = new Date();
    const [cutoffHours, cutoffMinutes] = settings.lateCutoff.split(':').map(Number);

    const cutoff = new Date();
    cutoff.setHours(cutoffHours, cutoffMinutes, 0);

    if (now > cutoff) {
      setStatus('Late');
      return 'Late';
    } else {
      setStatus('On Time');
      return 'On Time';
    }
  };

  const handleScanComplete = () => {
    const currentStatus = checkLateness();
    setStep('result');
  };

  const handleSubmitAttendance = (reasonText?: string) => {
    const settings = getSettings();
    const finalReason = reasonText || customReason || lateReason;
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: studentName || 'Anonymous Student',
      timestamp: new Date().toISOString(),
      status: status,
      reason: status === 'Late' ? finalReason : undefined,
      reasonCategory: status === 'Late' ? classifyReason(finalReason) : undefined,
      sessionName: settings.sessionName,
      studentId: studentId
    };

    saveRecord(record);
    setStep('success');
  };

  return (
    <main className="min-h-screen bg-nike-black p-6 flex flex-col items-center">
      <nav className="w-full max-w-6xl flex justify-between items-center mb-12">
        <Link href="/" className="nike-heading text-2xl">MARKIFY</Link>
        <div className="text-nike-gray text-sm font-bold uppercase tracking-widest">
          {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
      </nav>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: SCAN */}
          {step === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-4xl nike-heading">SCAN YOUR FACE</h2>
                <p className="text-nike-gray font-medium">Position your face within the frame to mark attendance.</p>
              </div>

              <div className="relative aspect-square rounded-3xl overflow-hidden bg-nike-dark border-2 border-white/5 shadow-2xl">
                {!isLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-nike-dark/80 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-nike-white" size={48} />
                    <p className="nike-heading text-sm">Initializing AI Models...</p>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={handleVideoOnPlay}
                  className="w-full h-full object-cover opacity-100"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Face Frame Overlay */}
                <div className="absolute inset-0 border-[40px] border-nike-black/60 pointer-events-none">
                  <div className={`w-full h-full border-4 rounded-[40px] transition-colors duration-500 ${faceDetected ? 'border-nike-green' : 'border-nike-white/20'}`} />
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${faceDetected ? 'bg-nike-green' : 'bg-nike-red'}`} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {isAutoIdentified ? 'Identity Verified' : faceDetected ? 'Face Detected' : 'No Face Found'}
                  </span>
                </div>

                {isAutoIdentified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-6 right-6 p-4 bg-nike-green text-nike-black rounded-nike-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} />
                      <span className="text-xs font-black uppercase tracking-tight">RECOGNIZED: {studentName}</span>
                    </div>
                  </motion.div>
                )}

                {/* Smart Enrollment Prompt */}
                <AnimatePresence>
                  {faceDetected && !isAutoIdentified && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-4 left-4 right-4 z-20"
                    >
                      <div className="bg-nike-dark/95 backdrop-blur-xl border border-nike-white/10 p-4 rounded-nike-md shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">

                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-nike-white">New Student?</p>
                            <p className="text-[9px] font-bold text-nike-gray uppercase tracking-tighter leading-tight">
                              Enroll now to enable automatic <br /> biometric recognition next time.
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/registry"
                          className="px-4 py-2 bg-nike-white text-nike-black text-[9px] font-black uppercase tracking-widest rounded-nike-sm hover:bg-nike-gray transition-colors whitespace-nowrap"
                        >
                          ENROLL NOW
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-nike-gray" size={20} />
                  <input
                    type="text"
                    placeholder={isAutoIdentified ? studentName : "ENTER YOUR NAME"}
                    disabled={isAutoIdentified}
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-nike-dark border border-white/10 rounded-xl px-12 py-4 focus:border-nike-white outline-none transition-colors font-bold uppercase tracking-tight disabled:opacity-50"
                  />
                </div>

                {!isAutoIdentified && (
                  <button
                    disabled={!faceDetected || !studentName}
                    onClick={handleScanComplete}
                    className={`nike-button w-full py-5 flex items-center justify-center gap-3 ${faceDetected && studentName
                      ? 'bg-nike-white text-nike-black'
                      : 'bg-nike-dark text-nike-gray cursor-not-allowed opacity-50'
                      }`}
                  >
                    <Camera size={20} />
                    CAPTURE ATTENDANCE
                  </button>
                )}

                {isAutoIdentified && (
                  <div className="text-center">
                    <p className="text-[10px] text-nike-gray font-black uppercase tracking-widest">Verifying biometric data...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-nike-dark p-8 rounded-[40px] border border-white/5 space-y-8 text-center"
            >
              <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center ${status === 'On Time' ? 'bg-nike-green' : 'bg-nike-yellow'}`}>
                {status === 'On Time' ? <CheckCircle2 size={48} className="text-nike-black" /> : <Clock size={48} className="text-nike-black" />}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-black text-nike-gray uppercase tracking-[0.2em]">Attendance Status</h3>
                <h2 className={`text-6xl nike-heading ${status === 'On Time' ? 'text-nike-green' : 'text-nike-yellow'}`}>
                  {status}
                </h2>
              </div>

              <div className="p-6 bg-nike-black/40 rounded-2xl border border-white/5">
                <p className="text-nike-gray font-medium">
                  {status === 'On Time'
                    ? "Great job! You've arrived before the 10:00 AM cutoff."
                    : "You have arrived after the 10:00 AM cutoff. Please provide a reason."}
                </p>
              </div>

              <button
                onClick={() => status === 'On Time' ? handleSubmitAttendance() : setStep('reason')}
                className="nike-button w-full py-5 bg-nike-white text-nike-black flex items-center justify-center gap-2"
              >
                {status === 'On Time' ? 'FINISH' : 'CONTINUE'}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: REASON */}
          {step === 'reason' && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-4xl nike-heading">WHY ARE YOU LATE?</h2>
                <p className="text-nike-gray font-medium">AI will analyze your reason for better scheduling.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {['Traffic', 'Health Issue', 'Personal Work'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSubmitAttendance(r)}
                    className="p-6 bg-nike-dark border border-white/5 rounded-2xl text-left hover:bg-nike-white hover:text-nike-black transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black uppercase tracking-tight text-xl">{r}</span>
                      <ArrowRight size={24} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-xs font-black text-nike-gray uppercase tracking-widest">OR OTHER</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>

                <textarea
                  placeholder="EXPLAIN YOUR REASON..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-nike-dark border border-white/10 rounded-2xl px-6 py-4 focus:border-nike-white outline-none transition-colors font-bold uppercase min-h-[120px] resize-none"
                />

                <button
                  disabled={!customReason}
                  onClick={() => handleSubmitAttendance()}
                  className={`nike-button w-full py-5 ${customReason ? 'bg-nike-white text-nike-black' : 'bg-nike-dark text-nike-gray opacity-50'}`}
                >
                  SUBMIT WITH AI ANALYSIS
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 py-12"
            >
              <div className="relative mx-auto w-32 h-32">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="absolute inset-0 bg-nike-green rounded-[40px] flex items-center justify-center"
                >
                  <CheckCircle2 size={64} className="text-nike-black" />
                </motion.div>
                <div className="absolute inset-0 bg-nike-green blur-3xl opacity-20 -z-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-5xl nike-heading">LOGGED IN</h2>
                <p className="text-nike-gray text-xl font-medium">Your attendance has been recorded successfully.</p>
              </div>

              <Link
                href="/"
                className="nike-button inline-flex px-12 py-5 bg-nike-white text-nike-black items-center gap-2"
              >
                BACK TO HOME
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
