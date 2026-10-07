import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Clock, CheckCircle2, User } from 'lucide-react';
import { ClientLead, LeadStatus, ALL_LEAD_STATUSES, FollowUpLog } from '../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ClientLead | null;
  onSaveFollowUp: (updatedLead: ClientLead) => void;
  currentEmployee: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSaveFollowUp,
  currentEmployee,
}) => {
  if (!isOpen || !lead) return null;

  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<LeadStatus>(lead.leadStatus);
  const [nextDate, setNextDate] = useState(lead.nextFollowUpDate || '');
  const [employee, setEmployee] = useState(
    currentEmployee && currentEmployee !== 'All' ? currentEmployee : lead.employeeName
  );

  const setDateShortcut = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    setNextDate(target.toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (!note.trim()) return;

    const newLog: FollowUpLog = {
      id: 'fu-' + Date.now(),
      date: new Date().toISOString(),
      note: note.trim(),
      employeeName: employee,
      statusUpdatedTo: newStatus,
    };

    const updatedLead: ClientLead = {
      ...lead,
      leadStatus: newStatus,
      nextFollowUpDate: nextDate || undefined,
      lastFollowUpDate: new Date().toISOString().split('T')[0],
      lastFollowUpRemarks: note.trim(),
      followUpHistory: [newLog, ...(lead.followUpHistory || [])],
    };

    onSaveFollowUp(updatedLead);
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Log Follow-Up Activity
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {lead.clientName} <span className="text-slate-400 font-normal">({lead.clientCompany})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Note Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Discussion Summary / Meeting Notes <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                rows={3}
                placeholder="What was discussed? Client response, questions raised, quotation updates, agreed next steps..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                autoFocus
              />
            </div>
          </div>

          {/* Status & Next Follow-up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Update Lead Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
              >
                {ALL_LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Next Follow-up
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDateShortcut(1)}
                    className="px-1 py-0.5 bg-slate-100 hover:bg-indigo-100 rounded text-slate-600"
                  >
                    +1d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateShortcut(3)}
                    className="px-1 py-0.5 bg-slate-100 hover:bg-indigo-100 rounded text-slate-600"
                  >
                    +3d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateShortcut(7)}
                    className="px-1 py-0.5 bg-slate-100 hover:bg-indigo-100 rounded text-slate-600"
                  >
                    +7d
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Logged By Employee
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
              />
            </div>
          </div>

          {/* Previous History */}
          {lead.followUpHistory && lead.followUpHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Previous Follow-up History ({lead.followUpHistory.length})
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {lead.followUpHistory.map((fu) => (
                  <div
                    key={fu.id}
                    className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">{fu.employeeName}</span>
                      <span>{new Date(fu.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 leading-snug">{fu.note}</p>
                    {fu.statusUpdatedTo && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">
                        Status: {fu.statusUpdatedTo}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!note.trim()}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Record Follow-Up
          </button>
        </div>
      </div>
    </div>
  );
};
