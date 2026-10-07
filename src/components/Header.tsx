import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Users,
  PlusCircle,
  Calendar,
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  LogOut,
  Building2,
  ChevronDown,
  KeyRound,
  Lock,
  Shield,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { EmployeeAccount } from '../types';
import { hasPasswordAdminRights } from '../services/accountService';

interface HeaderProps {
  activeTab: 'dashboard' | 'add-client' | 'followups' | 'import-export' | 'google-drive';
  setActiveTab: (tab: 'dashboard' | 'add-client' | 'followups' | 'import-export' | 'google-drive') => void;
  user: User | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  selectedEmployee: string;
  setSelectedEmployee: (emp: string) => void;
  employeeList: string[];
  pendingFollowUpsCount: number;
  totalLeadsCount: number;
  activeEmployee: EmployeeAccount | null;
  onOpenLoginModal: () => void;
  onOpenChangePasswordModal: () => void;
  onOpenAuditLogs: () => void;
  onLockScreen: () => void;
  onEmployeeLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onGoogleSignIn,
  onLogout,
  isLoggingIn,
  selectedEmployee,
  setSelectedEmployee,
  employeeList,
  pendingFollowUpsCount,
  totalLeadsCount,
  activeEmployee,
  onOpenLoginModal,
  onOpenChangePasswordModal,
  onOpenAuditLogs,
  onLockScreen,
  onEmployeeLogout,
}) => {
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Arraylogic
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    CRM
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                  Software & IT Solutions
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Clients ({totalLeadsCount})
            </button>

            <button
              onClick={() => setActiveTab('add-client')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'add-client'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Client
            </button>

            <button
              onClick={() => setActiveTab('followups')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'followups'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Follow-ups
              {pendingFollowUpsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {pendingFollowUpsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('import-export')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'import-export'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel / CSV
            </button>

            <button
              onClick={() => setActiveTab('google-drive')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'google-drive'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              Google Drive
              {user && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* User & Employee Context */}
          <div className="flex items-center gap-2.5">
            {/* Active Employee Selector */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] text-slate-600 font-medium">Filter View:</span>
              <div className="relative inline-block">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 pr-5 py-0.5 border-none outline-hidden cursor-pointer appearance-none"
                >
                  <option value="All">All Leads</option>
                  {employeeList.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Employee Account Profile with Password & Security Controls */}
            {activeEmployee ? (
              <div className="relative">
                <button
                  onClick={() => setShowEmployeeMenu(!showEmployeeMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {activeEmployee.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {activeEmployee.name}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-medium">
                      {activeEmployee.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showEmployeeMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in duration-100">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{activeEmployee.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{activeEmployee.email}</p>
                      <span className="inline-block px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded mt-1">
                        {activeEmployee.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          onLockScreen();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        Lock Workstation
                      </button>

                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          onOpenChangePasswordModal();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        {hasPasswordAdminRights(activeEmployee)
                          ? 'Manage & Reset Team Passwords'
                          : 'Change Password'}
                      </button>

                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          onOpenAuditLogs();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        Security Audit Logs
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          onEmployeeLogout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out of Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Log with Password</span>
              </button>
            )}

            {/* Google Drive Status Button */}
            {user ? (
              <div
                onClick={() => setActiveTab('google-drive')}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200"
                title={`Google Drive connected: ${user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                    G
                  </div>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
              </div>
            ) : (
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                title="Connect Google Drive"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden lg:inline">Connect Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Clients ({totalLeadsCount})
          </button>
          <button
            onClick={() => setActiveTab('add-client')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              activeTab === 'add-client' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            + Add Client
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              activeTab === 'followups' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Follow-ups {pendingFollowUpsCount > 0 ? `(${pendingFollowUpsCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              activeTab === 'import-export' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab('google-drive')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              activeTab === 'google-drive' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Drive {user ? '●' : ''}
          </button>
        </div>
      </div>
    </header>
  );
};
