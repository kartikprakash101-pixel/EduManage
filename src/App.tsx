import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { FeesView } from './components/FeesView';
import { AttendanceView } from './components/AttendanceView';
import { ExamsView } from './components/ExamsView';
import { MaterialsView } from './components/MaterialsView';
import { ReportsView } from './components/ReportsView';
import { AiAssistantView } from './components/AiAssistantView';
import { DocsAndSetupView } from './components/DocsAndSetupView';
import { PublicLandingPage } from './components/PublicLandingPage';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, currentRole, currentInstitute, toasts, removeToast } = useApp();

  if (activeTab === 'marketingSite') {
    return <PublicLandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Role Notice Bar if switched away from default owner */}
      {currentRole !== 'owner' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              Simulating portal view as <strong>{currentRole.toUpperCase()}</strong> for{' '}
              {currentInstitute.name}. Role-based permissions are actively enforced.
            </span>
          </div>
          <span className="text-[11px] text-blue-600 font-medium hidden sm:inline">
            Use Header switcher to change role
          </span>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'fees' && <FeesView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'exams' && <ExamsView />}
          {activeTab === 'materials' && <MaterialsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'aiAssistant' && <AiAssistantView />}
          {activeTab === 'setupDocs' && <DocsAndSetupView />}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-16 lg:bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-lg border text-xs flex items-start gap-2.5 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
