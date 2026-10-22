export type ClassGrade = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

export type UserRole = 'owner' | 'teacher' | 'accountant' | 'parent';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  instituteId: string;
  admissionNo: string;
  rollNo: string;
  fullName: string;
  classGrade: ClassGrade;
  stream?: 'General' | 'PCM' | 'PCB' | 'Commerce' | 'Arts';
  admissionDate: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email?: string;
  guardianName: string;
  guardianRelation: 'Father' | 'Mother' | 'Guardian';
  guardianPhone: string;
  address: string;
  totalAgreedFee: number; // in INR
  status: 'active' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  id: string;
  instituteId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  classGrade: ClassGrade;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string; // UPI ref / UTR / Cheque No
  monthOrTerm: string;
  collectedBy: string;
  notes?: string;
  status: 'verified' | 'pending_verification' | 'cancelled';
  auditLog?: string[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  instituteId: string;
  studentId: string;
  studentName: string;
  classGrade: ClassGrade;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  remark?: string;
  updatedAt?: string;
}

export interface SubjectMarks {
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
}

export interface Exam {
  id: string;
  instituteId: string;
  title: string;
  classGrade: ClassGrade;
  academicTerm: string;
  examDate: string;
  totalMaxMarks: number;
  subjects: string[];
  createdAt: string;
}

export interface StudentExamResult {
  id: string;
  instituteId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classGrade: ClassGrade;
  subjects: SubjectMarks[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
  rank?: number;
  teacherRemarks?: string;
}

export interface StudyMaterial {
  id: string;
  instituteId: string;
  title: string;
  classGrade: ClassGrade;
  subject: string;
  chapter: string;
  fileType: 'PDF' | 'DOCX' | 'IMAGE';
  fileSizeMb: number;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  description?: string;
}

export interface AuditLog {
  id: string;
  instituteId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface CoachingInstitute {
  id: string;
  name: string;
  tagline: string;
  code: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  establishedYear: number;
  currencySymbol: string;
  taxGstNo?: string;
  logoInitial: string;
}

export interface ExpenseRecord {
  id: string;
  instituteId: string;
  title: string;
  category: 'Rent' | 'Electricity & Bills' | 'Faculty Salaries' | 'Study Materials & Print' | 'Marketing' | 'Maintenance';
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
