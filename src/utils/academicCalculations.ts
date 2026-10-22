import { Student, FeePayment, AttendanceRecord, SubjectMarks, StudentExamResult, ClassGrade } from '../types';

/**
 * Format amounts into Indian Rupee format (e.g., ₹2,50,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const s = absAmount.toString();
  
  if (s.length <= 3) {
    return `${isNegative ? '-' : ''}₹${s}`;
  }
  
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return `${isNegative ? '-' : ''}₹${formattedOthers},${lastThree}`;
}

/**
 * Calculate fee balances for a student
 */
export function calculateStudentFeeSummary(
  student: Student,
  payments: FeePayment[]
): {
  totalAgreedFee: number;
  totalPaid: number;
  pendingBalance: number;
  status: 'fully_paid' | 'partial' | 'unpaid' | 'overpaid';
  lastPaymentDate?: string;
} {
  const studentPayments = payments.filter(
    (p) => p.studentId === student.id && p.status === 'verified'
  );
  
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAgreedFee = student.totalAgreedFee || 0;
  const pendingBalance = totalAgreedFee - totalPaid;

  let status: 'fully_paid' | 'partial' | 'unpaid' | 'overpaid' = 'unpaid';
  if (totalPaid === 0) {
    status = 'unpaid';
  } else if (pendingBalance === 0) {
    status = 'fully_paid';
  } else if (pendingBalance < 0) {
    status = 'overpaid';
  } else {
    status = 'partial';
  }

  const sorted = [...studentPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return {
    totalAgreedFee,
    totalPaid,
    pendingBalance,
    status,
    lastPaymentDate: sorted[0]?.paymentDate,
  };
}

/**
 * Calculate attendance rate and stats for a student
 */
export function calculateAttendanceStats(
  studentId: string,
  records: AttendanceRecord[]
): {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  percentage: number;
  category: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
} {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  const totalSessions = studentRecords.length;

  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      percentage: 100,
      category: 'Good',
    };
  }

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  for (const record of studentRecords) {
    if (record.status === 'present') presentCount++;
    else if (record.status === 'absent') absentCount++;
    else if (record.status === 'late') {
      lateCount++;
      presentCount++; // usually counted as present with note
    } else if (record.status === 'excused') {
      presentCount++;
    }
  }

  const percentage = Math.round((presentCount / totalSessions) * 100);

  let category: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
  if (percentage >= 90) category = 'Excellent';
  else if (percentage >= 75) category = 'Good';
  else if (percentage >= 60) category = 'Needs Attention';
  else category = 'Critical';

  return {
    totalSessions,
    presentCount,
    absentCount,
    lateCount,
    percentage,
    category,
  };
}

/**
 * Standard CBSE Grading Scale
 * 91-100: A1
 * 81-90: A2
 * 71-80: B1
 * 61-70: B2
 * 51-60: C1
 * 41-50: C2
 * 33-40: D
 * < 33: E (Needs Improvement)
 */
export function calculateGrade(percentage: number): {
  grade: string;
  remark: string;
  isPassing: boolean;
} {
  if (percentage >= 91) return { grade: 'A1', remark: 'Outstanding Performance', isPassing: true };
  if (percentage >= 81) return { grade: 'A2', remark: 'Excellent Performance', isPassing: true };
  if (percentage >= 71) return { grade: 'B1', remark: 'Very Good Performance', isPassing: true };
  if (percentage >= 61) return { grade: 'B2', remark: 'Good Performance', isPassing: true };
  if (percentage >= 51) return { grade: 'C1', remark: 'Satisfactory Performance', isPassing: true };
  if (percentage >= 41) return { grade: 'C2', remark: 'Average Performance', isPassing: true };
  if (percentage >= 33) return { grade: 'D', remark: 'Marginal Pass - Needs Work', isPassing: true };
  return { grade: 'E', remark: 'Needs Improvement / Remedial Support', isPassing: false };
}

/**
 * Compute ranks with Standard Competition Ranking (1224)
 * Ties share the same rank, and subsequent rank skips accordingly.
 */
export function computeExamRanks(results: StudentExamResult[]): StudentExamResult[] {
  // Sort descending by totalObtained
  const sorted = [...results].sort((a, b) => b.totalObtained - a.totalObtained);

  let currentRank = 1;
  return sorted.map((res, index) => {
    if (index > 0 && res.totalObtained < sorted[index - 1].totalObtained) {
      currentRank = index + 1;
    }
    return {
      ...res,
      rank: currentRank,
    };
  });
}

/**
 * Validates a payment amount against pending fee
 */
export function validatePaymentAmount(
  amount: number,
  pendingBalance: number
): {
  isValid: boolean;
  isExcessive: boolean;
  errorMessage?: string;
  warningMessage?: string;
} {
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      isExcessive: false,
      errorMessage: 'Payment amount must be greater than ₹0.',
    };
  }

  if (amount > 1000000) {
    return {
      isValid: false,
      isExcessive: true,
      errorMessage: 'Payment amount exceeds maximum single transaction limit of ₹10,00,000.',
    };
  }

  if (amount > pendingBalance && pendingBalance > 0) {
    return {
      isValid: true,
      isExcessive: true,
      warningMessage: `Entered amount (${formatINR(amount)}) exceeds current pending balance (${formatINR(pendingBalance)}). Confirm if this is an advance payment for future months.`,
    };
  }

  return { isValid: true, isExcessive: false };
}

/**
 * Generates CSV content from raw objects
 */
export function generateCSV<T extends Record<string, unknown>>(
  headers: { key: keyof T; label: string }[],
  rows: T[]
): string {
  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const dataRows = rows.map((row) => {
    return headers
      .map((h) => {
        const val = row[h.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Tenant Isolation check helper
 */
export function filterByTenant<T extends { instituteId: string }>(
  items: T[],
  currentInstituteId: string
): T[] {
  return items.filter((item) => item.instituteId === currentInstituteId);
}
