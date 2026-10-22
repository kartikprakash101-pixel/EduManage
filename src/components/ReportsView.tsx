import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  generateCSV,
  formatINR,
  calculateStudentFeeSummary,
  calculateAttendanceStats,
} from '../utils/academicCalculations';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Receipt,
  CalendarCheck2,
  GraduationCap,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    students,
    payments,
    attendance,
    examResults,
    auditLogs,
    expenses,
    currentInstitute,
    t,
    showToast,
  } = useApp();

  type ReportType = 'fees' | 'attendance' | 'performance' | 'expenses' | 'audit';
  const [activeReport, setActiveReport] = useState<ReportType>('fees');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Helper to trigger browser CSV download
  const triggerDownload = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded CSV: ${filename}`, 'success');
  };

  // 1. Fee Collection & Dues CSV Export
  const exportFeesCSV = () => {
    const headers = [
      { key: 'admissionNo', label: 'Admission No' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'fullName', label: 'Student Name' },
      { key: 'classGrade', label: 'Class' },
      { key: 'guardianName', label: 'Parent / Guardian' },
      { key: 'guardianPhone', label: 'Contact Phone' },
      { key: 'totalAgreedFee', label: 'Total Course Fee (INR)' },
      { key: 'totalPaid', label: 'Total Paid (INR)' },
      { key: 'pendingBalance', label: 'Pending Due (INR)' },
      { key: 'feeStatus', label: 'Payment Status' },
      { key: 'lastPaymentDate', label: 'Last Payment Date' },
    ];

    const rows = students
      .filter((s) => (selectedClass === 'all' ? true : s.classGrade === selectedClass))
      .map((s) => {
        const sum = calculateStudentFeeSummary(s, payments);
        return {
          admissionNo: s.admissionNo,
          rollNo: s.rollNo,
          fullName: s.fullName,
          classGrade: s.classGrade,
          guardianName: s.guardianName,
          guardianPhone: s.guardianPhone,
          totalAgreedFee: sum.totalAgreedFee,
          totalPaid: sum.totalPaid,
          pendingBalance: sum.pendingBalance,
          feeStatus: sum.status.toUpperCase(),
          lastPaymentDate: sum.lastPaymentDate || 'N/A',
        };
      });

    const csv = generateCSV(headers as any, rows as any);
    triggerDownload(`${currentInstitute.code}_Fee_Ledger_Report.csv`, csv);
  };

  // 2. Attendance Register CSV Export
  const exportAttendanceCSV = () => {
    const headers = [
      { key: 'date', label: 'Date (YYYY-MM-DD)' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'classGrade', label: 'Class' },
      { key: 'status', label: 'Status' },
      { key: 'markedBy', label: 'Faculty Incharge' },
      { key: 'remark', label: 'Remarks / Excuses' },
    ];

    const rows = attendance
      .filter((a) => (selectedClass === 'all' ? true : a.classGrade === selectedClass))
      .map((a) => ({
        date: a.date,
        studentName: a.studentName,
        classGrade: a.classGrade,
        status: a.status.toUpperCase(),
        markedBy: a.markedBy,
        remark: a.remark || 'N/A',
      }));

    const csv = generateCSV(headers as any, rows as any);
    triggerDownload(`${currentInstitute.code}_Attendance_Register.csv`, csv);
  };

  // 3. Performance / Results CSV Export
  const exportPerformanceCSV = () => {
    const headers = [
      { key: 'examTitle', label: 'Exam Name' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'studentName', label: 'Student' },
      { key: 'classGrade', label: 'Class' },
      { key: 'totalObtained', label: 'Marks Obtained' },
      { key: 'totalMax', label: 'Max Marks' },
      { key: 'percentage', label: 'Percentage (%)' },
      { key: 'grade', label: 'CBSE Grade' },
      { key: 'rank', label: 'Rank' },
      { key: 'teacherRemarks', label: 'Faculty Remarks' },
    ];

    const rows = examResults
      .filter((r) => (selectedClass === 'all' ? true : r.classGrade === selectedClass))
      .map((r) => ({
        examTitle: r.examTitle,
        rollNo: r.rollNo,
        studentName: r.studentName,
        classGrade: r.classGrade,
        totalObtained: r.totalObtained,
        totalMax: r.totalMax,
        percentage: `${r.percentage}%`,
        grade: r.grade,
        rank: r.rank ? `#${r.rank}` : 'N/A',
        teacherRemarks: r.teacherRemarks || '',
      }));

    const csv = generateCSV(headers as any, rows as any);
    triggerDownload(`${currentInstitute.code}_Exam_Results_Report.csv`, csv);
  };

  // 4. Income & Expenses Ledger CSV Export
  const exportExpensesCSV = () => {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'title', label: 'Transaction Description' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'paidTo', label: 'Paid To' },
      { key: 'paymentMethod', label: 'Payment Mode' },
    ];

    const csv = generateCSV(headers as any, expenses as any);
    triggerDownload(`${currentInstitute.code}_Expense_Register.csv`, csv);
  };

  // 5. System Audit Log CSV Export
  const exportAuditCSV = () => {
    const headers = [
      { key: 'timestamp', label: 'Timestamp (UTC)' },
      { key: 'userName', label: 'User Name' },
      { key: 'userRole', label: 'Role' },
      { key: 'action', label: 'Action' },
      { key: 'details', label: 'Activity Details' },
      { key: 'ipAddress', label: 'IP Address' },
    ];

    const csv = generateCSV(headers as any, auditLogs as any);
    triggerDownload(`${currentInstitute.code}_Security_Audit_Logs.csv`, csv);
  };

  // Calculation totals
  const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.reports.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.reports.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.reports.printReport}</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveReport('fees')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReport === 'fees'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t.reports.feesReport}</span>
        </button>

        <button
          onClick={() => setActiveReport('attendance')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReport === 'attendance'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck2 className="w-3.5 h-3.5" />
          <span>{t.reports.attendanceReport}</span>
        </button>

        <button
          onClick={() => setActiveReport('performance')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReport === 'performance'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{t.reports.performanceReport}</span>
        </button>

        <button
          onClick={() => setActiveReport('expenses')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReport === 'expenses'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Income & Expenses</span>
        </button>

        <button
          onClick={() => setActiveReport('audit')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeReport === 'audit'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.reports.auditReport}</span>
        </button>
      </div>

      {/* 1. FEES REPORT VIEW */}
      {activeReport === 'fees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Comprehensive student fee register with total agreed course fee, amount paid, and pending balance.
            </span>
            <button
              onClick={exportFeesCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.reports.exportCSV}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Agreed Fee</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Pending Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const fee = calculateStudentFeeSummary(student, payments);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono">{student.admissionNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{student.fullName}</td>
                      <td className="py-3 px-4">{student.classGrade}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatINR(fee.totalAgreedFee)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                        {formatINR(fee.totalPaid)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={fee.pendingBalance > 0 ? 'text-amber-700' : 'text-slate-400'}>
                          {formatINR(fee.pendingBalance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold uppercase text-[10px]">
                          {fee.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE REPORT VIEW */}
      {activeReport === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Daily session attendance register across all classes.
            </span>
            <button
              onClick={exportAttendanceCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.reports.exportCSV}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Faculty Incharge</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono">{att.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{att.studentName}</td>
                    <td className="py-3 px-4">{att.classGrade}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold uppercase text-[11px] ${
                          att.status === 'present'
                            ? 'text-emerald-700'
                            : att.status === 'absent'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{att.markedBy}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{att.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE REPORT VIEW */}
      {activeReport === 'performance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Academic score sheets, totals, percentages, and CBSE grades with rank calculation.
            </span>
            <button
              onClick={exportPerformanceCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.reports.exportCSV}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Marks</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">CBSE Grade</th>
                  <th className="py-3 px-4 text-center">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {examResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-medium text-slate-800">{res.examTitle}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{res.studentName}</td>
                    <td className="py-3 px-4">{res.classGrade}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {res.totalObtained} / {res.totalMax}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                      {res.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{res.grade}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {res.rank ? `#${res.rank}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INCOME & EXPENSES VIEW */}
      {activeReport === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-medium">
                Total Fee Revenue (Inflow)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {formatINR(totalIncome)}
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-medium">
                Total Operating Expenses
              </span>
              <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                {formatINR(totalExpense)}
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Net Operating Surplus</span>
              <div className="text-xl font-bold font-mono text-blue-800 mt-0.5">
                {formatINR(netSurplus)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Institute expenditure ledger covering building rent, faculty honorarium, printing, and electricity.
            </span>
            <button
              onClick={exportExpensesCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.reports.exportCSV}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Title / Purpose</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono">{exp.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{exp.title}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-700">{exp.paidTo}</td>
                    <td className="py-3 px-4">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. AUDIT LOGS VIEW */}
      {activeReport === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Tamper-evident system activity audit trail recording administrative actions, attendance submissions, and fee collections.
            </span>
            <button
              onClick={exportAuditCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600">
                      {log.userRole}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
