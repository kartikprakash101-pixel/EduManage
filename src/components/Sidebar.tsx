import React from 'react';
import { useApp, AppTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck2,
  GraduationCap,
  FileText,
  BarChart3,
  Sparkles,
  Database,
  Globe,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, t, students, payments } = useApp();

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      tab: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      tab: 'students',
      label: t.nav.students,
      icon: <Users className="w-4 h-4" />,
      badge: students.length,
    },
    {
      tab: 'fees',
      label: t.nav.fees,
      icon: <CreditCard className="w-4 h-4" />,
      badge: payments.length,
    },
    {
      tab: 'attendance',
      label: t.nav.attendance,
      icon: <CalendarCheck2 className="w-4 h-4" />,
    },
    {
      tab: 'exams',
      label: t.nav.exams,
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      tab: 'materials',
      label: t.nav.materials,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      tab: 'reports',
      label: t.nav.reports,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      tab: 'aiAssistant',
      label: t.nav.aiAssistant,
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: 'AI',
    },
    {
      tab: 'setupDocs',
      label: t.nav.setupDocs,
      icon: <Database className="w-4 h-4" />,
    },
    {
      tab: 'marketingSite',
      label: t.nav.marketingSite,
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="p-4 flex-1 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Management
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-700' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.badge === 'AI'
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role Access Indicator Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 m-3 rounded-lg">
          <div className="text-xs text-slate-500 font-medium">Session Role</div>
          <div className="text-sm font-bold text-slate-900 capitalize flex items-center justify-between mt-0.5">
            <span>{currentRole} Access</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Session" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentRole === 'owner' && 'Full privileges over fees, staff & reports.'}
            {currentRole === 'teacher' && 'Can record attendance, marks & study materials.'}
            {currentRole === 'accountant' && 'Can record payments & view fee ledgers.'}
            {currentRole === 'parent' && 'Protected view of linked student records.'}
          </div>
        </div>
      </aside>

      {/* Mobile Horizontal Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-md">
        <div className="flex items-center justify-around overflow-x-auto py-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-500'
                }`}
              >
                <span>{item.icon}</span>
                <span className="truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'reports' ? 'text-blue-700 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
