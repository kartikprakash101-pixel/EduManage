import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, ClassGrade } from '../types';
import {
  formatINR,
  calculateStudentFeeSummary,
  calculateAttendanceStats,
} from '../utils/academicCalculations';
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  Phone,
  Calendar,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    allStudentsIncludingArchived,
    addStudent,
    updateStudent,
    archiveStudent,
    restoreStudent,
    payments,
    attendance,
    currentRole,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // New Student Form State
  const initialFormData = {
    fullName: '',
    classGrade: 'Class 10' as ClassGrade,
    stream: 'General' as 'General' | 'PCM' | 'PCB' | 'Commerce' | 'Arts',
    rollNo: '',
    admissionNo: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '2011-01-01',
    phone: '',
    email: '',
    guardianName: '',
    guardianRelation: 'Father' as 'Father' | 'Mother' | 'Guardian',
    guardianPhone: '',
    address: '',
    totalAgreedFee: 45000,
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter students
  const filteredStudents = allStudentsIncludingArchived.filter((s) => {
    // Status filter
    if (statusFilter === 'active' && s.status !== 'active') return false;
    if (statusFilter === 'archived' && s.status !== 'archived') return false;

    // Class filter
    if (selectedClass !== 'all' && s.classGrade !== selectedClass) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchRoll = s.rollNo.toLowerCase().includes(q);
      const matchPhone = s.phone.includes(q) || s.guardianPhone.includes(q);
      const matchAdmission = s.admissionNo.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchPhone && !matchAdmission) return false;
    }

    return true;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Student full name is required.';
    if (!formData.rollNo.trim()) errors.rollNo = 'Roll number is required.';
    if (!formData.guardianName.trim()) errors.guardianName = "Guardian's name is required.";
    if (!formData.guardianPhone.trim()) {
      errors.guardianPhone = "Guardian's phone number is required.";
    } else if (formData.guardianPhone.replace(/\D/g, '').length < 10) {
      errors.guardianPhone = 'Please enter a valid 10-digit mobile number.';
    }
    if (formData.totalAgreedFee <= 0 || isNaN(formData.totalAgreedFee)) {
      errors.totalAgreedFee = 'Total course fee must be greater than ₹0.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName: formData.fullName,
        classGrade: formData.classGrade,
        stream: formData.stream,
        rollNo: formData.rollNo,
        gender: formData.gender,
        dob: formData.dob,
        phone: formData.phone,
        email: formData.email,
        guardianName: formData.guardianName,
        guardianRelation: formData.guardianRelation,
        guardianPhone: formData.guardianPhone,
        address: formData.address,
        totalAgreedFee: Number(formData.totalAgreedFee),
        notes: formData.notes,
      });
      setEditingStudent(null);
    } else {
      const autoAdmissionNo = formData.admissionNo.trim() || `ACA-2026-${Math.floor(100 + Math.random() * 900)}`;
      addStudent({
        fullName: formData.fullName,
        classGrade: formData.classGrade,
        stream: formData.stream,
        rollNo: formData.rollNo,
        admissionNo: autoAdmissionNo,
        admissionDate: formData.admissionDate,
        gender: formData.gender,
        dob: formData.dob,
        phone: formData.phone,
        email: formData.email,
        guardianName: formData.guardianName,
        guardianRelation: formData.guardianRelation,
        guardianPhone: formData.guardianPhone,
        address: formData.address,
        totalAgreedFee: Number(formData.totalAgreedFee),
        status: 'active',
        notes: formData.notes,
      });
      setIsAddModalOpen(false);
    }
    setFormData(initialFormData);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      classGrade: student.classGrade,
      stream: student.stream || 'General',
      rollNo: student.rollNo,
      admissionNo: student.admissionNo,
      gender: student.gender,
      dob: student.dob,
      phone: student.phone,
      email: student.email || '',
      guardianName: student.guardianName,
      guardianRelation: student.guardianRelation,
      guardianPhone: student.guardianPhone,
      address: student.address,
      totalAgreedFee: student.totalAgreedFee,
      admissionDate: student.admissionDate,
      notes: student.notes || '',
    });
    setFormErrors({});
  };

  const classOptions: ClassGrade[] = [
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.students.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.students.subtitle}</p>
        </div>

        {(currentRole === 'owner' || currentRole === 'teacher') && (
          <button
            onClick={() => {
              setFormData(initialFormData);
              setFormErrors({});
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.students.addNew}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.students.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            aria-label="Filter students by class"
          >
            <option value="all">{t.students.allClasses}</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t.students.active} ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'archived' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t.students.archived}
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student & Reg No</th>
                <th className="py-3 px-4">Class & Stream</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-right">Agreed Fee</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    {t.students.noStudents}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const feeSummary = calculateStudentFeeSummary(student, payments);
                  const attStats = calculateAttendanceStats(student.id, attendance);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        student.status === 'archived' ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #{student.rollNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.admissionNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{student.classGrade}</span>
                        {student.stream && (
                          <span className="text-[11px] text-slate-500 block">{student.stream}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{student.guardianName} ({student.guardianRelation})</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.guardianPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                        {formatINR(student.totalAgreedFee)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span
                          className={
                            feeSummary.pendingBalance > 0
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {formatINR(feeSummary.pendingBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-semibold ${
                            attStats.percentage >= 85
                              ? 'text-emerald-700'
                              : attStats.percentage >= 70
                              ? 'text-blue-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {attStats.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {attStats.presentCount}/{attStats.totalSessions || 0} sessions
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Profile / Ledger */}
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                            title={t.students.viewProfile}
                            aria-label={`View profile for ${student.fullName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          {(currentRole === 'owner' || currentRole === 'teacher') && (
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                              title={t.students.edit}
                              aria-label={`Edit ${student.fullName}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive / Restore */}
                          {currentRole === 'owner' && (
                            student.status === 'active' ? (
                              <button
                                onClick={() => archiveStudent(student.id)}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded"
                                title={t.students.archive}
                                aria-label={`Archive ${student.fullName}`}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => restoreStudent(student.id)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                                title={t.students.restore}
                                aria-label={`Restore ${student.fullName}`}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-900">
                {editingStudent ? t.students.editModalTitle : t.students.addModalTitle}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs">
              {/* Personal Details Section */}
              <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1">
                {t.students.personalDetails}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.fullName && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.classLabel}
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value as ClassGrade })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.rollNoLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.rollNo && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.rollNo}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.streamLabel}
                  </label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="General">General / All Subjects</option>
                    <option value="PCM">PCM (Physics, Chemistry, Maths)</option>
                    <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts / Humanities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.students.genderLabel}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t.students.dobLabel}</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Guardian Contact Information */}
              <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 pt-2">
                {t.students.guardianDetails}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.guardianNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.guardianName && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.guardianName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.guardianPhoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="e.g. +91 98290 55440"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.guardianPhone && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.guardianPhone}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">{t.students.addressLabel}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Plot 12, Tonk Road, Jaipur"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Fee Structure */}
              <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 pt-2">
                {t.students.financialDetails}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {t.students.totalFeeLabel}
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={formData.totalAgreedFee}
                    onChange={(e) => setFormData({ ...formData, totalAgreedFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                  {formErrors.totalAgreedFee && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.totalAgreedFee}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Batch / Academic Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Morning JEE Batch / Board Target"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {t.students.saveStudent}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile & Fee Ledger Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{viewingStudent.fullName}</h2>
                <p className="text-xs text-slate-500">
                  {viewingStudent.classGrade} ({viewingStudent.stream || 'General'}) · Roll #{viewingStudent.rollNo} · Reg: {viewingStudent.admissionNo}
                </p>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              {/* Fee and Attendance Summary Cards */}
              {(() => {
                const feeSummary = calculateStudentFeeSummary(viewingStudent, payments);
                const attStats = calculateAttendanceStats(viewingStudent.id, attendance);
                const studentPayments = payments.filter((p) => p.studentId === viewingStudent.id);

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 uppercase font-medium">Total Agreed Fee</div>
                        <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                          {formatINR(feeSummary.totalAgreedFee)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="text-[11px] text-emerald-700 uppercase font-medium">Paid Amount</div>
                        <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                          {formatINR(feeSummary.totalPaid)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="text-[11px] text-amber-700 uppercase font-medium">Balance Due</div>
                        <div className="text-base font-bold text-amber-800 font-mono mt-0.5">
                          {formatINR(feeSummary.pendingBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Attendance summary */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Attendance Track Record</div>
                        <div className="text-slate-500 mt-0.5">
                          {attStats.presentCount} present out of {attStats.totalSessions} class sessions ({attStats.absentCount} absences)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-700 font-mono">{attStats.percentage}%</span>
                        <span className="text-[11px] text-slate-500 block font-medium">{attStats.category}</span>
                      </div>
                    </div>

                    {/* Payment History Table */}
                    <div>
                      <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Payment History & Receipts ({studentPayments.length})</span>
                      </div>

                      {studentPayments.length === 0 ? (
                        <div className="py-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                          No payments recorded yet for this student.
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                              <tr>
                                <th className="py-2 px-3">Receipt No</th>
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Period / Term</th>
                                <th className="py-2 px-3">Mode</th>
                                <th className="py-2 px-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {studentPayments.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3 font-mono font-medium text-blue-700">
                                    {p.receiptNo}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">{p.paymentDate}</td>
                                  <td className="py-2 px-3 text-slate-700">{p.monthOrTerm}</td>
                                  <td className="py-2 px-3 text-slate-600">{p.paymentMethod}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                    {formatINR(p.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Contact details */}
                    <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Guardian Details:</span>
                        <span className="font-medium text-slate-800">
                          {viewingStudent.guardianName} ({viewingStudent.guardianRelation})
                        </span>
                        <div className="font-mono">{viewingStudent.guardianPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Admission Date:</span>
                        <span className="font-medium text-slate-800">{viewingStudent.admissionDate}</span>
                        <div className="truncate">{viewingStudent.address}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
