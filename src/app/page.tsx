import Link from 'next/link';
import { Camera, LayoutDashboard, BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nike-green/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nike-red/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">

          <h1 className="text-7xl md:text-9xl nike-heading leading-[0.85] tracking-tighter">
            MARKIFY
          </h1>

          <p className="text-lg md:text-xl text-nike-gray max-w-2xl mx-auto font-bold uppercase tracking-widest opacity-80">
            Intelligent <span className="text-nike-white">Recognition</span> & Behavioral <span className="text-nike-white">Intel</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <Link
            href="/attendance"
            className="nike-button w-full md:w-auto px-8 py-4 bg-nike-white text-nike-black flex items-center justify-center gap-2 hover:bg-nike-gray"
          >
            <Camera size={20} />
            MARK ATTENDANCE
          </Link>

          <Link
            href="/dashboard"
            className="nike-button w-full md:w-auto px-8 py-4 bg-nike-dark text-nike-white border border-white/10 flex items-center justify-center gap-2 hover:bg-white/5"
          >
            <LayoutDashboard size={20} />
            TEACHER DASHBOARD
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-nike-gray text-[10px] font-black tracking-[0.4em] uppercase opacity-40">
        MARKIFY SYSTEMS © 2026 / ADVANCED RECOGNITION
      </div>
    </main>
  );
}
