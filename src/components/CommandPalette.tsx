'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, LayoutDashboard, Camera, Users, Settings, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const actions = [
    { id: 'attendance', title: 'Start Attendance', icon: Camera, shortcut: 'S', href: '/attendance' },
    { id: 'dashboard', title: 'Teacher Dashboard', icon: LayoutDashboard, shortcut: 'D', href: '/dashboard' },
    { id: 'registry', title: 'Student Registry', icon: Users, shortcut: 'R', href: '/registry' },
    { id: 'settings', title: 'System Settings', icon: Settings, shortcut: ',', href: '/dashboard?settings=true' },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleAction = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-nike-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-nike-dark border border-white/10 rounded-nike-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 border-b border-white/5">
                <Search size={18} className="text-nike-gray" />
                <input
                  autoFocus
                  placeholder="Search commands or sessions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none py-5 px-4 text-sm text-nike-white placeholder:text-nike-gray font-medium"
                />
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-nike-md">
                  <span className="text-[10px] font-black text-nike-gray uppercase tracking-widest">ESC</span>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
                {filteredActions.length === 0 ? (
                  <div className="py-12 text-center space-y-2 opacity-40">
                    <Command size={32} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No matching commands</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredActions.map((action, i) => (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action.href)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center justify-between p-4 rounded-nike-lg transition-all group ${
                          selectedIndex === i ? 'bg-white/5 border border-white/5' : 'border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-nike-md ${selectedIndex === i ? 'bg-nike-white text-nike-black' : 'bg-white/5 text-nike-gray'}`}>
                            <action.icon size={18} />
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-tight ${selectedIndex === i ? 'text-nike-white' : 'text-nike-gray'}`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedIndex === i && (
                            <motion.div layoutId="arrow" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                              <ArrowRight size={14} className="text-nike-green" />
                            </motion.div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] font-black text-nike-gray/40">
                            <span>⌘</span>
                            <span>{action.shortcut}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-nike-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-black text-nike-gray uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-nike-white">↑↓</span>
                    NAVIGATE
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-nike-white">↵</span>
                    SELECT
                  </div>
                </div>
                <div className="text-[9px] font-black text-nike-green uppercase tracking-widest">
                  MARKIFY SYSTEMS v2.0
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
