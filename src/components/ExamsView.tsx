import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Exam, StudentExamResult, ClassGrade, SubjectMarks } from '../types';
import { calculateGrade, computeExamRanks } from '../utils/academicCalculations';
import {
  GraduationCap,
  PlusCircle,
  Edit3,
  Printer,
  Sparkles,
  X,
  CheckCircle2,
  Trophy,
  BookOpen,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const {
    exams,
    examResults,
    students,
    attendance,
    addExam,
    saveExamResult,
    currentInstitute,
    currentRole,
    currentLanguage,
    t,
    showToast,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [activeMarksModalStudent, setActiveMarksModalStudent] = useState<{
    exam: Exam;
    student: any;
    existingResult?: StudentExamResult;
  } | null>(null);

  const [activeReportCard, setActiveReportCard] = useState<StudentExamResult | null>(null);
  const [isGeneratingAiRemarks, setIsGeneratingAiRemarks] = useState(false);

  // New Exam Form
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamClass, setNewExamClass] = useState<ClassGrade>('Class 10');
  const [newExamTerm, setNewExamTerm] = useState('Term 1 Mid-Term');
  const [newExamDate, setNewExamDate] = useState('2026-10-15');
  const [newExamSubjects, setNewExamSubjects] = useState('Mathematics, Science, English');
  const [newExamMaxMarks, setNewExamMaxMarks] = useState(300);

  // Marks Entry Form
  const [marksEntries, setMarksEntries] = useState<SubjectMarks[]>([]);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Results for current exam
  const currentExamResults = examResults.filter(
    (r) => r.examId === selectedExam?.id
  );

  // Students eligible for this exam
  const eligibleStudents = students.filter(
    (s) => s.classGrade === selectedExam?.classGrade
  );

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const subjectsArr = newExamSubjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addExam({
      title: newExamTitle.trim(),
      classGrade: newExamClass,
      academicTerm: newExamTerm.trim(),
      examDate: newExamDate,
      totalMaxMarks: Number(newExamMaxMarks),
      subjects: subjectsArr.length > 0 ? subjectsArr : ['Core Subject'],
    });

    setIsAddExamModalOpen(false);
    setNewExamTitle('');
  };

  const openMarksEntry = (student: any) => {
    if (!selectedExam) return;
    const existing = currentExamResults.find((r) => r.studentId === student.id);

    const initialMarks: SubjectMarks[] = selectedExam.subjects.map((sub) => {
      const found = existing?.subjects.find((s) => s.subject === sub);
      const perSubjectMax = Math.round(selectedExam.totalMaxMarks / selectedExam.subjects.length);
      return {
        subject: sub,
        maxMarks: found?.maxMarks || perSubjectMax,
        obtainedMarks: found?.obtainedMarks || 0,
      };
    });

    setMarksEntries(initialMarks);
    setActiveMarksModalStudent({
      exam: selectedExam,
      student,
      existingResult: existing,
    });
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMarksModalStudent) return;

    const totalObtained = marksEntries.reduce((sum, s) => sum + Number(s.obtainedMarks), 0);
    const totalMax = marksEntries.reduce((sum, s) => sum + Number(s.maxMarks), 0);
    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
    const gradeInfo = calculateGrade(percentage);

    saveExamResult({
      examId: activeMarksModalStudent.exam.id,
      examTitle: activeMarksModalStudent.exam.title,
      studentId: activeMarksModalStudent.student.id,
      studentName: activeMarksModalStudent.student.fullName,
      rollNo: activeMarksModalStudent.student.rollNo,
      classGrade: activeMarksModalStudent.student.classGrade,
      subjects: marksEntries,
      totalObtained,
      totalMax,
      percentage,
      grade: gradeInfo.grade,
      teacherRemarks:
        activeMarksModalStudent.existingResult?.teacherRemarks ||
        `${gradeInfo.remark}. Regular test practice will ensure continual growth.`,
    });

    setActiveMarksModalStudent(null);
  };

  // Generate AI Remarks for the active Report Card
  const generateAiRemarks = async (result: StudentExamResult) => {
    setIsGeneratingAiRemarks(true);
    try {
      const studentAttendanceRecords = attendance.filter((a) => a.studentId === result.studentId);
      const presentCount = studentAttendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
      const attRate = studentAttendanceRecords.length > 0
        ? Math.round((presentCount / studentAttendanceRecords.length) * 100)
        : 90;

      const res = await fetch('/api/ai/report-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: result.studentName,
          classGrade: result.classGrade,
          percentage: result.percentage,
          grade: result.grade,
          subjects: result.subjects,
          attendanceRate: attRate,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      if (data.remarks) {
        // Update in state
        saveExamResult({
          ...result,
          teacherRemarks: data.remarks,
        });
        setActiveReportCard((prev) => (prev ? { ...prev, teacherRemarks: data.remarks } : null));
        showToast('AI Teacher Remarks generated and attached!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not reach AI remarks service. Using standard remark.', 'info');
    } finally {
      setIsGeneratingAiRemarks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.exams.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.exams.subtitle}</p>
        </div>

        {(currentRole === 'owner' || currentRole === 'teacher') && (
          <button
            onClick={() => setIsAddExamModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.exams.scheduleExam}</span>
          </button>
        )}
      </div>

      {/* Exam Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {exams.map((exam) => {
          const isSelected = exam.id === selectedExam?.id;
          return (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold">{exam.title}</div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {exam.classGrade} · {exam.examDate}
              </div>
            </button>
          );
        })}
      </div>

      {selectedExam && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Exam Summary Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-base font-bold text-slate-900">{selectedExam.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Target: {selectedExam.classGrade} · Term: {selectedExam.academicTerm} · Total Marks: {selectedExam.totalMaxMarks} · Date: {selectedExam.examDate}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span>Subjects: {selectedExam.subjects.join(', ')}</span>
            </div>
          </div>

          {/* Student Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">{t.exams.percentage}</th>
                  <th className="py-3 px-4 text-center">{t.exams.grade}</th>
                  <th className="py-3 px-4 text-center">Report Card</th>
                  <th className="py-3 px-4 text-center">Marks Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {eligibleStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No active students found in {selectedExam.classGrade}.
                    </td>
                  </tr>
                ) : (
                  eligibleStudents.map((student) => {
                    const result = currentExamResults.find((r) => r.studentId === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {result?.rank ? (
                            <span className="flex items-center gap-1">
                              {result.rank === 1 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                              #{result.rank}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          #{student.rollNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-[11px] text-slate-500">{student.admissionNo}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          {result ? (
                            <span>
                              {result.totalObtained} / {result.totalMax}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Pending Entry</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {result ? (
                            <span
                              className={
                                result.percentage >= 85
                                  ? 'text-emerald-700'
                                  : result.percentage >= 60
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }
                            >
                              {result.percentage}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {result ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                              {result.grade}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {result ? (
                            <button
                              onClick={() => setActiveReportCard(result)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View Card</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Marks needed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(currentRole === 'owner' || currentRole === 'teacher') && (
                            <button
                              onClick={() => openMarksEntry(student)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              <span>{result ? 'Edit Marks' : 'Enter Marks'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900">{t.exams.scheduleExam}</h2>
              <button
                onClick={() => setIsAddExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">{t.exams.examTitle} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE Term 2 Physics & Maths Test"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.exams.class} *</label>
                  <select
                    value={newExamClass}
                    onChange={(e) => setNewExamClass(e.target.value as ClassGrade)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {[
                      'Class 6',
                      'Class 7',
                      'Class 8',
                      'Class 9',
                      'Class 10',
                      'Class 11',
                      'Class 12',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.exams.term}</label>
                  <input
                    type="text"
                    value={newExamTerm}
                    onChange={(e) => setNewExamTerm(e.target.value)}
                    placeholder="e.g. Pre-Board Term 1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.exams.date}</label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Total Max Marks</label>
                  <input
                    type="number"
                    value={newExamMaxMarks}
                    onChange={(e) => setNewExamMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Subjects (comma separated)
                </label>
                <input
                  type="text"
                  value={newExamSubjects}
                  onChange={(e) => setNewExamSubjects(e.target.value)}
                  placeholder="Mathematics, Physics, Chemistry"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Subject Marks Modal */}
      {activeMarksModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Enter Marks: {activeMarksModalStudent.student.fullName}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {activeMarksModalStudent.exam.title} ({activeMarksModalStudent.student.classGrade})
                </p>
              </div>
              <button
                onClick={() => setActiveMarksModalStudent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-3">
              <div className="space-y-2.5">
                {marksEntries.map((sub, idx) => (
                  <div
                    key={sub.subject}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold text-slate-800 text-sm flex-1">{sub.subject}</span>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Obtained</span>
                        <input
                          type="number"
                          min="0"
                          max={sub.maxMarks}
                          value={sub.obtainedMarks}
                          onChange={(e) => {
                            const updated = [...marksEntries];
                            updated[idx].obtainedMarks = Number(e.target.value);
                            setMarksEntries(updated);
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded bg-white text-center font-mono font-bold"
                        />
                      </div>
                      <span className="text-slate-400 mt-3">/</span>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Max</span>
                        <input
                          type="number"
                          min="1"
                          value={sub.maxMarks}
                          onChange={(e) => {
                            const updated = [...marksEntries];
                            updated[idx].maxMarks = Number(e.target.value);
                            setMarksEntries(updated);
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded bg-white text-center font-mono text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant calculation preview */}
              {(() => {
                const totalObtained = marksEntries.reduce((s, m) => s + Number(m.obtainedMarks), 0);
                const totalMax = marksEntries.reduce((s, m) => s + Number(m.maxMarks), 0);
                const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;
                const gradeInfo = calculateGrade(Number(pct));

                return (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-600 block">Calculated Total</span>
                      <strong className="text-blue-900 font-mono text-sm">
                        {totalObtained} / {totalMax} ({pct}%)
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-600 block">CBSE Grade</span>
                      <strong className="text-blue-900 font-mono text-base">{gradeInfo.grade}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMarksModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  Save Marks & Compute Rank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Report Card Modal */}
      {activeReportCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                CBSE Format Report Card
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateAiRemarks(activeReportCard)}
                  disabled={isGeneratingAiRemarks}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isGeneratingAiRemarks ? 'Analyzing...' : 'AI Teacher Remarks'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>

                <button
                  onClick={() => setActiveReportCard(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official CBSE Styled Report Card */}
            <div className="p-6 border-2 border-slate-800 rounded-lg bg-white text-slate-900 space-y-4 text-xs font-sans">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
                  {currentInstitute.name}
                </h2>
                <p className="text-[11px] text-slate-600">{currentInstitute.tagline}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {currentInstitute.address} · Phone: {currentInstitute.phone}
                </p>
                <div className="mt-2 inline-block px-4 py-0.5 bg-slate-100 border border-slate-400 font-bold text-xs uppercase tracking-wider">
                  Official Academic Performance Report
                </div>
              </div>

              {/* Student Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-slate-200 pb-3 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name:</span>
                  <strong className="text-slate-900 text-sm">{activeReportCard.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Class & Standard:</span>
                  <strong>{activeReportCard.classGrade}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Roll Number:</span>
                  <strong>#{activeReportCard.rollNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Batch Rank:</span>
                  <strong className="text-blue-800 text-sm">
                    {activeReportCard.rank ? `Rank #${activeReportCard.rank}` : 'Rank Pending'}
                  </strong>
                </div>
              </div>

              {/* Subject Marks Breakdown Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3 text-center">Max Marks</th>
                      <th className="py-2 px-3 text-center">Marks Obtained</th>
                      <th className="py-2 px-3 text-center">Subject Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeReportCard.subjects.map((sub) => {
                      const subPct = ((sub.obtainedMarks / sub.maxMarks) * 100).toFixed(0);
                      return (
                        <tr key={sub.subject}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{sub.subject}</td>
                          <td className="py-2 px-3 text-center font-mono">{sub.maxMarks}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            {sub.obtainedMarks}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{subPct}%</td>
                        </tr>
                      );
                    })}
                    {/* Total Row */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="py-2.5 px-3">Grand Total</td>
                      <td className="py-2.5 px-3 text-center font-mono">{activeReportCard.totalMax}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm text-blue-900">
                        {activeReportCard.totalObtained}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm text-blue-900">
                        {activeReportCard.percentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CBSE Grading Summary Card */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Aggregate Score</span>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {activeReportCard.percentage}%
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">CBSE Grade</span>
                  <div className="text-base font-bold font-mono text-blue-700">
                    {activeReportCard.grade}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Result Status</span>
                  <div className="text-base font-bold text-emerald-700">PASS</div>
                </div>
              </div>

              {/* Faculty Remarks */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Faculty Performance Remarks & Recommendations:
                </span>
                <p className="text-xs text-slate-800 italic">
                  "{activeReportCard.teacherRemarks || 'Consistent effort noted. Keep up the high standards!'}"
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-slate-600">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-1 font-serif text-slate-400">
                    Class Teacher
                  </div>
                  <div className="text-[10px] uppercase font-bold mt-1">Class Incharge</div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-1 font-serif text-slate-400">
                    Verified
                  </div>
                  <div className="text-[10px] uppercase font-bold mt-1">Examination Controller</div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-1 font-serif text-slate-400">
                    Authorised Seal
                  </div>
                  <div className="text-[10px] uppercase font-bold mt-1">Director</div>
                </div>
              </div>
            </div>

            <div className="no-print pt-2 flex justify-end">
              <button
                onClick={() => setActiveReportCard(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Close Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
