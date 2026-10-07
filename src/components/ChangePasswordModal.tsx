import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  changePassword,
  adminResetOtherPassword,
  hasPasswordAdminRights,
  getStoredAccounts,
} from '../services/accountService';
import { EmployeeAccount } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: EmployeeAccount;
  onSuccess: (updatedEmployee: EmployeeAccount) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  onSuccess,
}) => {
  const isAkshayOrAdmin = hasPasswordAdminRights(currentEmployee);

  const [activeTab, setActiveTab] = useState<'self' | 'others'>(
    isAkshayOrAdmin ? 'others' : 'self'
  );

  // Self password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin password reset for other employees
  const allAccounts = getStoredAccounts();
  const otherEmployees = allAccounts.filter((acc) => acc.id !== currentEmployee.id);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    otherEmployees[0]?.id || ''
  );
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  if (!isOpen) return null;

  const selectedTargetAccount = allAccounts.find((a) => a.id === selectedTargetId);

  const handleSelfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    const result = changePassword(currentEmployee.id, oldPassword, newPassword);
    if (result.success) {
      onSuccess({ ...currentEmployee, password: newPassword });
      setSuccessMessage('Your password has been updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleAdminResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedTargetId) {
      setErrorMessage('Please select an employee.');
      return;
    }

    if (!adminNewPassword || !adminConfirmPassword) {
      setErrorMessage('Please enter and confirm the new password.');
      return;
    }

    if (adminNewPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    const result = adminResetOtherPassword(
      currentEmployee,
      selectedTargetId,
      adminNewPassword
    );

    if (result.success) {
      setSuccessMessage(
        `Password for ${result.targetEmployeeName || 'employee'} successfully updated to '${adminNewPassword}'!`
      );
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleGenerateRandomPassword = () => {
    const randomPass = 'Array@' + Math.floor(1000 + Math.random() * 9000);
    setAdminNewPassword(randomPass);
    setAdminConfirmPassword(randomPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Password Management
                </h3>
                {isAkshayOrAdmin && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-amber-200">
                    <Shield className="w-3 h-3 text-amber-600" /> Admin Rights: Akshay Patil
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Logged in as <strong className="text-slate-800">{currentEmployee.name}</strong> ({currentEmployee.role})
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

        {/* Tab Selection if user has Admin rights */}
        {isAkshayOrAdmin && (
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('others');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'others'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Reset Other Employee's Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('self');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'self'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              Change My Own Password
            </button>
          </div>
        )}

        <div className="p-5">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'others' && isAkshayOrAdmin ? (
            /* Admin Tab: Reset Password for Other Employees */
            <form onSubmit={handleAdminResetSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 leading-snug">
                  <strong>Akshay Patil Administrative Authority:</strong> You have elevated rights to change or reset passwords for any team member without needing their current password.
                </p>
              </div>

              {/* Target Employee Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Employee to Reset Password
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-semibold text-slate-800"
                >
                  {otherEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Target Profile Preview */}
              {selectedTargetAccount && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee Name:</span>
                    <strong className="text-slate-900">{selectedTargetAccount.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corporate Email:</span>
                    <span className="text-indigo-600 font-mono">{selectedTargetAccount.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">System Role:</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                      {selectedTargetAccount.role}
                    </span>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Password for {selectedTargetAccount?.name || 'Employee'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 characters)"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type new password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Update Password for {selectedTargetAccount?.name?.split(' ')[0] || 'Employee'}
                </button>
              </div>
            </form>
          ) : (
            /* Self Password Change Form */
            <form onSubmit={handleSelfSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new secure password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide passwords' : 'Show passwords'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Update My Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
