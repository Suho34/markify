export type AttendanceStatus = 'On Time' | 'Late';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ReasonCategory = 'Traffic' | 'Health' | 'Personal' | 'Other';

export interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: AttendanceStatus;
  reason?: string;
  reasonCategory?: ReasonCategory;
  sessionName?: string;
  studentId?: string; // Reference to registered student
}

export interface Student {
  id: string;
  name: string;
  descriptor: number[]; // Face descriptor array
  enrolledAt: string;
  lastSeen?: string;
}

export const CLASS_TIME = "10:00 AM";

export interface SystemSettings {
  lateCutoff: string;
  sessionName: string;
}

export const getSettings = (): SystemSettings => {
  if (typeof window === 'undefined') return { lateCutoff: '10:00', sessionName: 'General Session' };
  const saved = localStorage.getItem('markify_settings');
  return saved ? JSON.parse(saved) : { lateCutoff: '10:00', sessionName: 'General Session' };
};

export const saveSettings = (settings: SystemSettings) => {
  localStorage.setItem('markify_settings', JSON.stringify(settings));
};

/**
 * Simulated NLP for reason classification
 */
export const classifyReason = (reason: string): ReasonCategory => {
  const r = reason.toLowerCase();
  if (r.includes('traffic') || r.includes('jam') || r.includes('bus') || r.includes('car')) return 'Traffic';
  if (r.includes('sick') || r.includes('fever') || r.includes('doctor') || r.includes('health')) return 'Health';
  if (r.includes('family') || r.includes('work') || r.includes('personal') || r.includes('emergency')) return 'Personal';
  return 'Other';
};

/**
 * Storage utilities
 */
export const getRecords = (): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('attendance_records');
  return data ? JSON.parse(data) : [];
};

export const saveRecord = (record: AttendanceRecord) => {
  const records = getRecords();
  records.push(record);
  localStorage.setItem('attendance_records', JSON.stringify(records));
};

/**
 * Student Registry Storage
 */
export const getStudents = (): Student[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('markify_students');
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (student: Student) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index >= 0) students[index] = student;
  else students.push(student);
  localStorage.setItem('markify_students', JSON.stringify(students));
};

export const deleteStudent = (id: string) => {
  const students = getStudents().filter(s => s.id !== id);
  localStorage.setItem('markify_students', JSON.stringify(students));
};

/**
 * AI Face Matching Logic
 */
export const matchStudent = (descriptor: Float32Array): Student | null => {
  const students = getStudents();
  if (students.length === 0) return null;

  let bestMatch: Student | null = null;
  let minDistance = 0.7; // Standard "snap" threshold for webcams

  for (const student of students) {
    let sum = 0;
    const sDesc = student.descriptor;
    // Manual loop is faster than reduce/pow for tight biometric matching
    for (let i = 0; i < 128; i++) {
      const diff = sDesc[i] - descriptor[i];
      sum += diff * diff;
    }
    const distance = Math.sqrt(sum);

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = student;
    }
  }

  return bestMatch;
};

export const exportRecordsToCSV = (records: AttendanceRecord[]) => {
  const headers = ['Name', 'Timestamp', 'Status', 'Reason', 'Category'];
  const rows = records.map(r => [
    r.name,
    new Date(r.timestamp).toLocaleString(),
    r.status,
    r.reason || 'N/A',
    r.reasonCategory || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `markify_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Pattern Analysis & Risk Detection
 */
export const analyzeRisk = (records: AttendanceRecord[], studentName: string): RiskLevel => {
  const studentRecords = records.filter(r => r.name === studentName && r.status === 'Late');
  
  if (studentRecords.length >= 3) return 'High';
  
  // Check for repeated reasons
  const reasons = studentRecords.map(r => r.reasonCategory).filter(Boolean);
  const reasonCounts = reasons.reduce((acc, curr) => {
    acc[curr!] = (acc[curr!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxRepeat = Math.max(...Object.values(reasonCounts), 0);
  if (maxRepeat >= 2) return 'High';
  
  if (studentRecords.length >= 1) return 'Medium';
  
  return 'Low';
};

export const getAIInsights = (records: AttendanceRecord[]) => {
  const lateRecords = records.filter(r => r.status === 'Late');
  if (lateRecords.length === 0) return ["No significant lateness patterns detected yet."];
  
  const insights = [];
  
  // Most frequent reason
  const reasons = lateRecords.map(r => r.reasonCategory).filter(Boolean);
  const reasonCounts = reasons.reduce((acc, curr) => {
    acc[curr!] = (acc[curr!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  if (sortedReasons.length > 0) {
    insights.push(`${sortedReasons[0][0]} is the most frequent cause of lateness.`);
  }
  
  // Repeated patterns
  const studentStats = lateRecords.reduce((acc, r) => {
    acc[r.name] = (acc[r.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chronicLaters = Object.entries(studentStats).filter(s => s[1] >= 3);
  if (chronicLaters.length > 0) {
    insights.push(`${chronicLaters.length} students show repeated late patterns.`);
    insights.push("High-risk students identified for intervention.");
  }
  
  return insights;
};
