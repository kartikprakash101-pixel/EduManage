import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CoachingInstitute,
  Student,
  FeePayment,
  AttendanceRecord,
  Exam,
  StudentExamResult,
  StudyMaterial,
  AuditLog,
  ExpenseRecord,
  UserRole,
} from '../types';
import {
  INITIAL_INSTITUTES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_MATERIALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXPENSES,
} from '../data/mockData';
import { translations, Language } from '../locales/translations';
import { filterByTenant, computeExamRanks } from '../utils/academicCalculations';

export type AppTab =
  | 'dashboard'
  | 'students'
  | 'fees'
  | 'attendance'
  | 'exams'
  | 'materials'
  | 'reports'
  | 'aiAssistant'
  | 'setupDocs'
  | 'marketingSite';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentInstitute: CoachingInstitute;
  institutes: CoachingInstitute[];
  switchInstitute: (instituteId: string) => void;
  createInstitute: (newInst: Omit<CoachingInstitute, 'id'>) => void;
  
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  
  // Data sets (scoped by tenant)
  students: Student[];
  allStudentsIncludingArchived: Student[];
  payments: FeePayment[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  examResults: StudentExamResult[];
  studyMaterials: StudyMaterial[];
  auditLogs: AuditLog[];
  expenses: ExpenseRecord[];
  
  // Action handlers
  addStudent: (student: Omit<Student, 'id' | 'instituteId' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  restoreStudent: (id: string) => void;
  
  addPayment: (payment: Omit<FeePayment, 'id' | 'instituteId' | 'receiptNo' | 'createdAt'>) => FeePayment;
  
  saveAttendanceBatch: (records: { studentId: string; studentName: string; classGrade: any; date: string; status: any; markedBy: string; remark?: string }[]) => void;
  
  addExam: (exam: Omit<Exam, 'id' | 'instituteId' | 'createdAt'>) => void;
  saveExamResult: (result: Omit<StudentExamResult, 'id' | 'instituteId'>) => void;
  
  addStudyMaterial: (mat: Omit<StudyMaterial, 'id' | 'instituteId' | 'uploadedAt' | 'downloadCount'>) => void;
  incrementMaterialDownload: (id: string) => void;
  
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'instituteId'>) => void;
  
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  t: typeof translations['en'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence key prefix
  const STORAGE_KEY = 'edumanage_state_v1';

  // Load or fallback to initial mocks
  const [institutes, setInstitutes] = useState<CoachingInstitute[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_institutes`);
      return saved ? JSON.parse(saved) : INITIAL_INSTITUTES;
    } catch {
      return INITIAL_INSTITUTES;
    }
  });

  const [currentInstituteId, setCurrentInstituteId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_current_inst`);
      return saved || INITIAL_INSTITUTES[0].id;
    } catch {
      return INITIAL_INSTITUTES[0].id;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [allPayments, setAllPayments] = useState<FeePayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [allExams, setAllExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  const [allResults, setAllResults] = useState<StudentExamResult[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_results`);
      return saved ? JSON.parse(saved) : INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  });

  const [allMaterials, setAllMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_materials`);
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [allLogs, setAllLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [allExpenses, setAllExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to localStorage for demo persistence
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_institutes`, JSON.stringify(institutes));
      localStorage.setItem(`${STORAGE_KEY}_current_inst`, currentInstituteId);
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(allStudents));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(allPayments));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(allAttendance));
      localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(allExams));
      localStorage.setItem(`${STORAGE_KEY}_results`, JSON.stringify(allResults));
      localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(allMaterials));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(allLogs));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(allExpenses));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [
    institutes,
    currentInstituteId,
    allStudents,
    allPayments,
    allAttendance,
    allExams,
    allResults,
    allMaterials,
    allLogs,
    allExpenses,
  ]);

  const currentInstitute =
    institutes.find((i) => i.id === currentInstituteId) || institutes[0];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      instituteId: currentInstituteId,
      timestamp: new Date().toISOString(),
      userName: currentRole === 'owner' ? 'Institute Director' : currentRole.toUpperCase(),
      userRole: currentRole,
      action,
      details,
      ipAddress: '127.0.0.1 (Local Session)',
    };
    setAllLogs((prev) => [newLog, ...prev]);
  };

  // Tenant-scoped records
  const tenantStudents = filterByTenant(allStudents, currentInstituteId);
  const activeStudents = tenantStudents.filter((s) => s.status === 'active');
  const tenantPayments = filterByTenant(allPayments, currentInstituteId);
  const tenantAttendance = filterByTenant(allAttendance, currentInstituteId);
  const tenantExams = filterByTenant(allExams, currentInstituteId);
  const tenantResults = filterByTenant(allResults, currentInstituteId);
  const tenantMaterials = filterByTenant(allMaterials, currentInstituteId);
  const tenantLogs = filterByTenant(allLogs, currentInstituteId);
  const tenantExpenses = filterByTenant(allExpenses, currentInstituteId);

  // Switch institute
  const switchInstitute = (instId: string) => {
    setCurrentInstituteId(instId);
    showToast(`Switched coaching institute workspace`, 'info');
  };

  // Create new institute
  const createInstitute = (newInst: Omit<CoachingInstitute, 'id'>) => {
    const id = `inst-${Date.now()}`;
    const institute: CoachingInstitute = { ...newInst, id };
    setInstitutes((prev) => [...prev, institute]);
    setCurrentInstituteId(id);
    showToast(`Created institute workspace: ${institute.name}`, 'success');
  };

  // Switch Role
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    showToast(`Switched active view to ${role.toUpperCase()}`, 'info');
  };

  // Add Student
  const addStudent = (studentData: Omit<Student, 'id' | 'instituteId' | 'createdAt' | 'updatedAt'>) => {
    const id = `std-${Date.now()}`;
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id,
      instituteId: currentInstituteId,
      createdAt: now,
      updatedAt: now,
    };
    setAllStudents((prev) => [newStudent, ...prev]);
    logAction('Student Admission', `Enrolled ${newStudent.fullName} in ${newStudent.classGrade} (Roll: ${newStudent.rollNo})`);
    showToast(`Student ${newStudent.fullName} successfully registered!`, 'success');
  };

  // Update Student
  const updateStudent = (id: string, updates: Partial<Student>) => {
    setAllStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
    logAction('Student Updated', `Updated details for student ID ${id}`);
    showToast(`Student information updated successfully.`, 'success');
  };

  // Archive Student
  const archiveStudent = (id: string) => {
    setAllStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'archived', updatedAt: new Date().toISOString() } : s))
    );
    logAction('Student Archived', `Archived student ID ${id}`);
    showToast(`Student record archived.`, 'info');
  };

  // Restore Student
  const restoreStudent = (id: string) => {
    setAllStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'active', updatedAt: new Date().toISOString() } : s))
    );
    logAction('Student Restored', `Restored student ID ${id} to active list`);
    showToast(`Student restored to active directory.`, 'success');
  };

  // Add Payment
  const addPayment = (paymentData: Omit<FeePayment, 'id' | 'instituteId' | 'receiptNo' | 'createdAt'>): FeePayment => {
    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `REC-${currentYear}-${randomSeq}`;
    const newPayment: FeePayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      instituteId: currentInstituteId,
      receiptNo,
      createdAt: new Date().toISOString(),
    };

    setAllPayments((prev) => [newPayment, ...prev]);
    logAction(
      'Fee Payment Received',
      `Issued ${receiptNo} for ${newPayment.studentName}: ₹${newPayment.amount} via ${newPayment.paymentMethod}`
    );
    showToast(`Payment of ₹${newPayment.amount} recorded! Receipt: ${receiptNo}`, 'success');
    return newPayment;
  };

  // Save Attendance Batch
  const saveAttendanceBatch = (
    records: { studentId: string; studentName: string; classGrade: any; date: string; status: any; markedBy: string; remark?: string }[]
  ) => {
    const now = new Date().toISOString();
    setAllAttendance((prev) => {
      // Overwrite entries for same student and date to prevent duplicate sessions
      const existingFiltered = prev.filter(
        (existing) =>
          !(
            existing.instituteId === currentInstituteId &&
            records.some((r) => r.studentId === existing.studentId && r.date === existing.date)
          )
      );

      const newEntries: AttendanceRecord[] = records.map((r, idx) => ({
        ...r,
        id: `att-${Date.now()}-${idx}`,
        instituteId: currentInstituteId,
        updatedAt: now,
      }));

      return [...newEntries, ...existingFiltered];
    });

    logAction('Attendance Recorded', `Saved attendance register for ${records.length} students on ${records[0]?.date}`);
    showToast(`Attendance marked for ${records.length} students!`, 'success');
  };

  // Add Exam
  const addExam = (examData: Omit<Exam, 'id' | 'instituteId' | 'createdAt'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
      instituteId: currentInstituteId,
      createdAt: new Date().toISOString(),
    };
    setAllExams((prev) => [newExam, ...prev]);
    logAction('Exam Scheduled', `Created exam "${newExam.title}" for ${newExam.classGrade}`);
    showToast(`Exam "${newExam.title}" created successfully!`, 'success');
  };

  // Save Exam Result
  const saveExamResult = (resultData: Omit<StudentExamResult, 'id' | 'instituteId'>) => {
    const id = `res-${Date.now()}`;
    const newResult: StudentExamResult = {
      ...resultData,
      id,
      instituteId: currentInstituteId,
    };

    setAllResults((prev) => {
      const filtered = prev.filter(
        (r) => !(r.instituteId === currentInstituteId && r.examId === newResult.examId && r.studentId === newResult.studentId)
      );
      const combined = [...filtered, newResult];
      // Recalculate ranks for this exam
      const thisExamResults = combined.filter((r) => r.instituteId === currentInstituteId && r.examId === newResult.examId);
      const otherExamResults = combined.filter((r) => !(r.instituteId === currentInstituteId && r.examId === newResult.examId));
      const ranked = computeExamRanks(thisExamResults);
      return [...ranked, ...otherExamResults];
    });

    logAction('Exam Marks Entered', `Marks recorded for ${newResult.studentName} (${newResult.percentage}%)`);
    showToast(`Marks and grade saved for ${newResult.studentName}!`, 'success');
  };

  // Add Study Material
  const addStudyMaterial = (matData: Omit<StudyMaterial, 'id' | 'instituteId' | 'uploadedAt' | 'downloadCount'>) => {
    const newMaterial: StudyMaterial = {
      ...matData,
      id: `mat-${Date.now()}`,
      instituteId: currentInstituteId,
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadCount: 0,
    };
    setAllMaterials((prev) => [newMaterial, ...prev]);
    logAction('Study Material Uploaded', `Uploaded "${newMaterial.title}" for ${newMaterial.classGrade} ${newMaterial.subject}`);
    showToast(`Study material "${newMaterial.title}" published!`, 'success');
  };

  const incrementMaterialDownload = (id: string) => {
    setAllMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
    );
  };

  // Add Expense
  const addExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'instituteId'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      instituteId: currentInstituteId,
    };
    setAllExpenses((prev) => [newExpense, ...prev]);
    logAction('Expense Logged', `Logged expense ₹${newExpense.amount} for ${newExpense.title}`);
    showToast(`Expense of ₹${newExpense.amount} recorded!`, 'success');
  };

  const t = translations[currentLanguage];

  return (
    <AppContext.Provider
      value={{
        currentInstitute,
        institutes,
        switchInstitute,
        createInstitute,
        currentRole,
        switchRole,
        currentLanguage,
        setLanguage: setCurrentLanguage,
        activeTab,
        setActiveTab,
        students: activeStudents,
        allStudentsIncludingArchived: tenantStudents,
        payments: tenantPayments,
        attendance: tenantAttendance,
        exams: tenantExams,
        examResults: tenantResults,
        studyMaterials: tenantMaterials,
        auditLogs: tenantLogs,
        expenses: tenantExpenses,
        addStudent,
        updateStudent,
        archiveStudent,
        restoreStudent,
        addPayment,
        saveAttendanceBatch,
        addExam,
        saveExamResult,
        addStudyMaterial,
        incrementMaterialDownload,
        addExpense,
        toasts,
        showToast,
        removeToast,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
