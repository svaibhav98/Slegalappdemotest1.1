// Case Tracker Data Service
// Centralized data layer for MVP - easy to swap with API/Firebase later

export type CaseStatus = 'upcoming' | 'ongoing' | 'closed';
export type CaseType = 'RTI' | 'Consumer' | 'Civil' | 'Criminal' | 'Family' | 'Labour' | 'Property' | 'Other';

export interface CaseReminder {
  id: string;
  caseId: string;
  dateTime: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  type: 'hearing' | 'follow-up' | 'document' | 'custom';
  notes: string;
  notificationEnabled: boolean;
  createdAt: string;
}

export interface Case {
  id: string;
  userId: string;
  title: string;
  caseType: CaseType;
  caseNumber: string;
  court: string;
  city: string;
  petitioner: string;
  respondent: string;
  filingDate: string;
  nextHearingDate: string;
  lastActivityDate: string;
  status: CaseStatus;
  notes: string;
  reminders: CaseReminder[];
  createdAt: string;
  updatedAt: string;
}

// Mock data storage
let CASES_DATA: Case[] = [
  {
    id: 'case-1',
    userId: 'user-1',
    title: 'Water Pollution Control Violation',
    caseType: 'Civil',
    caseNumber: 'LC/CIV/2024/7879',
    court: 'Civil Court',
    city: 'Delhi',
    petitioner: 'Municipal Corporation',
    respondent: 'ABC Industries Ltd',
    filingDate: '2024-03-15',
    nextHearingDate: '2026-03-18',
    lastActivityDate: '2026-01-15',
    status: 'ongoing',
    notes: 'Awaiting environmental report submission',
    reminders: [
      {
        id: 'rem-1',
        caseId: 'case-1',
        dateTime: '2026-03-17T10:00:00',
        repeat: 'none',
        type: 'hearing',
        notes: 'Court hearing tomorrow - prepare documents',
        notificationEnabled: true,
        createdAt: '2026-01-15',
      }
    ],
    createdAt: '2024-03-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'case-2',
    userId: 'user-1',
    title: 'Consumer Complaint vs ABC Electronics',
    caseType: 'Consumer',
    caseNumber: 'CON/2024/456',
    court: 'District Forum',
    city: 'Mumbai',
    petitioner: 'Rajesh Kumar',
    respondent: 'ABC Electronics Pvt Ltd',
    filingDate: '2024-11-20',
    nextHearingDate: '',
    lastActivityDate: '2025-02-05',
    status: 'closed',
    notes: 'Case resolved with full refund + compensation',
    reminders: [],
    createdAt: '2024-11-20',
    updatedAt: '2025-02-05',
  },
  {
    id: 'case-3',
    userId: 'user-1',
    title: 'RTI Application - Land Records',
    caseType: 'RTI',
    caseNumber: 'RTI/2026/1234',
    court: 'Information Commission',
    city: 'Bangalore',
    petitioner: 'Self',
    respondent: 'Revenue Department',
    filingDate: '2026-01-10',
    nextHearingDate: '2026-02-15',
    lastActivityDate: '2026-01-10',
    status: 'upcoming',
    notes: 'Waiting for 30-day response period',
    reminders: [
      {
        id: 'rem-2',
        caseId: 'case-3',
        dateTime: '2026-02-14T09:00:00',
        repeat: 'none',
        type: 'follow-up',
        notes: 'Follow up if no response received',
        notificationEnabled: true,
        createdAt: '2026-01-10',
      }
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'case-4',
    userId: 'user-1',
    title: 'Property Dispute - Ancestral Land',
    caseType: 'Property',
    caseNumber: 'PROP/2024/789',
    court: 'High Court',
    city: 'Chennai',
    petitioner: 'Family Trust',
    respondent: 'State Government',
    filingDate: '2024-06-01',
    nextHearingDate: '2026-04-15',
    lastActivityDate: '2026-01-20',
    status: 'ongoing',
    notes: 'Arguments completed, waiting for judgment',
    reminders: [],
    createdAt: '2024-06-01',
    updatedAt: '2026-01-20',
  },
  {
    id: 'case-5',
    userId: 'user-1',
    title: 'Labour Dispute - Wrongful Termination',
    caseType: 'Labour',
    caseNumber: 'LAB/2026/321',
    court: 'Labour Court',
    city: 'Hyderabad',
    petitioner: 'Employee Union',
    respondent: 'XYZ Corp',
    filingDate: '2026-01-15',
    nextHearingDate: '2026-03-20',
    lastActivityDate: '2026-01-15',
    status: 'upcoming',
    notes: 'First hearing scheduled',
    reminders: [],
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'case-6',
    userId: 'user-1',
    title: 'Traffic Challan Appeal',
    caseType: 'Other',
    caseNumber: 'TRF/2026/999',
    court: 'Traffic Tribunal',
    city: 'Pune',
    petitioner: 'Self',
    respondent: 'Traffic Police',
    filingDate: '2026-01-20',
    nextHearingDate: '2026-05-10',
    lastActivityDate: '2026-01-20',
    status: 'upcoming',
    notes: 'Appealing against wrongful challan',
    reminders: [],
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
];

// Service functions
export const getCases = (userId: string = 'user-1', status?: CaseStatus, searchQuery?: string): Case[] => {
  let results = CASES_DATA.filter(c => c.userId === userId);
  
  if (status) {
    results = results.filter(c => c.status === status);
  }
  
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    results = results.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.caseNumber.toLowerCase().includes(query) ||
      c.petitioner.toLowerCase().includes(query) ||
      c.respondent.toLowerCase().includes(query) ||
      c.court.toLowerCase().includes(query)
    );
  }
  
  // Sort by next hearing date (upcoming first), then by last activity
  results.sort((a, b) => {
    if (a.nextHearingDate && b.nextHearingDate) {
      return new Date(a.nextHearingDate).getTime() - new Date(b.nextHearingDate).getTime();
    }
    return new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime();
  });
  
  return results;
};

export const getCaseById = (id: string): Case | undefined => {
  return CASES_DATA.find(c => c.id === id);
};

export const getCaseCounts = (userId: string = 'user-1'): { all: number; ongoing: number; closed: number; upcoming: number } => {
  const userCases = CASES_DATA.filter(c => c.userId === userId);
  return {
    all: userCases.length,
    ongoing: userCases.filter(c => c.status === 'ongoing').length,
    closed: userCases.filter(c => c.status === 'closed').length,
    upcoming: userCases.filter(c => c.status === 'upcoming').length,
  };
};

export const addCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'reminders'>): Case => {
  const newCase: Case = {
    ...caseData,
    id: `case-${Date.now()}`,
    reminders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  CASES_DATA = [newCase, ...CASES_DATA];
  return newCase;
};

export const updateCase = (id: string, updates: Partial<Case>): Case | undefined => {
  const index = CASES_DATA.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  
  CASES_DATA[index] = {
    ...CASES_DATA[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return CASES_DATA[index];
};

export const updateCaseStatus = (id: string, status: CaseStatus): Case | undefined => {
  return updateCase(id, { 
    status, 
    lastActivityDate: new Date().toISOString().split('T')[0] 
  });
};

export const deleteCase = (id: string): boolean => {
  const initialLength = CASES_DATA.length;
  CASES_DATA = CASES_DATA.filter(c => c.id !== id);
  return CASES_DATA.length < initialLength;
};

export const addReminder = (caseId: string, reminder: Omit<CaseReminder, 'id' | 'caseId' | 'createdAt'>): CaseReminder | undefined => {
  const caseIndex = CASES_DATA.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return undefined;
  
  const newReminder: CaseReminder = {
    ...reminder,
    id: `rem-${Date.now()}`,
    caseId,
    createdAt: new Date().toISOString(),
  };
  
  CASES_DATA[caseIndex].reminders.push(newReminder);
  CASES_DATA[caseIndex].updatedAt = new Date().toISOString();
  
  return newReminder;
};

export const deleteReminder = (caseId: string, reminderId: string): boolean => {
  const caseIndex = CASES_DATA.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return false;
  
  const initialLength = CASES_DATA[caseIndex].reminders.length;
  CASES_DATA[caseIndex].reminders = CASES_DATA[caseIndex].reminders.filter(r => r.id !== reminderId);
  return CASES_DATA[caseIndex].reminders.length < initialLength;
};

export const CASE_TYPES: CaseType[] = ['RTI', 'Consumer', 'Civil', 'Criminal', 'Family', 'Labour', 'Property', 'Other'];

export const REMINDER_TYPES = [
  { id: 'hearing', label: 'Court Hearing', icon: 'business' },
  { id: 'follow-up', label: 'Follow Up', icon: 'call' },
  { id: 'document', label: 'Document Submission', icon: 'document-text' },
  { id: 'custom', label: 'Custom Reminder', icon: 'notifications' },
];

export const getSuggestedReminders = (caseType: CaseType): { type: string; days: number; label: string }[] => {
  switch (caseType) {
    case 'RTI':
      return [
        { type: 'follow-up', days: 30, label: 'RTI Response Due (30 days)' },
        { type: 'follow-up', days: 7, label: 'Follow up in 1 week' },
      ];
    case 'Consumer':
      return [
        { type: 'hearing', days: 15, label: 'Prepare for hearing' },
        { type: 'document', days: 7, label: 'Submit evidence documents' },
      ];
    default:
      return [
        { type: 'hearing', days: 1, label: 'Day before hearing reminder' },
        { type: 'follow-up', days: 7, label: 'Weekly follow up' },
      ];
  }
};
