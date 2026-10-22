import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  calculateStudentFeeSummary,
  calculateAttendanceStats,
  calculateGrade,
  computeExamRanks,
  validatePaymentAmount,
  filterByTenant,
} from './academicCalculations';
import { Student, FeePayment, AttendanceRecord, StudentExamResult } from '../types';

test('formatINR formats numbers into Indian Lakhs/Thousands notation correctly', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(500), '₹500');
  assert.equal(formatINR(1200), '₹1,200');
  assert.equal(formatINR(45000), '₹45,000');
  assert.equal(formatINR(150000), '₹1,50,000');
  assert.equal(formatINR(2450000), '₹24,50,000');
  assert.equal(formatINR(-5000), '-₹5,000');
});

test('calculateStudentFeeSummary accurately tracks dues, partial payments, and status', () => {
  const dummyStudent: Student = {
    id: 's1',
    instituteId: 'inst-1',
    admissionNo: 'ADM-101',
    rollNo: '101',
    fullName: 'Rohan Sharma',
    classGrade: 'Class 10',
    admissionDate: '2026-04-01',
    gender: 'Male',
    dob: '2010-05-15',
    phone: '9876543210',
    guardianName: 'Manoj Sharma',
    guardianRelation: 'Father',
    guardianPhone: '9876543211',
    address: 'Jaipur, Rajasthan',
    totalAgreedFee: 36000,
    status: 'active',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  };

  const payments: FeePayment[] = [
    {
      id: 'p1',
      instituteId: 'inst-1',
      receiptNo: 'REC-001',
      studentId: 's1',
      studentName: 'Rohan Sharma',
      classGrade: 'Class 10',
      amount: 12000,
      paymentDate: '2026-04-05',
      paymentMethod: 'UPI',
      monthOrTerm: 'Term 1',
      collectedBy: 'Admin',
      status: 'verified',
      createdAt: '2026-04-05',
    },
    {
      id: 'p2',
      instituteId: 'inst-1',
      receiptNo: 'REC-002',
      studentId: 's1',
      studentName: 'Rohan Sharma',
      classGrade: 'Class 10',
      amount: 12000,
      paymentDate: '2026-07-10',
      paymentMethod: 'Cash',
      monthOrTerm: 'Term 2',
      collectedBy: 'Admin',
      status: 'verified',
      createdAt: '2026-07-10',
    },
  ];

  const summary = calculateStudentFeeSummary(dummyStudent, payments);
  assert.equal(summary.totalAgreedFee, 36000);
  assert.equal(summary.totalPaid, 24000);
  assert.equal(summary.pendingBalance, 12000);
  assert.equal(summary.status, 'partial');
  assert.equal(summary.lastPaymentDate, '2026-07-10');
});

test('calculateAttendanceStats computes percentages and categories correctly', () => {
  const records: AttendanceRecord[] = [
    { id: '1', instituteId: 'inst-1', studentId: 's1', studentName: 'Rohan', classGrade: 'Class 10', date: '2026-10-01', status: 'present', markedBy: 'T1' },
    { id: '2', instituteId: 'inst-1', studentId: 's1', studentName: 'Rohan', classGrade: 'Class 10', date: '2026-10-02', status: 'present', markedBy: 'T1' },
    { id: '3', instituteId: 'inst-1', studentId: 's1', studentName: 'Rohan', classGrade: 'Class 10', date: '2026-10-03', status: 'late', markedBy: 'T1' },
    { id: '4', instituteId: 'inst-1', studentId: 's1', studentName: 'Rohan', classGrade: 'Class 10', date: '2026-10-04', status: 'absent', markedBy: 'T1' },
  ];

  const stats = calculateAttendanceStats('s1', records);
  assert.equal(stats.totalSessions, 4);
  assert.equal(stats.absentCount, 1);
  assert.equal(stats.percentage, 75); // 3 out of 4 is 75%
  assert.equal(stats.category, 'Good');
});

test('calculateGrade follows standard CBSE criteria', () => {
  assert.equal(calculateGrade(95).grade, 'A1');
  assert.equal(calculateGrade(85).grade, 'A2');
  assert.equal(calculateGrade(72).grade, 'B1');
  assert.equal(calculateGrade(64).grade, 'B2');
  assert.equal(calculateGrade(55).grade, 'C1');
  assert.equal(calculateGrade(45).grade, 'C2');
  assert.equal(calculateGrade(35).grade, 'D');
  assert.equal(calculateGrade(28).grade, 'E');
  assert.equal(calculateGrade(28).isPassing, false);
});

test('computeExamRanks handles rank ties cleanly using standard competition ranking', () => {
  const dummyResults: StudentExamResult[] = [
    {
      id: 'r1',
      instituteId: 'inst-1',
      examId: 'e1',
      examTitle: 'Term 1 Exam',
      studentId: 's1',
      studentName: 'Aarav',
      rollNo: '01',
      classGrade: 'Class 10',
      subjects: [],
      totalObtained: 280,
      totalMax: 300,
      percentage: 93.3,
      grade: 'A1',
    },
    {
      id: 'r2',
      instituteId: 'inst-1',
      examId: 'e1',
      examTitle: 'Term 1 Exam',
      studentId: 's2',
      studentName: 'Priya',
      rollNo: '02',
      classGrade: 'Class 10',
      subjects: [],
      totalObtained: 290,
      totalMax: 300,
      percentage: 96.6,
      grade: 'A1',
    },
    {
      id: 'r3',
      instituteId: 'inst-1',
      examId: 'e1',
      examTitle: 'Term 1 Exam',
      studentId: 's3',
      studentName: 'Kabir',
      rollNo: '03',
      classGrade: 'Class 10',
      subjects: [],
      totalObtained: 280, // Tie with Aarav
      totalMax: 300,
      percentage: 93.3,
      grade: 'A1',
    },
    {
      id: 'r4',
      instituteId: 'inst-1',
      examId: 'e1',
      examTitle: 'Term 1 Exam',
      studentId: 's4',
      studentName: 'Ananya',
      rollNo: '04',
      classGrade: 'Class 10',
      subjects: [],
      totalObtained: 250,
      totalMax: 300,
      percentage: 83.3,
      grade: 'A2',
    },
  ];

  const ranked = computeExamRanks(dummyResults);
  // Expected ranks:
  // Priya (290) -> Rank 1
  // Aarav (280) -> Rank 2
  // Kabir (280) -> Rank 2
  // Ananya (250) -> Rank 4 (competition ranking skips 3)
  assert.equal(ranked[0].studentName, 'Priya');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[2].rank, 2);
  assert.equal(ranked[3].studentName, 'Ananya');
  assert.equal(ranked[3].rank, 4);
});

test('validatePaymentAmount prevents negative/zero and flags excessive amounts', () => {
  assert.equal(validatePaymentAmount(0, 10000).isValid, false);
  assert.equal(validatePaymentAmount(-500, 10000).isValid, false);
  
  const normal = validatePaymentAmount(5000, 10000);
  assert.equal(normal.isValid, true);
  assert.equal(normal.isExcessive, false);

  const excessive = validatePaymentAmount(15000, 10000);
  assert.equal(excessive.isValid, true);
  assert.equal(excessive.isExcessive, true);
  assert.ok(excessive.warningMessage?.includes('exceeds current pending balance'));
});

test('filterByTenant prevents cross-institute data leakage', () => {
  const items = [
    { id: '1', instituteId: 'inst-A', name: 'Student A' },
    { id: '2', instituteId: 'inst-B', name: 'Student B' },
    { id: '3', instituteId: 'inst-A', name: 'Student C' },
  ];
  const isolated = filterByTenant(items, 'inst-A');
  assert.equal(isolated.length, 2);
  assert.ok(isolated.every((i) => i.instituteId === 'inst-A'));
});
