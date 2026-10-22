import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ClassGrade, AttendanceStatus, AttendanceRecord } from '../types';
import {
  CalendarCheck2,
  Calendar,
  Check,
  X,
  Clock,
  FileCheck,
  Save,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    students,
    attendance,
    saveAttendanceBatch,
    currentRole,
    t,
  } = useApp();

  const classOptions: ClassGrade[] = [
    'Class 10',
    'Class 12',
    'Class 9',
    'Class 11',
    'Class 8',
    'Class 7',
    'Class 6',
  ];

  const [selectedClass, setSelectedClass] = useState<ClassGrade>('Class 10');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [searchStudent, setSearchStudent] = useState('');

  // Local state for the attendance sheet of the selected class & date
  const [sheetData, setSheetData] = useState<
    Record<string, { status: AttendanceStatus; remark: string }>
  >({});

  // Active students in selected class
  const classStudents = students.filter(
    (s) => s.classGrade === selectedClass && s.status === 'active'
  );

  // Load existing records or default to 'present'
  useEffect(() => {
    const existingMap: Record<string, { status: AttendanceStatus; remark: string }> = {};

    classStudents.forEach((student) => {
      const match = attendance.find(
        (a) =>
          a.studentId === student.id &&
          a.date === selectedDate &&
          a.classGrade === selectedClass
      );
      if (match) {
        existingMap[student.id] = {
          status: match.status,
          remark: match.remark || '',
        };
      } else {
        existingMap[student.id] = {
          status: 'present',
          remark: '',
        };
      }
    });

    setSheetData(existingMap);
  }, [selectedClass, selectedDate, students, attendance]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setSheetData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setStudentRemark = (studentId: string, remark: string) => {
    setSheetData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark,
      },
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remark: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = {
        status: 'present',
        remark: sheetData[s.id]?.remark || '',
      };
    });
    setSheetData(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = classStudents.map((student) => {
      const entry = sheetData[student.id] || { status: 'present', remark: '' };
      return {
        studentId: student.id,
        studentName: student.fullName,
        classGrade: student.classGrade,
        date: selectedDate,
        status: entry.status,
        markedBy: currentRole === 'teacher' ? 'Faculty Incharge' : 'Director Office',
        remark: entry.remark.trim() || undefined,
      };
    });

    saveAttendanceBatch(recordsToSave);
  };

  // Summaries for current sheet
  const totalInClass = classStudents.length;
  const presentCount = classStudents.filter(
    (s) => sheetData[s.id]?.status === 'present' || sheetData[s.id]?.status === 'late'
  ).length;
  const absentCount = classStudents.filter(
    (s) => sheetData[s.id]?.status === 'absent'
  ).length;
  const rate = totalInClass > 0 ? Math.round((presentCount / totalInClass) * 100) : 100;

  const filteredClassStudents = classStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.rollNo.includes(searchStudent)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.attendance.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.attendance.subtitle}</p>
        </div>

        {(currentRole === 'owner' || currentRole === 'teacher') && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.attendance.markAllPresent}</span>
            </button>

            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.attendance.saveAttendance}</span>
            </button>
          </div>
        )}
      </div>

      {/* Class & Date Selector Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Class Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {t.attendance.selectClass}
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
            className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {t.attendance.selectDate}
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Metrics on this date */}
        <div className="md:col-span-2 flex items-center justify-around p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Students</span>
            <div className="text-base font-bold text-slate-900">{totalInClass}</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-emerald-700 uppercase font-semibold">
              {t.attendance.totalPresent}
            </span>
            <div className="text-base font-bold text-emerald-700">{presentCount}</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-rose-700 uppercase font-semibold">
              {t.attendance.totalAbsent}
            </span>
            <div className="text-base font-bold text-rose-700">{absentCount}</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-blue-700 uppercase font-semibold">
              {t.attendance.attendanceRate}
            </span>
            <div className="text-base font-bold text-blue-700 font-mono">{rate}%</div>
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            Attendance Sheet: {selectedClass} — {selectedDate}
          </div>
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in class..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">{t.attendance.studentName}</th>
                <th className="py-3 px-4 text-center">{t.attendance.status}</th>
                <th className="py-3 px-4">{t.attendance.remarks}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClassStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No active students enrolled in {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredClassStudents.map((student) => {
                  const entry = sheetData[student.id] || { status: 'present', remark: '' };

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        #{student.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          Parent: {student.guardianName} ({student.guardianPhone})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'present')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                              entry.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            P
                          </button>
                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'absent')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                              entry.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            A
                          </button>
                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'late')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                              entry.status === 'late'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'excused')}
                            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                              entry.status === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. sick leave, late by 15 mins)..."
                          value={entry.remark}
                          onChange={(e) => setStudentRemark(student.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {classStudents.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Changes take effect immediately upon clicking Save Attendance Sheet.
            </span>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.attendance.saveAttendance}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
