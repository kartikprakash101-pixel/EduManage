import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassGrade } from '../types';
import {
  calculateStudentFeeSummary,
  calculateAttendanceStats,
  formatINR,
} from '../utils/academicCalculations';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Copy,
  Printer,
  Check,
  Send,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const {
    students,
    payments,
    attendance,
    currentInstitute,
    currentLanguage,
    t,
    showToast,
  } = useApp();

  type AiTab = 'quiz' | 'reminder' | 'remarks';
  const [activeTab, setActiveTab] = useState<AiTab>('quiz');

  // 1. Quiz Generator State
  const [quizClass, setQuizClass] = useState<ClassGrade>('Class 10');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizTopic, setQuizTopic] = useState('Quadratic Equations and Arithmetic Progressions');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizCount, setQuizCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);

  // 2. Fee Reminder State
  const [reminderStudentId, setReminderStudentId] = useState(students[0]?.id || '');
  const [reminderDueDate, setReminderDueDate] = useState('2026-10-31');
  const [reminderTone, setReminderTone] = useState<'polite' | 'formal' | 'urgent'>('polite');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [generatedReminder, setGeneratedReminder] = useState<string>('');

  // 3. Remarks Generator State
  const [remarksStudentId, setRemarksStudentId] = useState(students[0]?.id || '');
  const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
  const [generatedRemarks, setGeneratedRemarks] = useState<{ remarks: string; actionTips: string[] } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Quiz Handler
  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) {
      showToast('Please specify a topic for the test paper.', 'error');
      return;
    }
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classGrade: quizClass,
          subject: quizSubject,
          topic: quizTopic,
          questionCount: quizCount,
          difficulty: quizDifficulty,
          language: currentLanguage,
        }),
      });
      const data = await res.json();
      setGeneratedQuiz(data);
      showToast('Test paper generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate quiz.', 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Fee Reminder Handler
  const handleGenerateReminder = async () => {
    const student = students.find((s) => s.id === reminderStudentId);
    if (!student) return;

    const summary = calculateStudentFeeSummary(student, payments);
    setIsGeneratingReminder(true);
    try {
      const res = await fetch('/api/ai/fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.fullName,
          classGrade: student.classGrade,
          guardianName: student.guardianName,
          pendingAmount: summary.pendingBalance,
          dueDate: reminderDueDate,
          instituteName: currentInstitute.name,
          language: currentLanguage,
          tone: reminderTone,
        }),
      });
      const data = await res.json();
      setGeneratedReminder(data.message);
      showToast('Reminder message generated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate reminder.', 'error');
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  // Generate Remarks Handler
  const handleGenerateRemarks = async () => {
    const student = students.find((s) => s.id === remarksStudentId);
    if (!student) return;

    const att = calculateAttendanceStats(student.id, attendance);
    setIsGeneratingRemarks(true);
    try {
      const res = await fetch('/api/ai/report-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.fullName,
          classGrade: student.classGrade,
          percentage: 88,
          grade: 'A2',
          subjects: [
            { subject: 'Mathematics', obtainedMarks: 91, maxMarks: 100 },
            { subject: 'Science', obtainedMarks: 86, maxMarks: 100 },
          ],
          attendanceRate: att.percentage,
          language: currentLanguage,
        }),
      });
      const data = await res.json();
      setGeneratedRemarks(data);
      showToast('Remarks generated with AI insights!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate remarks.', 'error');
    } finally {
      setIsGeneratingRemarks(false);
    }
  };

  const selectedReminderStudent = students.find((s) => s.id === reminderStudentId);
  const reminderStudentFee = selectedReminderStudent
    ? calculateStudentFeeSummary(selectedReminderStudent, payments)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.ai.title}</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              Gemini Powered
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">{t.ai.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'quiz'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.ai.tabQuiz}</span>
        </button>

        <button
          onClick={() => setActiveTab('reminder')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'reminder'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.ai.tabReminder}</span>
        </button>

        <button
          onClick={() => setActiveTab('remarks')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'remarks'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{t.ai.tabRemarks}</span>
        </button>
      </div>

      {/* 1. QUIZ GENERATOR TAB */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Configure Test Paper</h2>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Target Class</label>
              <select
                value={quizClass}
                onChange={(e) => setQuizClass(e.target.value as ClassGrade)}
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
              <label className="block text-slate-700 font-medium mb-1">Subject</label>
              <select
                value={quizSubject}
                onChange={(e) => setQuizSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Science">General Science</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chapter / Topic *</label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g. Chemical Reactions and Equations"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Difficulty</label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Easy">Foundation (Easy)</option>
                  <option value="Medium">Standard Board (Medium)</option>
                  <option value="Hard">Advanced / Olympiad (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">No. of Questions</label>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value={3}>3 Questions (Quick Drill)</option>
                  <option value={5}>5 Questions (Unit Test)</option>
                  <option value={10}>10 Questions (Full Test)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingQuiz ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.ai.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Test Paper</span>
                </>
              )}
            </button>
          </div>

          {/* Result Canvas */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Generated Question Paper</span>
              {generatedQuiz && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(generatedQuiz, null, 2))}
                    className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Test</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 py-4">
              {!generatedQuiz ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300" />
                  <span>Configure options on the left and click "Generate Test Paper"</span>
                </div>
              ) : (
                <div className="space-y-5 text-xs text-slate-800">
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-900">{generatedQuiz.title}</h3>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {currentInstitute.name} · Maximum Marks: {generatedQuiz.totalMarks || 25} · Time Allowed: 45 Mins
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedQuiz.questions?.map((q: any, i: number) => (
                      <div key={q.id || i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                        <div className="flex items-start justify-between gap-3 font-semibold text-slate-900">
                          <span>
                            Q{i + 1}. {q.question}
                          </span>
                          <span className="font-mono text-slate-500 font-normal shrink-0">
                            [{q.marks || 2} Marks]
                          </span>
                        </div>

                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3 pt-1">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="text-slate-700">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200/60 text-[11px] text-emerald-800 font-medium">
                          <strong>Answer / Rubric: </strong>
                          <span>{q.correctAnswer}</span>
                          {q.explanation && (
                            <span className="text-slate-500 block mt-0.5">Note: {q.explanation}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FEE REMINDER TAB */}
      {activeTab === 'reminder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Draft WhatsApp / SMS Reminder</h2>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Student</label>
              <select
                value={reminderStudentId}
                onChange={(e) => setReminderStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {students.map((s) => {
                  const fee = calculateStudentFeeSummary(s, payments);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.classGrade}) - Pending: {formatINR(fee.pendingBalance)}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedReminderStudent && reminderStudentFee && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent:</span>
                  <span className="font-medium text-slate-800">
                    {selectedReminderStudent.guardianName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent Mobile:</span>
                  <span className="font-mono text-slate-800">
                    {selectedReminderStudent.guardianPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending Amount:</span>
                  <strong className="font-mono text-amber-700">
                    {formatINR(reminderStudentFee.pendingBalance)}
                  </strong>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Due Date</label>
              <input
                type="date"
                value={reminderDueDate}
                onChange={(e) => setReminderDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tone of Message</label>
              <select
                value={reminderTone}
                onChange={(e) => setReminderTone(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="polite">Polite & Courteous (First Follow-up)</option>
                <option value="formal">Formal Academic Notice (Standard)</option>
                <option value="urgent">Urgent Board Registration Clearance</option>
              </select>
            </div>

            <button
              onClick={handleGenerateReminder}
              disabled={isGeneratingReminder}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingReminder ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting Message...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Reminder Message</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Message Preview</span>
              {generatedReminder && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generatedReminder)}
                    className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {selectedReminderStudent && (
                    <a
                      href={`https://wa.me/${selectedReminderStudent.guardianPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        generatedReminder
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 py-4">
              {!generatedReminder ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <span>Select student and click "Draft Reminder Message"</span>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
                  {generatedReminder}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. REPORT CARD REMARKS TAB */}
      {activeTab === 'remarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Student Remarks Generator</h2>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Student</label>
              <select
                value={remarksStudentId}
                onChange={(e) => setRemarksStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.classGrade})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              Gemini analyzes the student's test scores, class attendance, and academic trajectory to draft personalized feedback suitable for CBSE report cards and parent-teacher meetings.
            </p>

            <button
              onClick={handleGenerateRemarks}
              disabled={isGeneratingRemarks}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingRemarks ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Remarks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Report Remarks</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Faculty Feedback & Action Points</span>
              {generatedRemarks && (
                <button
                  onClick={() => handleCopy(generatedRemarks.remarks)}
                  className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Remarks</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4">
              {!generatedRemarks ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                  <GraduationCap className="w-8 h-8 text-slate-300" />
                  <span>Select a student to generate custom report card remarks</span>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <span className="text-[10px] text-blue-800 uppercase font-bold block mb-1">
                      Official Teacher's Remark:
                    </span>
                    <p className="text-slate-800 leading-relaxed italic text-sm">
                      "{generatedRemarks.remarks}"
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 text-xs block mb-2">
                      Specific Action Recommendations for Student & Parents:
                    </span>
                    <ul className="space-y-2">
                      {generatedRemarks.actionTips?.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
