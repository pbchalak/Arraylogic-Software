import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { loginWithPassword, registerAccount, DEFAULT_ACCOUNTS } from '../services/accountService';
import { EmployeeAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (employee: EmployeeAccount, rememberMe: boolean) => void;
  onGoogleSignIn: () => void;
  isGoogleLoggingIn: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onGoogleSignIn,
  isGoogleLoggingIn,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('shrawani@arraylogic.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Admin' | 'Sales Executive' | 'CRM Manager' | 'Team Lead' | 'Digital Marketing Executive'>('Sales Executive');
  const [regMobile, setRegMobile] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your employee email/name and password.');
      return;
    }

    const result = loginWithPassword(identifier, password);
    if (result.success && result.employee) {
      onLoginSuccess(result.employee, rememberMe);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const result = registerAccount(regName, regEmail, regPassword, regRole, regMobile);
    if (result.success && result.employee) {
      onLoginSuccess(result.employee, rememberMe);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickDemoLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMessage(null);
    const result = loginWithPassword(email, pass);
    if (result.success && result.employee) {
      onLoginSuccess(result.employee, rememberMe);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Top Decorative Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Building2 className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Arraylogic <span className="text-indigo-400">CRM</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Employee Authentication & Client Management Portal
          </p>

          {/* Tab Selector */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-4 max-w-xs mx-auto backdrop-blur-xs border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In with Password
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              New Employee
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. shrawani@arraylogic.com or Shrawani Gavli"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Default: <code className="text-indigo-600 font-mono">password123</code>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Sign In with Password
              </button>

              {/* Quick 1-Click Demo Accounts */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick 1-Click Demo Logins:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('shrawani@arraylogic.com', 'password123')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Shrawani Gavli</span>
                    <span className="text-[10px] text-slate-500">Sales Executive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('mamta@arraylogic.com', 'password123')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors"
                  >
                    <span className="font-bold text-slate-800 block truncate" title="Mamta Dasarwar">Mamta Dasarwar</span>
                    <span className="text-[10px] text-slate-500 truncate block">Digital Marketing Exec</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('akshay@arraylogic.com', 'password123')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Akshay Patil</span>
                    <span className="text-[10px] text-slate-500">CRM Manager</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('mayuri@arraylogic.com', 'password123')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors"
                  >
                    <span className="font-bold text-slate-800 block">Mayuri B.</span>
                    <span className="text-[10px] text-slate-500">Sales Executive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@arraylogic.com', 'admin123')}
                    className="col-span-2 p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Admin</span>
                      <span className="text-[10px] text-slate-500">Full System & Audit Access</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded">admin123</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@arraylogic.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Digital Marketing Executive">Digital Marketing Executive</option>
                    <option value="CRM Manager">CRM Manager</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9811223344"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Register & Enter CRM
              </button>
            </form>
          )}

          {/* Alternative Google Sign-in divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">
                Or Connect with Google Drive
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="gsi-material-button w-full"
              onClick={onGoogleSignIn}
              disabled={isGoogleLoggingIn}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-xs font-semibold">
                  {isGoogleLoggingIn ? 'Connecting...' : 'Continue with Google Account'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Arraylogic Software CRM • Secure Session Management
        </div>
      </div>
    </div>
  );
};
