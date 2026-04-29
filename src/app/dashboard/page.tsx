'use client';

import { useState, useEffect } from 'react';
import { getRecords, getAIInsights, AttendanceRecord, RiskLevel, analyzeRisk, exportRecordsToCSV, getSettings, saveSettings, SystemSettings } from '@/lib/attendance';
import {
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Search,
  Filter,
  BrainCircuit,
  Download,
  Settings2,
  Bell,
  Calendar,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({ lateCutoff: '10:00', sessionName: 'General Session' });

  useEffect(() => {
    setMounted(true);
    const data = getRecords();
    const currentSettings = getSettings();
    setRecords(data);
    setInsights(getAIInsights(data));
    setSettings(currentSettings);
    setLoading(false);
    // Delay showing charts to ensure layout is stable
    const timer = setTimeout(() => setShowCharts(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  if (!mounted) return <div className="min-h-screen bg-nike-black" />;

  // Data Processing
  const sortedRecords = [...records].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  const filteredRecords = sortedRecords.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reasonCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    exportRecordsToCSV(filteredRecords);
  };

  const onTimeCount = records.filter(r => r.status === 'On Time').length;
  const lateCount = records.filter(r => r.status === 'Late').length;

  const pieData = [
    { name: 'On-Time', value: onTimeCount },
    { name: 'Late', value: lateCount },
  ];

  const COLORS = ['#22C55E', '#FACC15'];

  const reasonCounts = records.filter(r => r.status === 'Late').reduce((acc, r) => {
    const cat = r.reasonCategory || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));

  const chronicLaters = records.filter(r => r.status === 'Late').reduce((acc, r) => {
    acc[r.name] = (acc[r.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highRiskStudents = Object.entries(chronicLaters).filter(([name, count]) => count >= 3);

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'High': return 'text-nike-red bg-nike-red/10 border-nike-red/20';
      case 'Medium': return 'text-nike-yellow bg-nike-yellow/10 border-nike-yellow/20';
      default: return 'text-nike-green bg-nike-green/10 border-nike-green/20';
    }
  };

  return (
    <main className="min-h-screen bg-nike-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-4">
            <Link href="/" className="text-nike-gray hover:text-nike-white flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
              <ArrowLeft size={14} /> BACK
            </Link>
            <div className="space-y-1">
              <h1 className="text-6xl nike-heading">MARKIFY </h1>
              <p className="text-[10px] text-nike-gray font-black tracking-widest uppercase flex items-center gap-2">
                SYSTEM CONTROL DASHBOARD <span className="text-nike-green">● LIVE</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-4 bg-nike-dark border border-white/5 rounded-nike-md text-nike-gray hover:text-nike-white transition-all hover:border-white/10"
            >
              <Settings2 size={20} />
            </button>
            <button 
              onClick={handleExport}
              className="nike-button px-8 py-4 bg-nike-white text-nike-black text-[10px] uppercase tracking-widest hover:bg-nike-gray flex items-center gap-2"
            >
              <Download size={14} /> EXPORT REPORT
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="nike-card bg-nike-dark/50 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-dashed border-white/10">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-nike-white">Active Session Name</h4>
                    <p className="text-xs text-nike-gray">Identify this attendance period (e.g. "Morning Lecture")</p>
                  </div>
                  <input 
                    type="text" 
                    value={settings.sessionName}
                    onChange={(e) => handleUpdateSettings({ sessionName: e.target.value })}
                    placeholder="Enter session name..."
                    className="w-full bg-nike-black border border-white/10 rounded-nike-md px-4 py-3 text-xs font-bold text-nike-white outline-none focus:border-nike-white/20"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-nike-white">Lateness Cutoff</h4>
                    <p className="text-xs text-nike-gray">Students scanning after this time will be marked late.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="time" 
                      value={settings.lateCutoff}
                      onChange={(e) => handleUpdateSettings({ lateCutoff: e.target.value })}
                      className="bg-nike-black border border-white/10 rounded-nike-md px-4 py-2 text-xs font-bold text-nike-white outline-none focus:border-nike-white/20"
                    />
                    <div className="text-[10px] font-black text-nike-gray uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-nike-green" /> SYSTEM SYNCED
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {highRiskStudents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-nike-red/10 border border-nike-red/20 rounded-nike-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-nike-red text-nike-white rounded-full animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="nike-heading text-nike-red text-xl">INTERVENTION REQUIRED</h4>
                <p className="text-xs text-nike-white/60 uppercase font-black tracking-tighter">
                  {highRiskStudents.length} Students have crossed the chronic lateness threshold
                </p>
              </div>
            </div>
            <div className="flex -space-x-3">
              {highRiskStudents.slice(0, 5).map(([name], i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-nike-dark border-2 border-nike-black flex items-center justify-center text-[10px] font-black text-nike-white">
                  {name[0]}
                </div>
              ))}
              {highRiskStudents.length > 5 && (
                <div className="w-10 h-10 rounded-full bg-nike-dark border-2 border-nike-black flex items-center justify-center text-[10px] font-black text-nike-white">
                  +{highRiskStudents.length - 5}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Metrics Grid - KPI Anchors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'TOTAL ENROLLMENT', value: records.length, icon: Users, color: 'text-nike-white' },
            { label: 'ON-TIME SESSIONS', value: onTimeCount, icon: Clock, color: 'text-nike-green' },
            { label: 'LATE ARRIVALS', value: lateCount, icon: AlertTriangle, color: 'text-nike-yellow' },
            { label: 'DOMINANT REASON', value: barData[0]?.name || 'N/A', icon: TrendingUp, color: 'text-nike-red' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="nike-card p-6 flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-center">
                <div className={`p-2 rounded-nike-md bg-white/5 ${m.color}`}>
                  <m.icon size={20} />
                </div>
                <div className="w-1 h-1 bg-nike-gray/30 rounded-full" />
              </div>
              <div className="space-y-0.5">
                <div className={`text-3xl nike-heading ${m.color}`}>{m.value}</div>
                <div className="text-[10px] font-black text-nike-gray tracking-widest uppercase">{m.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Radar Notifications */}
          <div className="nike-card flex flex-col h-full overflow-hidden p-0 border-nike-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-nike-yellow" />
                <h3 className="nike-heading text-sm">NOTIFICATIONS</h3>
              </div>
              <span className="text-[9px] font-black text-nike-gray bg-white/5 px-2 py-0.5 rounded-full">AI RADAR</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {insights.map((insight, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white/5 border border-white/5 rounded-nike-md space-y-2 group hover:border-nike-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-1.5 h-1.5 rounded-full bg-nike-green mt-1 group-hover:scale-125 transition-transform shadow-[0_0_8px_#22C55E]" />
                    <span className="text-[8px] font-black text-nike-gray uppercase">JUST NOW</span>
                  </div>
                  <p className="text-[10px] font-bold text-nike-white leading-relaxed uppercase tracking-tight">
                    {insight}
                  </p>
                </motion.div>
              ))}
              {insights.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30 py-12">
                  <Activity size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active anomalies</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-nike-white/5 mt-auto">
              <button className="w-full py-3 bg-nike-white text-nike-black text-[9px] font-black uppercase tracking-widest hover:bg-nike-gray transition-colors">
                VIEW ALL ALERTS
              </button>
            </div>
          </div>

          <div className="nike-card flex flex-col items-center justify-center text-center p-12 space-y-4 border-dashed border-white/10 opacity-50">
            <BrainCircuit size={48} className="text-nike-gray" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Temporal Analysis Offline</h4>
              <p className="text-xs text-nike-gray">Institutional trend monitoring is currently disabled</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="nike-card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="nike-heading text-lg">ATTENDANCE <span className="text-nike-gray">MIX</span></h3>
              <div className="px-3 py-1 bg-nike-green/10 text-nike-green border border-nike-green/20 rounded-nike-sm text-[8px] font-black uppercase tracking-widest">REALTIME</div>
            </div>
            <div className="w-full relative overflow-hidden min-h-[300px]">
              {showCharts && (
                <ResponsiveContainer width="100%" aspect={1.5} minWidth={0} key="pie-chart">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#FFF' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="nike-card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="nike-heading text-lg">LATE <span className="text-nike-gray">REASONS</span></h3>
              <div className="px-3 py-1 bg-nike-red/10 text-nike-red border border-nike-red/20 rounded-nike-sm text-[8px] font-black uppercase tracking-widest">ANALYTICS</div>
            </div>
            <div className="w-full relative overflow-hidden min-h-[300px]">
              {showCharts && (
                <ResponsiveContainer width="100%" aspect={1.5} minWidth={0} key="bar-chart">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#555" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#FFF' }}
                    />
                    <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="nike-card p-0 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="nike-heading text-xl">ACTIVITY <span className="text-nike-gray">LOG</span></h3>
              <p className="text-[10px] text-nike-gray font-bold uppercase tracking-widest mt-1">Showing {filteredRecords.length} records</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-nike-gray" />
                <input
                  type="text"
                  placeholder="SEARCH NAME OR REASON..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-nike-black border border-white/10 rounded-nike-md pl-10 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-nike-white/20 transition-all placeholder:text-nike-gray/50"
                />
              </div>
              <button className="p-3 bg-nike-black border border-white/10 rounded-nike-md text-nike-gray hover:text-nike-white transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-nike-black/40 text-left">
                  <th className="px-8 py-4 text-[9px] font-black text-nike-gray uppercase tracking-[0.2em]">Student Identifier</th>
                  <th className="px-8 py-4 text-[9px] font-black text-nike-gray uppercase tracking-[0.2em]">Log Time</th>
                  <th className="px-8 py-4 text-[9px] font-black text-nike-gray uppercase tracking-[0.2em]">Presence</th>
                  <th className="px-8 py-4 text-[9px] font-black text-nike-gray uppercase tracking-[0.2em]">AI Category</th>
                  <th className="px-8 py-4 text-[9px] font-black text-nike-gray uppercase tracking-[0.2em]">Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Search size={32} />
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest">No matching records</p>
                          <p className="text-[10px] font-bold text-nike-gray uppercase tracking-tighter">Try adjusting your search filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const risk = analyzeRisk(records, record.name);
                    return (
                      <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5 font-black text-xs uppercase tracking-tight group-hover:text-nike-green transition-colors">{record.name}</td>
                        <td className="px-8 py-5 text-nike-gray text-[10px] font-bold">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-nike-sm text-[9px] font-black uppercase tracking-widest border ${record.status === 'On Time' ? 'text-nike-green bg-nike-green/5 border-nike-green/10' : 'text-nike-yellow bg-nike-yellow/5 border-nike-yellow/10'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {record.reasonCategory ? (
                            <span className="text-[10px] font-black text-nike-white uppercase tracking-tighter">{record.reasonCategory}</span>
                          ) : (
                            <span className="text-nike-gray/30 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-nike-sm text-[9px] font-black uppercase tracking-widest border ${getRiskColor(risk)}`}>
                            {risk} RELIABILITY
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
