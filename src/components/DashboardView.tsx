import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, calculateStudentFeeSummary, calculateAttendanceStats } from '../utils/academicCalculations';
import {
  Users,
  CreditCard,
  CalendarCheck2,
  TrendingUp,
  UserPlus,
  Receipt,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Search,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    students,
    payments,
    attendance,
    currentInstitute,
    setActiveTab,
    currentRole,
    t,
  } = useApp();

  const [studentSearch, setStudentSearch] = useState('');

  // 1. KPI Calculations
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;

  const totalAgreedFee = students.reduce((acc, s) => acc + (s.totalAgreedFee || 0), 0);
  const totalFeesCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingFees = Math.max(0, totalAgreedFee - totalFeesCollected);

  // Today's attendance
  const today = '2026-10-22';
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentToday = todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const todayAttendanceRate = todayRecords.length > 0
    ? Math.round((presentToday / todayRecords.length) * 100)
    : 92; // Realistic fallback for demo

  // Students with pending balance > ₹15,000
  const studentsWithDues = students
    .map((s) => {
      const summary = calculateStudentFeeSummary(s, payments);
      return { student: s, summary };
    })
    .filter((item) => item.summary.pendingBalance > 15000)
    .sort((a, b) => b.summary.pendingBalance - a.summary.pendingBalance);

  // Filtered recent students for quick table
  const filteredStudents = students
    .filter((s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.includes(studentSearch) ||
      s.classGrade.toLowerCase().includes(studentSearch.toLowerCase())
    )
    .slice(0, 6);

  // Monthly breakdown mock
  const monthlyData = [
    { month: 'Apr', amount: 165000 },
    { month: 'May', amount: 75000 },
    { month: 'Jun', amount: 48000 },
    { month: 'Jul', amount: 82000 },
    { month: 'Aug', amount: 62000 },
    { month: 'Sep', amount: 95000 },
    { month: 'Oct', amount: 58000 },
  ];
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentInstitute.name}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {t.dashboard.subtitle} · {currentInstitute.city}, {currentInstitute.state}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {(currentRole === 'owner' || currentRole === 'teacher') && (
            <button
              onClick={() => setActiveTab('students')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.dashboard.addStudent}</span>
            </button>
          )}

          {(currentRole === 'owner' || currentRole === 'accountant') && (
            <button
              onClick={() => setActiveTab('fees')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.dashboard.recordPayment}</span>
            </button>
          )}

          {(currentRole === 'owner' || currentRole === 'teacher') && (
            <button
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <CalendarCheck2 className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.dashboard.markAttendance}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('aiAssistant')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Tools</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t.dashboard.totalStudents}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeStudentsCount}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Enrolled across Classes 6 to 12</span>
          </div>
        </div>

        {/* Fees Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t.dashboard.feesCollected}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatINR(totalFeesCollected)}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{payments.length} verified receipts</span>
            <span>· UPI & Cash</span>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t.dashboard.pendingFees}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatINR(pendingFees)}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{studentsWithDues.length} students with balance</span>
          </div>
        </div>

        {/* Today's Attendance Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t.dashboard.todayAttendance}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayAttendanceRate}%</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Morning & Evening batches</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Monthly Fee Summary & Pending Due Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Visual Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.dashboard.monthlyCollection}</h2>
              <p className="text-xs text-slate-500">Academic Year 2026-27 Cash & Digital Collections</p>
            </div>
            <button
              onClick={() => setActiveTab('fees')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-3 pt-2">
            {monthlyData.map((item) => {
              const percentage = Math.round((item.amount / maxMonthly) * 100);
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 w-12">{item.month} 2026</span>
                    <span className="text-slate-600 font-medium">{formatINR(item.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Average Monthly Inflow: <strong>₹83,000</strong></span>
            <span>Collection Efficiency: <strong className="text-emerald-700">88.4%</strong></span>
          </div>
        </div>

        {/* Pending Fee Due Action Center */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{t.dashboard.overdueAlerts}</span>
            </div>
            <span className="text-xs text-slate-500">Top Dues</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Students with outstanding fee balances exceeding ₹15,000:
          </p>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {studentsWithDues.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                All student fee balances are cleared!
              </div>
            ) : (
              studentsWithDues.slice(0, 4).map(({ student, summary }) => (
                <div
                  key={student.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{student.fullName}</div>
                    <div className="text-slate-500 mt-0.5">
                      {student.classGrade} · Roll #{student.rollNo}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-amber-700">
                      {formatINR(summary.pendingBalance)}
                    </div>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="text-[11px] text-blue-700 hover:underline font-medium mt-0.5"
                    >
                      Collect Fee
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('aiAssistant')}
              className="w-full py-2 text-xs font-semibold text-center text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Draft WhatsApp Fee Reminders with AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Searchable Student Roster Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.dashboard.recentAdmissions}</h2>
            <p className="text-xs text-slate-500">Live roster of active enrolled students</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.students.searchPlaceholder}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 w-52 sm:w-64"
              />
            </div>

            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
            >
              {t.dashboard.viewAll} →
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-right">Fee Status</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No student found matching query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const feeSummary = calculateStudentFeeSummary(student, payments);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        #{student.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500">{student.admissionNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{student.classGrade}</span>
                        {student.stream && (
                          <span className="text-[11px] text-slate-500 block">{student.stream}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>{student.guardianName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.guardianPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {feeSummary.status === 'fully_paid' && (
                          <span className="text-emerald-700 font-semibold">Fully Cleared</span>
                        )}
                        {feeSummary.status === 'partial' && (
                          <span className="text-blue-700 font-semibold">Partial Paid</span>
                        )}
                        {feeSummary.status === 'unpaid' && (
                          <span className="text-amber-700 font-semibold">Unpaid</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(feeSummary.pendingBalance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setActiveTab('students')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          View Details
                        </button>
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
  );
};
