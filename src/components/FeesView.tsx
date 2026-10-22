import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeePayment, PaymentMethod } from '../types';
import {
  formatINR,
  calculateStudentFeeSummary,
  validatePaymentAmount,
} from '../utils/academicCalculations';
import {
  Receipt,
  PlusCircle,
  Search,
  Printer,
  AlertTriangle,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Sparkles,
} from 'lucide-react';

export const FeesView: React.FC = () => {
  const {
    students,
    payments,
    addPayment,
    currentInstitute,
    currentRole,
    setActiveTab,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [monthOrTerm, setMonthOrTerm] = useState<string>('Term 2 Installment');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [excessiveWarningConfirmed, setExcessiveWarningConfirmed] = useState(false);

  // Active student calculation
  const targetStudent = students.find((s) => s.id === selectedStudentId);
  const studentFeeSummary = targetStudent
    ? calculateStudentFeeSummary(targetStudent, payments)
    : null;

  // Validation
  const validationResult = targetStudent && studentFeeSummary
    ? validatePaymentAmount(amount, studentFeeSummary.pendingBalance)
    : { isValid: true, isExcessive: false };

  // Filter receipts
  const filteredPayments = payments.filter((p) => {
    if (selectedMethod !== 'all' && p.paymentMethod !== selectedMethod) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReceipt = p.receiptNo.toLowerCase().includes(q);
      const matchStudent = p.studentName.toLowerCase().includes(q);
      const matchRef = (p.referenceNo || '').toLowerCase().includes(q);
      if (!matchReceipt && !matchStudent && !matchRef) return false;
    }
    return true;
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalAgreedAll = students.reduce((acc, s) => acc + s.totalAgreedFee, 0);
  const totalPending = Math.max(0, totalAgreedAll - totalCollected);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!targetStudent) {
      setFormError('Please select a student.');
      return;
    }

    if (!validationResult.isValid) {
      setFormError(validationResult.errorMessage || 'Invalid amount.');
      return;
    }

    // If excessive payment warning triggered and not yet confirmed by staff
    if (validationResult.isExcessive && !excessiveWarningConfirmed) {
      return; // Will render warning confirmation step in modal
    }

    const createdPayment = addPayment({
      studentId: targetStudent.id,
      studentName: targetStudent.fullName,
      classGrade: targetStudent.classGrade,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      monthOrTerm,
      collectedBy: currentRole === 'owner' ? 'Director Office' : 'Sunil Verma (Accountant)',
      notes: notes.trim() || undefined,
      status: 'verified',
    });

    setIsRecordModalOpen(false);
    setSelectedStudentId('');
    setAmount(15000);
    setReferenceNo('');
    setNotes('');
    setExcessiveWarningConfirmed(false);

    // Open receipt modal immediately for review / print
    setActiveReceipt(createdPayment);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.fees.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.fees.subtitle}</p>
        </div>

        {(currentRole === 'owner' || currentRole === 'accountant') && (
          <button
            onClick={() => {
              setSelectedStudentId(students[0]?.id || '');
              setFormError('');
              setExcessiveWarningConfirmed(false);
              setIsRecordModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.fees.recordPayment}</span>
          </button>
        )}
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Course Value
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatINR(totalAgreedAll)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {students.length} active registered students
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
            Total Collected Fees
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {formatINR(totalCollected)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {payments.length} verified receipts issued
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
            Total Pending Balance
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {formatINR(totalPending)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Awaiting subsequent installments
          </span>
        </div>
      </div>

      {/* Search and Method Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.fees.searchReceipts}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">{t.fees.allMethods}</option>
            <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
            <option value="Cash">Cash at Reception</option>
            <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
            <option value="Cheque">Cheque / Demand Draft</option>
          </select>
        </div>
      </div>

      {/* Fee Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t.fees.receiptNo}</th>
                <th className="py-3 px-4">{t.fees.date}</th>
                <th className="py-3 px-4">{t.fees.student} & Class</th>
                <th className="py-3 px-4">{t.fees.term}</th>
                <th className="py-3 px-4">{t.fees.method}</th>
                <th className="py-3 px-4 text-right">{t.fees.amount}</th>
                <th className="py-3 px-4 text-center">{t.fees.status}</th>
                <th className="py-3 px-4 text-center">{t.fees.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No fee receipts match your search.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {payment.receiptNo}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{payment.paymentDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{payment.studentName}</div>
                      <div className="text-[11px] text-slate-500">{payment.classGrade}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{payment.monthOrTerm}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        {payment.paymentMethod === 'UPI' && (
                          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        {payment.paymentMethod === 'Cash' && (
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {payment.paymentMethod === 'Bank Transfer' && (
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        {payment.paymentMethod === 'Cheque' && (
                          <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span>{payment.paymentMethod}</span>
                      </div>
                      {payment.referenceNo && (
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                          {payment.referenceNo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t.fees.verified}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(payment)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View & Print Official Receipt"
                        aria-label={`View receipt ${payment.receiptNo}`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Fee Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t.fees.recordModalTitle}</h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {formError}
                </div>
              )}

              {/* Student Selection */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {t.fees.selectStudent}
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setExcessiveWarningConfirmed(false);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => {
                    const sum = calculateStudentFeeSummary(s, payments);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.classGrade} · #{s.rollNo}) - Pending:{' '}
                        {formatINR(sum.pendingBalance)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Student balance preview card */}
              {targetStudent && studentFeeSummary && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Total Fee</span>
                    <div className="font-mono font-bold text-slate-800">
                      {formatINR(studentFeeSummary.totalAgreedFee)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase">Paid So Far</span>
                    <div className="font-mono font-bold text-emerald-800">
                      {formatINR(studentFeeSummary.totalPaid)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-700 uppercase">Current Due</span>
                    <div className="font-mono font-bold text-amber-800">
                      {formatINR(studentFeeSummary.pendingBalance)}
                    </div>
                  </div>
                </div>
              )}

              {/* Amount and Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.fees.paymentAmount}
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value));
                      setExcessiveWarningConfirmed(false);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.fees.paymentMethodLabel}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash at Office</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Cheque / Demand Draft</option>
                  </select>
                </div>
              </div>

              {/* Warning for Excessive Payment */}
              {validationResult.isExcessive && !excessiveWarningConfirmed && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-start gap-2 text-amber-800 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">{t.fees.warningExcessiveTitle}</div>
                      <p className="text-[11px] mt-0.5">{validationResult.warningMessage}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1 border-t border-amber-200 text-amber-900 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excessiveWarningConfirmed}
                      onChange={(e) => setExcessiveWarningConfirmed(e.target.checked)}
                      className="rounded text-blue-700 focus:ring-blue-600"
                    />
                    <span>Yes, I verify this is an advance payment for future terms.</span>
                  </label>
                </div>
              )}

              {/* Term & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.fees.termLabel}</label>
                  <input
                    type="text"
                    required
                    value={monthOrTerm}
                    onChange={(e) => setMonthOrTerm(e.target.value)}
                    placeholder="e.g. October 2026 Installment"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.fees.paymentDateLabel}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {t.fees.referenceLabel}
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. UPI/261022/98290/1092 or Cheque #49201"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">{t.fees.notesLabel}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional internal remarks..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={validationResult.isExcessive && !excessiveWarningConfirmed}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {t.fees.savePayment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authentic Printable Fee Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-700" />
                Official Fee Receipt Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={printReceipt}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="p-6 border-2 border-slate-800 rounded-lg bg-white text-slate-900 space-y-4 text-xs font-sans">
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
                  {currentInstitute.name}
                </h2>
                <p className="text-[11px] text-slate-600">{currentInstitute.tagline}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {currentInstitute.address} · Phone: {currentInstitute.phone}
                </p>
                {currentInstitute.taxGstNo && (
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    GSTIN / Reg No: {currentInstitute.taxGstNo}
                  </div>
                )}
                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 font-bold text-xs uppercase tracking-wider">
                  Tuition Fee Receipt
                </div>
              </div>

              {/* Receipt Metadata Row */}
              <div className="flex justify-between items-center text-xs font-mono border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-500">Receipt No: </span>
                  <strong className="text-slate-900">{activeReceipt.receiptNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <strong className="text-slate-900">{activeReceipt.paymentDate}</strong>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500">Student Name: </span>
                  <strong>{activeReceipt.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Class & Grade: </span>
                  <strong>{activeReceipt.classGrade}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Payment Period: </span>
                  <span>{activeReceipt.monthOrTerm}</span>
                </div>
                <div>
                  <span className="text-slate-500">Payment Mode: </span>
                  <strong className="uppercase">{activeReceipt.paymentMethod}</strong>
                </div>
                {activeReceipt.referenceNo && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Transaction Ref / UTR: </span>
                    <span className="font-mono">{activeReceipt.referenceNo}</span>
                  </div>
                )}
              </div>

              {/* Payment Amount Box */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Amount Received
                  </span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    {formatINR(activeReceipt.amount)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-emerald-800 font-semibold">
                  Status: VERIFIED & CREDITED
                </div>
              </div>

              {/* Signature section */}
              <div className="pt-6 flex justify-between items-end text-[11px] text-slate-600">
                <div>
                  <div>Collected by: {activeReceipt.collectedBy}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Computer Generated Receipt · Valid Without Physical Signature
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-1 font-serif italic text-slate-500 text-xs">
                    EduManage Verified
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-700 mt-1">
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print pt-2 flex justify-between items-center text-xs text-slate-500">
              <span>Ready for A4 / Thermal 3-inch receipt printing</span>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
