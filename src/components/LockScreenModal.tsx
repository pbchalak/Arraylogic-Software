import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, AlertCircle, LogOut, Shield } from 'lucide-react';
import { EmployeeAccount } from '../types';

interface LockScreenModalProps {
  isLocked: boolean;
  currentEmployee: EmployeeAccount | null;
  onUnlock: () => void;
  onLogout: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isLocked,
  currentEmployee,
  onUnlock,
  onLogout,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLocked || !currentEmployee) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === currentEmployee.password) {
      setPassword('');
      setError(null);
      onUnlock();
    } else {
      setError('Incorrect password. Please enter your account password to unlock.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 mx-auto flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-500/10 mb-3">
          {currentEmployee.name.charAt(0)}
        </div>

        <div className="space-y-0.5 mb-5">
          <h2 className="text-base font-bold text-slate-900">{currentEmployee.name}</h2>
          <p className="text-xs text-indigo-600 font-semibold">{currentEmployee.role}</p>
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Workstation Locked for Security</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlockSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              placeholder="Enter password to unlock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Unlock CRM
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Not {currentEmployee.name}?</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Employee
          </button>
        </div>
      </div>
    </div>
  );
};
