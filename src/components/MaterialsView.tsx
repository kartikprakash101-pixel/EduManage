import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, ClassGrade } from '../types';
import {
  FileText,
  Upload,
  Download,
  Filter,
  Search,
  BookOpen,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const MaterialsView: React.FC = () => {
  const {
    studyMaterials,
    addStudyMaterial,
    incrementMaterialDownload,
    currentRole,
    t,
    showToast,
  } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [classGrade, setClassGrade] = useState<ClassGrade>('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'DOCX'>('PDF');
  const [fileSizeMb, setFileSizeMb] = useState(3.5);
  const [uploadError, setUploadError] = useState('');

  const classOptions: ClassGrade[] = [
    'Class 10',
    'Class 12',
    'Class 9',
    'Class 11',
    'Class 8',
    'Class 7',
    'Class 6',
  ];

  const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'];

  const filteredMaterials = studyMaterials.filter((m) => {
    if (selectedClass !== 'all' && m.classGrade !== selectedClass) return false;
    if (selectedSubject !== 'all' && m.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchChapter = m.chapter.toLowerCase().includes(q);
      if (!matchTitle && !matchChapter) return false;
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!title.trim()) {
      setUploadError('Material title is required.');
      return;
    }

    if (!chapter.trim()) {
      setUploadError('Chapter or topic title is required.');
      return;
    }

    if (fileSizeMb > 25) {
      setUploadError('File exceeds maximum allowable size limit of 25MB for free tier storage.');
      return;
    }

    addStudyMaterial({
      title: title.trim(),
      classGrade,
      subject,
      chapter: chapter.trim(),
      fileType,
      fileSizeMb: Number(fileSizeMb),
      downloadUrl: '#',
      uploadedBy: currentRole === 'teacher' ? 'Faculty Member' : 'Coaching Academic Head',
      description: description.trim() || undefined,
    });

    setIsUploadModalOpen(false);
    setTitle('');
    setChapter('');
    setDescription('');
  };

  const handleDownload = (mat: StudyMaterial) => {
    incrementMaterialDownload(mat.id);
    showToast(`Downloading: "${mat.title}" (${mat.fileSizeMb} MB)`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.materials.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{t.materials.subtitle}</p>
        </div>

        {(currentRole === 'owner' || currentRole === 'teacher') && (
          <button
            onClick={() => {
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>{t.materials.uploadNew}</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by chapter, formula sheet name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Study Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No study materials found matching filters.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-700 block">{mat.classGrade}</span>
                    <span className="text-[10px] text-slate-500">{mat.subject}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{mat.title}</h3>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">{mat.chapter}</p>
                  {mat.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  <span>{mat.fileSizeMb} MB · {mat.fileType}</span>
                  <span className="block text-[10px] text-slate-400">
                    {mat.downloadCount} downloads
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(mat)}
                    className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900">{t.materials.uploadNew}</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Quadratic Equations Formula & Question Bank"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Class *</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value as ClassGrade)}
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
                  <label className="block text-slate-700 font-medium mb-1">Subject *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chapter / Unit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 - Electrostatics & Capacitance"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">File Format</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="DOCX">Word Document (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    File Size (MB) (Max 25MB)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    max="25"
                    value={fileSizeMb}
                    onChange={(e) => setFileSizeMb(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Description / Study Guidelines
                </label>
                <textarea
                  rows={2}
                  placeholder="Highlight key points, board exam tips, or homework instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Files are encrypted at rest with RBAC permissions for authorized students.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-700" />
                Study Resource Preview
              </span>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-xs text-blue-700 font-bold uppercase">
                {previewMaterial.classGrade} · {previewMaterial.subject}
              </div>
              <h2 className="text-base font-bold text-slate-900">{previewMaterial.title}</h2>
              <div className="text-slate-600 font-medium">{previewMaterial.chapter}</div>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                {previewMaterial.description ||
                  'Complete classroom notes, formulas, previous 10-year board questions, and solved exemplars.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 border-t border-slate-100 pt-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">Uploaded By:</span>
                <span className="font-semibold text-slate-800">{previewMaterial.uploadedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Published Date:</span>
                <span className="font-semibold text-slate-800">{previewMaterial.uploadedAt}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-mono text-[11px]">
                {previewMaterial.fileType} · {previewMaterial.fileSizeMb} MB
              </span>
              <button
                onClick={() => {
                  handleDownload(previewMaterial);
                  setPreviewMaterial(null);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
