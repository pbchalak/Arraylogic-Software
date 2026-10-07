import React, { useState } from 'react';
import { X, Shield, Clock, User, Filter, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getSystemAuditLogs } from '../services/accountService';
import { EmployeeAccount, SystemAuditLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: EmployeeAccount | null;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [passwordVerified, setPasswordVerified] = useState<boolean>(
    currentEmployee?.role === 'Admin' ? false : false
  );
  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  if (!isOpen) return null;

  const logs = getSystemAuditLogs();

  const handlePasswordCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEmployee && verifyPasswordInput === currentEmployee.password) {
      setPasswordVerified(true);
      setVerifyError(null);
    } else {
      setVerifyError('Incorrect password. Access denied.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System & Security Audit Log</h3>
              <p className="text-[11px] text-slate-500">
                Password logins, client additions, and administrative actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Password Verification Protection */}
        {!passwordVerified ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Password Authentication Required
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                To view security and activity audit logs, please verify your account password.
              </p>
            </div>

            {verifyError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {verifyError}
              </div>
            )}

            <form onSubmit={handlePasswordCheck} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password to verify"
                value={verifyPasswordInput}
                onChange={(e) => setVerifyPasswordInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-center"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Verify & Access Logs
              </button>
            </form>
          </div>
        ) : (
          /* Logs View */
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Filter Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded-md outline-hidden font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="auth">Auth & Logins</option>
                  <option value="lead">Client Leads</option>
                  <option value="backup">Cloud Backups</option>
                  <option value="export">Exports</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-400">
                Total Logs: {filteredLogs.length}
              </span>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2.5 max-h-96">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-medium uppercase">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.employeeName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No audit log entries recorded in this category yet.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
