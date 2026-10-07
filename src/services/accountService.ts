import { EmployeeAccount, AuthSession, SystemAuditLog } from '../types';

const ACCOUNTS_STORAGE_KEY = 'arraylogic_crm_accounts_v2';
const SESSION_STORAGE_KEY = 'arraylogic_crm_active_session_v2';
const AUDIT_LOGS_STORAGE_KEY = 'arraylogic_crm_audit_logs_v1';

export const DEFAULT_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'emp-1',
    name: 'Shrawani Gavli',
    email: 'shrawani@arraylogic.com',
    password: 'password123',
    role: 'Sales Executive',
    mobile: '9820123456',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'emp-2',
    name: 'Mamta Dasarwar (Digital Marketing Executive)',
    email: 'mamta@arraylogic.com',
    password: 'password123',
    role: 'Digital Marketing Executive',
    mobile: '9730987654',
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'emp-3',
    name: 'Akshay Patil',
    email: 'akshay@arraylogic.com',
    password: 'password123',
    role: 'CRM Manager',
    mobile: '9845112233',
    createdAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'emp-4',
    name: 'Mayuri B.',
    email: 'mayuri@arraylogic.com',
    password: 'password123',
    role: 'Sales Executive',
    mobile: '9921445566',
    createdAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'emp-5',
    name: 'Admin',
    email: 'admin@arraylogic.com',
    password: 'admin123',
    role: 'Admin',
    mobile: '9900112233',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

const migrateAccount = (acc: EmployeeAccount): EmployeeAccount => {
  if (acc.name === 'Rahul Sharma' || acc.email === 'rahul@arraylogic.com') {
    return { ...acc, name: 'Shrawani Gavli', email: 'shrawani@arraylogic.com' };
  }
  if (acc.name === 'Priya Patel' || acc.email === 'priya@arraylogic.com') {
    return {
      ...acc,
      name: 'Mamta Dasarwar (Digital Marketing Executive)',
      email: 'mamta@arraylogic.com',
      role: 'Digital Marketing Executive',
    };
  }
  if (acc.name === 'Amit Verma' || acc.email === 'amit@arraylogic.com') {
    return { ...acc, name: 'Akshay Patil', email: 'akshay@arraylogic.com' };
  }
  if (acc.name === 'Neha Deshmukh' || acc.email === 'neha@arraylogic.com') {
    return { ...acc, name: 'Mayuri B.', email: 'mayuri@arraylogic.com' };
  }
  return acc;
};

export function getStoredAccounts(): EmployeeAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY) || localStorage.getItem('arraylogic_crm_accounts_v1');
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed: EmployeeAccount[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const migrated = parsed.map(migrateAccount);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch (e) {
    console.error('Failed to read accounts from storage:', e);
    return DEFAULT_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: EmployeeAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage:', e);
  }
}

export function loginWithPassword(
  identifier: string,
  pass: string
): { success: boolean; employee?: EmployeeAccount; message: string } {
  const accounts = getStoredAccounts();
  const cleanId = identifier.trim().toLowerCase();

  const account = accounts.find(
    (acc) =>
      acc.email.toLowerCase() === cleanId ||
      acc.name.toLowerCase() === cleanId
  );

  if (!account) {
    return {
      success: false,
      message: 'No employee account found matching this Email or Name.',
    };
  }

  if (account.password !== pass) {
    return {
      success: false,
      message: 'Incorrect password. Please verify and try again.',
    };
  }

  // Record audit log
  logSystemAction(
    account.name,
    'Login Success',
    `Employee logged into CRM via password`,
    'auth'
  );

  return {
    success: true,
    employee: account,
    message: 'Login successful!',
  };
}

export function registerAccount(
  name: string,
  email: string,
  pass: string,
  role: 'Admin' | 'Sales Executive' | 'CRM Manager' | 'Team Lead' | 'Digital Marketing Executive' = 'Sales Executive',
  mobile?: string
): { success: boolean; employee?: EmployeeAccount; message: string } {
  const accounts = getStoredAccounts();
  const cleanEmail = email.trim().toLowerCase();

  if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      message: 'An account with this email address already exists.',
    };
  }

  const newAcc: EmployeeAccount = {
    id: 'emp-' + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password: pass,
    role,
    mobile: mobile?.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = [...accounts, newAcc];
  saveStoredAccounts(updated);

  logSystemAction(
    name,
    'Account Registered',
    `New employee registered with role: ${role}`,
    'auth'
  );

  return {
    success: true,
    employee: newAcc,
    message: 'Employee account created successfully.',
  };
}

export function changePassword(
  accountId: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.id === accountId);

  if (index === -1) {
    return { success: false, message: 'Account not found.' };
  }

  if (accounts[index].password !== oldPass) {
    return { success: false, message: 'Current password does not match.' };
  }

  accounts[index].password = newPass;
  saveStoredAccounts(accounts);

  logSystemAction(
    accounts[index].name,
    'Password Changed',
    'Employee updated their account password',
    'auth'
  );

  return { success: true, message: 'Password updated successfully!' };
}

export function hasPasswordAdminRights(employee: EmployeeAccount | null): boolean {
  if (!employee) return false;
  return (
    employee.name.toLowerCase().includes('akshay patil') ||
    employee.email.toLowerCase().includes('akshay') ||
    employee.role === 'Admin'
  );
}

export function adminResetOtherPassword(
  operator: EmployeeAccount,
  targetAccountId: string,
  newPass: string
): { success: boolean; message: string; targetEmployeeName?: string } {
  if (!hasPasswordAdminRights(operator)) {
    return {
      success: false,
      message: 'Access Denied: Only Akshay Patil or Admin has rights to change passwords of other employees.',
    };
  }

  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.id === targetAccountId);

  if (index === -1) {
    return { success: false, message: 'Target employee account not found.' };
  }

  accounts[index].password = newPass;
  saveStoredAccounts(accounts);

  logSystemAction(
    operator.name,
    'Admin Password Reset',
    `Akshay Patil reset password for employee '${accounts[index].name}' (${accounts[index].email})`,
    'auth'
  );

  return {
    success: true,
    message: `Password for ${accounts[index].name} has been successfully updated!`,
    targetEmployeeName: accounts[index].name,
  };
}

export function getActiveSession(): AuthSession | null {
  try {
    const rawLocal = localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem('arraylogic_crm_active_session_v1');
    if (rawLocal) {
      const session: AuthSession = JSON.parse(rawLocal);
      session.employee = migrateAccount(session.employee);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
    const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem('arraylogic_crm_active_session_v1');
    if (rawSession) {
      const session: AuthSession = JSON.parse(rawSession);
      session.employee = migrateAccount(session.employee);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setActiveSession(employee: EmployeeAccount, rememberMe: boolean = true): void {
  const session: AuthSession = {
    employee,
    loginTime: new Date().toISOString(),
  };

  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function clearActiveSession(): void {
  try {
    const current = getActiveSession();
    if (current) {
      logSystemAction(
        current.employee.name,
        'Logout',
        'Employee signed out of CRM session',
        'auth'
      );
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export function logSystemAction(
  employeeName: string,
  action: string,
  details: string,
  category: 'auth' | 'lead' | 'backup' | 'export' = 'auth'
): void {
  try {
    const currentLogs = getSystemAuditLogs();
    const newEntry: SystemAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      employeeName,
      action,
      details,
      category,
    };
    const updated = [newEntry, ...currentLogs.slice(0, 199)]; // retain last 200 logs
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save audit log:', e);
  }
}

export function getSystemAuditLogs(): SystemAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
