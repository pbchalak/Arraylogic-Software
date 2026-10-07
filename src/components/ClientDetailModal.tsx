import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  MessageSquare,
  DollarSign,
  User,
  ExternalLink,
  Upload,
  FileCheck,
  Trash2,
  Edit,
  Clock,
  PlusCircle,
  FolderOpen,
} from 'lucide-react';
import { ClientLead, DriveAttachment } from '../types';
import { uploadClientFileToDrive } from '../services/driveService';
import { getAccessToken } from '../services/auth';
import { User as FirebaseUser } from 'firebase/auth';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ClientLead | null;
  onEdit: (lead: ClientLead) => void;
  onDelete: (lead: ClientLead) => void;
  onOpenFollowUp: (lead: ClientLead) => void;
  onUpdateLead: (updatedLead: ClientLead) => void;
  user: FirebaseUser | null;
  onGoogleSignIn: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onEdit,
  onDelete,
  onOpenFollowUp,
  onUpdateLead,
  user,
  onGoogleSignIn,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'followups' | 'drive-files'>('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const cleanPhone = lead.clientMobile.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
    `Hello ${lead.clientName}, regarding your inquiry with Arraylogic Software...`
  )}`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to upload files to Google Drive.');
      }

      const attachment = await uploadClientFileToDrive(file, lead.clientName, token);

      const updatedLead: ClientLead = {
        ...lead,
        driveAttachments: [...(lead.driveAttachments || []), attachment],
      };

      onUpdateLead(updatedLead);
    } catch (err: any) {
      console.error('File upload to Drive failed:', err);
      setUploadError(err.message || 'Failed to upload document to Google Drive');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedLead: ClientLead = {
      ...lead,
      driveAttachments: (lead.driveAttachments || []).filter((a) => a.id !== attachmentId),
    };
    onUpdateLead(updatedLead);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                  {lead.leadStatus}
                </span>
                <span className="text-xs text-indigo-200">
                  via {lead.leadSource}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lead.clientName}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                {lead.clientCompany || 'Individual Client'}
                <span className="text-slate-500">•</span>
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Assigned to: <strong className="text-white">{lead.employeeName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(lead)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Edit Client"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => onDelete(lead)}
                className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Delete Client"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Badges: Call, WhatsApp, Email */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <a
              href={`tel:${lead.clientMobile}`}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Call: {lead.clientMobile}
            </a>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Client
            </a>

            {lead.clientEmail && (
              <a
                href={`mailto:${lead.clientEmail}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {lead.clientEmail}
              </a>
            )}

            <button
              onClick={() => onOpenFollowUp(lead)}
              className="ml-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Follow-up
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Requirements
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'followups'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Follow-up History
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
              {lead.followUpHistory?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('drive-files')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'drive-files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Google Drive Files
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] rounded-full">
              {lead.driveAttachments?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Requirements & Budget Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Requested Services ({lead.requirements.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.requirements.map((req) => (
                      <span
                        key={req}
                        className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-md text-xs font-semibold shadow-2xs"
                      >
                        {req}
                      </span>
                    ))}
                    {lead.otherRequirementNote && (
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs font-medium">
                        Custom: {lead.otherRequirementNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Financials & Scheduling
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Estimated Budget:</span>
                      <span className="font-bold text-slate-900">
                        {lead.budget ? `${lead.currency || 'INR'} ${lead.budget}` : 'Not Specified'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Next Follow-up Date:</span>
                      <span className="font-bold text-indigo-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {lead.nextFollowUpDate || 'None Scheduled'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Lead Created:</span>
                      <span className="text-slate-700">
                        {new Date(lead.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {lead.clientAddress && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Office / Client Address
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">{lead.clientAddress}</p>
                </div>
              )}

              {/* Remarks / Discussion Notes */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Client Remarks, Notes & Requirements Specification
                </h4>
                {lead.remarks ? (
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {lead.remarks}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No general remarks noted yet. Click Edit to add notes.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Timeline of Discussions & Logs
                </h4>
                <button
                  onClick={() => onOpenFollowUp(lead)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Log Follow-up
                </button>
              </div>

              {lead.followUpHistory && lead.followUpHistory.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-indigo-100">
                  {lead.followUpHistory.map((fu, idx) => (
                    <div key={fu.id || idx} className="relative pl-7 text-xs">
                      <div className="absolute left-2 top-2 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900">{fu.employeeName}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(fu.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{fu.note}</p>
                        {fu.statusUpdatedTo && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">Stage:</span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded text-[10px]">
                              {fu.statusUpdatedTo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No follow-up entries logged yet. Click "Log Follow-up" to add the first conversation note.
                </div>
              )}
            </div>
          )}

          {activeTab === 'drive-files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-indigo-600" />
                    Google Drive Client Documents
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload proposals, quotation PDFs, agreements, and specifications stored in Google Drive.
                  </p>
                </div>

                {user && (
                  <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'Uploading to Drive...' : 'Upload File to Drive'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {uploadError}
                </div>
              )}

              {!user ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Connect Google Drive</h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Sign in with Google to upload client proposals, project contracts, and briefs directly to your Google Drive folder.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-xs"
                  >
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <>
                  {lead.driveAttachments && lead.driveAttachments.length > 0 ? (
                    <div className="space-y-2">
                      {lead.driveAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                                {att.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Uploaded on {new Date(att.uploadedAt).toLocaleDateString()}
                                {att.size ? ` • ${(att.size / 1024).toFixed(1)} KB` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {att.webViewLink && (
                              <a
                                href={att.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open in Drive
                              </a>
                            )}
                            <button
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                              title="Remove from lead record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      No files uploaded yet for this client. Click "Upload File to Drive" above to store proposals or project documents.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Arraylogic CRM Lead ID: <code className="text-slate-700">{lead.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
