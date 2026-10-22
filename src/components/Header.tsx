import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  School,
  Globe,
  UserCheck,
  ChevronDown,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentInstitute,
    institutes,
    switchInstitute,
    currentRole,
    switchRole,
    currentLanguage,
    setLanguage,
    activeTab,
    setActiveTab,
    t,
  } = useApp();

  const [showInstMenu, setShowInstMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { key: UserRole; label: string; desc: string }[] = [
    { key: 'owner', label: t.roles.owner, desc: 'Full administrative & financial access' },
    { key: 'teacher', label: t.roles.teacher, desc: 'Class attendance, marks & study notes' },
    { key: 'accountant', label: t.roles.accountant, desc: 'Fee collections, receipts & ledgers' },
    { key: 'parent', label: t.roles.parent, desc: 'View linked child attendance, dues & results' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Coaching Institute Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {currentInstitute.logoInitial || 'E'}
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">EduManage</span>
              <span className="text-xs text-blue-600 block font-medium">Classes 6–12</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Institute Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowInstMenu(!showInstMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 text-sm font-semibold transition-colors border border-slate-200/80"
              aria-label="Switch coaching institute"
            >
              <School className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
                {currentInstitute.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {showInstMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Coaching Institute
                </div>
                {institutes.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      switchInstitute(inst.id);
                      setShowInstMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                      inst.id === currentInstitute.id ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {inst.logoInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{inst.name}</div>
                      <div className="text-xs text-slate-500 truncate">{inst.city}, {inst.state}</div>
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                  <div className="text-[11px] text-slate-500 px-2 py-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Strict multi-tenant database isolation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Role Switcher, Language Switcher, Landing Page Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Selector (Simulating Multi-Role Portal) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium transition-colors"
              aria-label="Change user role"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline text-slate-500 font-normal">Role:</span>
              <span className="font-semibold text-blue-900 capitalize">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Portal Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      switchRole(r.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      currentRole === r.key ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{r.label}</span>
                      {currentRole === r.key && <span className="text-xs text-blue-600 font-bold">Active</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher (Hindi / English) */}
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50 p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                currentLanguage === 'en'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Select English language"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                currentLanguage === 'hi'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="हिंदी भाषा चुनें"
            >
              हिंदी
            </button>
          </div>

          {/* Toggle Public Landing Page vs Dashboard */}
          {activeTab === 'marketingSite' ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('marketingSite')}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors hidden sm:flex items-center gap-1"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
