import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
} from 'lucide-react';
import { ClientLead, DriveBackupFile } from '../types';
import {
  uploadBackupToDrive,
  listDriveBackups,
  downloadFileContent,
  deleteDriveFile,
} from '../services/driveService';
import { getAccessToken } from '../services/auth';
import { ConfirmModal } from './ConfirmModal';

interface GoogleDriveModalProps {
  user: User | null;
  onGoogleSignIn: () => void;
  leads: ClientLead[];
  onRestoreLeads: (restored: ClientLead[]) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  user,
  onGoogleSignIn,
  leads,
  onRestoreLeads,
}) => {
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive confirmation state (Required by Workspace integration guidelines)
  const [pendingConfirm, setPendingConfirm] = useState<{
    action: 'restore' | 'delete';
    backup: DriveBackupFile;
  } | null>(null);

  const fetchBackups = async () => {
    if (!user) return;
    setIsLoadingBackups(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const list = await listDriveBackups(token);
      setBackups(list);
    } catch (err: any) {
      console.error('Failed to list backups:', err);
      setStatusMessage({
        type: 'error',
        text: `Error fetching Google Drive backups: ${err.message || 'Check network connection'}`,
      });
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBackups();
    }
  }, [user]);

  const handleCreateBackup = async () => {
    if (!user) return;
    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google first.');
      }
      const result = await uploadBackupToDrive(leads, token);
      setStatusMessage({
        type: 'success',
        text: `Backup '${result.name}' successfully uploaded to your Google Drive!`,
      });
      await fetchBackups();
    } catch (err: any) {
      console.error('Backup failed:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to backup to Google Drive: ${err.message}`,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirm) return;
    const { action, backup } = pendingConfirm;
    setPendingConfirm(null);

    const token = await getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Authentication token missing. Please sign in.' });
      return;
    }

    if (action === 'restore') {
      try {
        const rawContent = await downloadFileContent(backup.id, token);
        const parsed = JSON.parse(rawContent);
        const leadsData = parsed.leads || (Array.isArray(parsed) ? parsed : []);
        if (!Array.isArray(leadsData)) {
          throw new Error('Invalid backup file structure.');
        }
        onRestoreLeads(leadsData);
        setStatusMessage({
          type: 'success',
          text: `Successfully restored ${leadsData.length} client leads from Google Drive backup '${backup.name}'.`,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Failed to restore from backup: ${err.message}`,
        });
      }
    } else if (action === 'delete') {
      try {
        await deleteDriveFile(backup.id, token);
        setStatusMessage({
          type: 'success',
          text: `Backup file '${backup.name}' deleted from Google Drive.`,
        });
        await fetchBackups();
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Failed to delete file from Google Drive: ${err.message}`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Cloud className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Google Drive Cloud Sync & Backups
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Safeguard your client records, export leads, and restore data anytime using official Google Drive storage.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBackups}
              disabled={isLoadingBackups}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5"
              title="Refresh Google Drive files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              {isBackingUp ? 'Backing up...' : 'Backup Current CRM to Drive'}
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span className="flex-1 font-medium">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {!user ? (
        /* Not logged in banner */
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Connect Google Drive to Arraylogic CRM
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sign in with your Google account to automatically create backups, sync your client database to cloud storage, and upload proposals.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              className="gsi-material-button"
              onClick={onGoogleSignIn}
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
                  Sign in with Google
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Files are securely saved to your personal Google Drive folder</span>
          </div>
        </div>
      ) : (
        /* Connected view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User & Folder status card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Connection Status
            </h3>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {(user.displayName || user.email || 'A')[0].toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user.displayName || 'Authenticated Google User'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Drive File Scope Enabled
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Destination Folder:</span>
                <span className="font-semibold text-slate-800 text-right">
                  Arraylogic CRM Backups & Documents
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Local Leads in Memory:</span>
                <span className="font-bold text-slate-900">{leads.length}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Drive Backups Stored:</span>
                <span className="font-bold text-indigo-600">{backups.length}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCreateBackup}
                disabled={isBackingUp}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                {isBackingUp ? 'Saving to Drive...' : 'Save Instant Backup Now'}
              </button>
            </div>
          </div>

          {/* List of Backups in Google Drive */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                  Stored Backups in Google Drive ({backups.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Select a snapshot to restore lead records into the active CRM dashboard.
                </p>
              </div>

              <button
                onClick={fetchBackups}
                disabled={isLoadingBackups}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Reload"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-96 space-y-3">
              {isLoadingBackups ? (
                <div className="py-12 text-center text-xs text-indigo-600 font-medium animate-pulse">
                  Querying Google Drive files...
                </div>
              ) : backups.length > 0 ? (
                backups.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{b.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(b.createdTime).toLocaleString()}
                          </span>
                          {b.size && (
                            <>
                              <span>•</span>
                              <span>{(parseInt(b.size, 10) / 1024).toFixed(1)} KB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {b.webViewLink && (
                        <a
                          href={b.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => setPendingConfirm({ action: 'restore', backup: b })}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        Restore to CRM
                      </button>

                      <button
                        onClick={() => setPendingConfirm({ action: 'delete', backup: b })}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Cloud className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No backups found in Google Drive yet.</p>
                  <p className="mt-1 text-slate-500">
                    Click "Backup Current CRM to Drive" above to create your first cloud snapshot.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      <ConfirmModal
        isOpen={!!pendingConfirm}
        title={
          pendingConfirm?.action === 'restore'
            ? 'Restore CRM Data from Google Drive?'
            : 'Delete Backup from Google Drive?'
        }
        message={
          pendingConfirm?.action === 'restore'
            ? `Are you sure you want to restore leads from '${pendingConfirm.backup.name}'? This will update your active CRM client list with the snapshot data.`
            : `Are you sure you want to permanently delete '${pendingConfirm?.backup.name}' from Google Drive? This action cannot be undone.`
        }
        confirmLabel={pendingConfirm?.action === 'restore' ? 'Yes, Restore' : 'Yes, Delete'}
        cancelLabel="Cancel"
        isDestructive={pendingConfirm?.action === 'delete'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
};
