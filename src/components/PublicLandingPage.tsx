import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/academicCalculations';
import {
  School,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  CreditCard,
  CalendarCheck2,
  GraduationCap,
  Sparkles,
  Calculator,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { setActiveTab } = useApp();

  // Free Tool 1: Coaching Profit & Fee Calculator
  const [calcStudents, setCalcStudents] = useState<number>(60);
  const [calcAvgFee, setCalcAvgFee] = useState<number>(3500); // per month
  const [calcRent, setCalcRent] = useState<number>(45000); // per month
  const [calcFacultySalary, setCalcFacultySalary] = useState<number>(75000); // per month
  const [calcOtherBills, setCalcOtherBills] = useState<number>(15000); // per month

  const monthlyGrossRevenue = calcStudents * calcAvgFee;
  const monthlyTotalExpense = calcRent + calcFacultySalary + calcOtherBills;
  const monthlyNetProfit = monthlyGrossRevenue - monthlyTotalExpense;
  const annualProfit = monthlyNetProfit * 12;

  // Free Tool 2: CBSE / Board Percentage to CGPA Converter
  const [inputPercentage, setInputPercentage] = useState<number>(85.5);
  const calculatedCGPA = Math.min(10, Math.max(0, Number((inputPercentage / 9.5).toFixed(2))));

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can EduManage handle multiple coaching branches?',
      a: 'Yes. EduManage has native multi-tenant database isolation. Each coaching institute or branch operates within its own private workspace, ensuring complete privacy of student lists, test scores, and financial collections.',
    },
    {
      q: 'Is EduManage free to start for beginner coaching owners?',
      a: 'Yes. The MVP architecture runs on ₹0 budget using PostgreSQL / Supabase free tiers and local or free hosting options like Vercel and Render, allowing you to start without recurring software bills.',
    },
    {
      q: 'How does EduManage support Classes 6 to 12 in India?',
      a: 'EduManage supports foundational Classes 6–8, secondary board prep for Classes 9–10, and senior secondary streams (PCM, PCB, Commerce, Arts) for Classes 11–12 with CBSE/State board grading rubrics.',
    },
    {
      q: 'Does it support offline cash payments as well as UPI?',
      a: 'Yes. You can record manual cash receipts at reception, UPI payments (Google Pay, PhonePe, Paytm), and bank transfers with instant printable official fee receipts.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-base">
            E
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">EduManage</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#tools"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline"
          >
            Free Tools
          </a>
          <a
            href="#faq"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline"
          >
            FAQ
          </a>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Launch Live App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Tailored for Indian Coaching Institutes (Classes 6–12)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          All-in-One Coaching Management Platform for Indian Educators
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Manage students, fee receipts, daily attendance, CBSE examinations, study materials, and parent communications from a single, unified dashboard. Starts free.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Institute Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('setupDocs')}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm rounded-lg shadow-xs transition-colors"
          >
            View Free Deployment Architecture
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <Users className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm">Classes 6–12 Directory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track student profiles, roll numbers, guardian contacts, and batch allocations across PCM, PCB, and Commerce.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">Manual Fees & Receipts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record cash & UPI collections, compute pending dues, and issue printable official coaching receipts.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <GraduationCap className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-sm">CBSE Report Cards</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter subject-wise marks, compute competition ranks with tie handling, and print official report cards.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Gemini AI Coaching Tools</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly generate subject test papers, draft polite WhatsApp parent fee reminders, and compose teacher remarks.
            </p>
          </div>
        </div>
      </section>

      {/* Free Educational Tools Section */}
      <section id="tools" className="px-4 sm:px-8 py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Free Coaching Calculators & Educational Tools
            </h2>
            <p className="text-sm text-slate-600">
              Free interactive utilities for coaching institute directors, teachers, and students.
            </p>
          </div>

          {/* Tool 1: Profit Calculator */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Coaching Institute Monthly Profit & Revenue Calculator
                </h3>
              </div>
              <p className="text-slate-600">
                Estimate your monthly cash inflow, operating expenses, and net profit margins based on active student strength.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between mb-1 font-medium text-slate-700">
                    <span>Number of Students:</span>
                    <strong className="font-mono text-blue-700">{calcStudents} Students</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={calcStudents}
                    onChange={(e) => setCalcStudents(Number(e.target.value))}
                    className="w-full accent-blue-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-medium text-slate-700">
                    <span>Average Monthly Fee per Student (₹):</span>
                    <strong className="font-mono text-blue-700">{formatINR(calcAvgFee)}/mo</strong>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={calcAvgFee}
                    onChange={(e) => setCalcAvgFee(Number(e.target.value))}
                    className="w-full accent-blue-700"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Building Rent (₹)</label>
                    <input
                      type="number"
                      value={calcRent}
                      onChange={(e) => setCalcRent(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Faculty Salary (₹)</label>
                    <input
                      type="number"
                      value={calcFacultySalary}
                      onChange={(e) => setCalcFacultySalary(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Bills & Print (₹)</label>
                    <input
                      type="number"
                      value={calcOtherBills}
                      onChange={(e) => setCalcOtherBills(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Outcome Display */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Estimated Monthly Gross Inflow
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  {formatINR(monthlyGrossRevenue)}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Total Monthly Expenses
                </span>
                <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">
                  {formatINR(monthlyTotalExpense)}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-xs text-emerald-800 uppercase font-bold block">
                  Net Monthly Institute Surplus
                </span>
                <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-1">
                  {formatINR(monthlyNetProfit)}
                </div>
                <span className="text-[11px] text-emerald-700 block mt-1">
                  Est. Annual Net Profit: {formatINR(annualProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Tool 2: CBSE Percentage to CGPA Converter */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 max-w-xl mx-auto space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                CBSE Official Percentage to CGPA Converter
              </h3>
            </div>
            <p className="text-slate-600">
              As per CBSE standard guidelines: <code className="font-mono text-blue-800">CGPA = Percentage / 9.5</code>.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-slate-700 font-medium mb-1">Enter Percentage (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={inputPercentage}
                  onChange={(e) => setInputPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-base"
                />
              </div>

              <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <span className="text-[10px] text-blue-800 uppercase font-semibold block">
                  Equivalent CGPA
                </span>
                <div className="text-2xl font-extrabold font-mono text-blue-900 mt-0.5">
                  {calculatedCGPA} / 10
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 sm:px-8 py-16 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">Common questions about EduManage coaching platform.</p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-12 text-xs">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                E
              </div>
              <span className="font-extrabold text-white text-base">EduManage</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The all-in-one coaching institute operating system tailored for Classes 6–12 across India.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Compliance & Ethics
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>DPDP Act 2023 India Compliant</li>
              <li>No Selling of Children's Data</li>
              <li>Strict Multi-Tenant Database Isolation</li>
              <li>Encrypted at Rest & in Transit</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Get Started
            </h4>
            <p className="text-slate-400 text-[11px] mb-3">
              Ready to explore EduManage for your coaching institute?
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Launch Platform Demo
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <span>© 2026 EduManage Technologies India. All rights reserved.</span>
          <span>Designed for Indian Coaching Institutes</span>
        </div>
      </footer>
    </div>
  );
};
