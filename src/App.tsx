import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
} from './services/auth';
import {
  getStoredLeads,
  saveStoredLeads,
  getStoredEmployees,
  addStoredEmployee,
  exportLeadsToCSV,
} from './services/storage';
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  logSystemAction,
  getStoredAccounts,
} from './services/accountService';
import { ClientLead, EmployeeAccount } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientFormModal } from './components/ClientFormModal';
import { ClientDetailModal } from './components/ClientDetailModal';
import { FollowUpModal } from './components/FollowUpModal';
import { FollowUpsView } from './components/FollowUpsView';
import { ImportExportModal } from './components/ImportExportModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { ConfirmModal } from './components/ConfirmModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LockScreenModal } from './components/LockScreenModal';
import { AuditLogModal } from './components/AuditLogModal';

export default function App() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('All');

  // Employee Password Authentication State
  const [activeEmployee, setActiveEmployee] = useState<EmployeeAccount | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isLockScreenModalOpen, setIsLockScreenModalOpen] = useState<boolean>(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState<boolean>(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'add-client' | 'followups' | 'import-export' | 'google-drive'
  >('dashboard');

  // Auth & Drive State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Modals & Drawers
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ClientLead | null>(null);
  const [viewingLead, setViewingLead] = useState<ClientLead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<ClientLead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<ClientLead | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load leads, employees and active session on mount
  useEffect(() => {
    const loadedLeads = getStoredLeads();
    setLeads(loadedLeads);
    const loadedEmployees = getStoredEmployees();
    setEmployees(loadedEmployees);

    // Check stored employee session
    const existingSession = getActiveSession();
    if (existingSession?.employee) {
      setActiveEmployee(existingSession.employee);
    } else {
      // Default to first employee account or prompt login modal
      const accounts = getStoredAccounts();
      if (accounts.length > 0) {
        setActiveEmployee(accounts[0]);
        setActiveSession(accounts[0], true);
      } else {
        setIsLoginModalOpen(true);
      }
    }
  }, []);

  // Save leads to localStorage whenever changed
  const updateLeadsState = (updated: ClientLead[]) => {
    setLeads(updated);
    saveStoredLeads(updated);
  };

  // Init Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        logSystemAction(
          activeEmployee?.name || 'User',
          'Google Drive Connected',
          `Authenticated with account: ${res.user.email}`,
          'auth'
        );
        showToast(`Connected as ${res.user.displayName || res.user.email} with Google Drive!`);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      showToast('Google Sign-In was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('Signed out of Google account.');
  };

  // Employee Password Login Handlers
  const handleLoginSuccess = (employee: EmployeeAccount, rememberMe: boolean) => {
    setActiveEmployee(employee);
    setActiveSession(employee, rememberMe);
    setIsLoginModalOpen(false);
    showToast(`Welcome back, ${employee.name} (${employee.role})!`);
  };

  const handleEmployeeLogout = () => {
    clearActiveSession();
    setActiveEmployee(null);
    setIsLoginModalOpen(true);
    showToast('Logged out of employee workstation session.');
  };

  const handleSaveLead = (leadToSave: ClientLead, isNew: boolean) => {
    if (isNew) {
      const nextLeads = [leadToSave, ...leads];
      updateLeadsState(nextLeads);
      logSystemAction(
        activeEmployee?.name || leadToSave.employeeName,
        'Client Added',
        `New client '${leadToSave.clientName}' added with status: ${leadToSave.leadStatus}`,
        'lead'
      );
      showToast(`Client '${leadToSave.clientName}' added successfully to CRM.`);
    } else {
      const nextLeads = leads.map((l) => (l.id === leadToSave.id ? leadToSave : l));
      updateLeadsState(nextLeads);
      if (viewingLead && viewingLead.id === leadToSave.id) {
        setViewingLead(leadToSave);
      }
      logSystemAction(
        activeEmployee?.name || leadToSave.employeeName,
        'Client Updated',
        `Client '${leadToSave.clientName}' details updated`,
        'lead'
      );
      showToast(`Client record for '${leadToSave.clientName}' updated.`);
    }
  };

  const handleConfirmDelete = () => {
    if (!leadToDelete) return;
    const nextLeads = leads.filter((l) => l.id !== leadToDelete.id);
    updateLeadsState(nextLeads);
    if (viewingLead?.id === leadToDelete.id) {
      setViewingLead(null);
    }
    logSystemAction(
      activeEmployee?.name || 'Employee',
      'Client Deleted',
      `Client lead '${leadToDelete.clientName}' was permanently removed`,
      'lead'
    );
    showToast(`Lead '${leadToDelete.clientName}' removed from CRM.`);
    setLeadToDelete(null);
  };

  const handleSaveFollowUp = (updatedLead: ClientLead) => {
    const nextLeads = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    updateLeadsState(nextLeads);
    if (viewingLead && viewingLead.id === updatedLead.id) {
      setViewingLead(updatedLead);
    }
    logSystemAction(
      activeEmployee?.name || updatedLead.employeeName,
      'Follow-up Logged',
      `Follow-up recorded for ${updatedLead.clientName}. Status: ${updatedLead.leadStatus}`,
      'lead'
    );
    showToast(`Follow-up activity recorded for ${updatedLead.clientName}.`);
  };

  const handleAddEmployee = (empName: string) => {
    const updated = addStoredEmployee(empName);
    setEmployees(updated);
    showToast(`Employee '${empName}' added.`);
  };

  const handleImportLeads = (newLeads: ClientLead[], replaceExisting: boolean) => {
    if (replaceExisting) {
      updateLeadsState(newLeads);
    } else {
      updateLeadsState([...newLeads, ...leads]);
    }
    logSystemAction(
      activeEmployee?.name || 'Employee',
      'Spreadsheet Imported',
      `Imported ${newLeads.length} leads. Mode: ${replaceExisting ? 'Replace' : 'Append'}`,
      'export'
    );
    showToast(`Imported ${newLeads.length} leads successfully!`);
    setActiveTab('dashboard');
  };

  const handleRestoreLeads = (restoredLeads: ClientLead[]) => {
    updateLeadsState(restoredLeads);
    logSystemAction(
      activeEmployee?.name || 'Employee',
      'Google Drive Restored',
      `Restored ${restoredLeads.length} leads from Google Drive backup snapshot`,
      'backup'
    );
    showToast(`Restored ${restoredLeads.length} leads from Google Drive backup.`);
    setActiveTab('dashboard');
  };

  // Calculate pending follow-ups
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowUpsCount = leads.filter(
    (l) =>
      l.nextFollowUpDate &&
      l.nextFollowUpDate <= todayStr &&
      l.leadStatus !== 'Won' &&
      l.leadStatus !== 'Lost'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header with Password & Account Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add-client') {
            setEditingLead(null);
            setIsAddClientModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        selectedEmployee={selectedEmployeeFilter}
        setSelectedEmployee={setSelectedEmployeeFilter}
        employeeList={employees}
        pendingFollowUpsCount={pendingFollowUpsCount}
        totalLeadsCount={leads.length}
        activeEmployee={activeEmployee}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsModalOpen(true)}
        onLockScreen={() => setIsLockScreenModalOpen(true)}
        onEmployeeLogout={handleEmployeeLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            onAddNewClient={() => {
              setEditingLead(null);
              setIsAddClientModalOpen(true);
            }}
            onViewClient={(lead) => setViewingLead(lead)}
            onEditClient={(lead) => {
              setEditingLead(lead);
              setIsAddClientModalOpen(true);
            }}
            onDeleteClient={(lead) => setLeadToDelete(lead)}
            onOpenFollowUp={(lead) => setFollowUpLead(lead)}
            onExportFiltered={(filtered) => {
              logSystemAction(
                activeEmployee?.name || 'Employee',
                'Export CSV',
                `Exported ${filtered.length} client leads to CSV`,
                'export'
              );
              exportLeadsToCSV(filtered);
            }}
            selectedEmployeeFilter={selectedEmployeeFilter}
            setSelectedEmployeeFilter={setSelectedEmployeeFilter}
            employees={employees}
          />
        )}

        {activeTab === 'followups' && (
          <FollowUpsView
            leads={leads}
            onOpenFollowUp={(lead) => setFollowUpLead(lead)}
            onViewClient={(lead) => setViewingLead(lead)}
          />
        )}

        {activeTab === 'import-export' && (
          <ImportExportModal
            leads={leads}
            onImportLeads={handleImportLeads}
            defaultEmployee={activeEmployee?.name || selectedEmployeeFilter}
          />
        )}

        {activeTab === 'google-drive' && (
          <GoogleDriveModal
            user={user}
            onGoogleSignIn={handleGoogleSignIn}
            leads={leads}
            onRestoreLeads={handleRestoreLeads}
          />
        )}
      </main>

      {/* Add / Edit Client Modal */}
      <ClientFormModal
        isOpen={isAddClientModalOpen}
        onClose={() => {
          setIsAddClientModalOpen(false);
          setEditingLead(null);
        }}
        onSaveLead={handleSaveLead}
        initialLead={editingLead}
        employees={employees}
        defaultEmployee={activeEmployee?.name || selectedEmployeeFilter}
        onAddEmployee={handleAddEmployee}
      />

      {/* 360 Client Detail Modal */}
      <ClientDetailModal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
        onEdit={(lead) => {
          setViewingLead(null);
          setEditingLead(lead);
          setIsAddClientModalOpen(true);
        }}
        onDelete={(lead) => {
          setLeadToDelete(lead);
        }}
        onOpenFollowUp={(lead) => setFollowUpLead(lead)}
        onUpdateLead={(updated) => {
          setViewingLead(updated);
          handleSaveLead(updated, false);
        }}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Follow-up Quick Logging Modal */}
      <FollowUpModal
        isOpen={!!followUpLead}
        onClose={() => setFollowUpLead(null)}
        lead={followUpLead}
        onSaveFollowUp={handleSaveFollowUp}
        currentEmployee={activeEmployee?.name || selectedEmployeeFilter}
      />

      {/* Lead Deletion Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Delete Client Record?"
        message={`Are you sure you want to permanently delete the lead '${leadToDelete?.clientName}' (${leadToDelete?.clientCompany})? This action will remove all recorded notes and follow-up logs.`}
        confirmLabel="Yes, Delete Client"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />

      {/* Employee Login with Password Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onGoogleSignIn={handleGoogleSignIn}
        isGoogleLoggingIn={isLoggingIn}
      />

      {/* Change Password Modal */}
      {activeEmployee && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          currentEmployee={activeEmployee}
          onSuccess={(updated) => {
            setActiveEmployee(updated);
            setActiveSession(updated, true);
            showToast('Account password updated successfully.');
          }}
        />
      )}

      {/* Workstation Lock Screen Modal */}
      <LockScreenModal
        isLocked={isLockScreenModalOpen}
        currentEmployee={activeEmployee}
        onUnlock={() => setIsLockScreenModalOpen(false)}
        onLogout={handleEmployeeLogout}
      />

      {/* System Security & Activity Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
        currentEmployee={activeEmployee}
      />
    </div>
  );
}
