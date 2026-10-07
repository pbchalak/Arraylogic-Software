import React, { useMemo } from 'react';
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Building,
  User,
  ArrowRight,
} from 'lucide-react';
import { ClientLead } from '../types';

interface FollowUpsViewProps {
  leads: ClientLead[];
  onOpenFollowUp: (lead: ClientLead) => void;
  onViewClient: (lead: ClientLead) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  leads,
  onOpenFollowUp,
  onViewClient,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const inOneWeek = new Date();
  inOneWeek.setDate(inOneWeek.getDate() + 7);
  const inOneWeekStr = inOneWeek.toISOString().split('T')[0];

  const groups = useMemo(() => {
    const overdue: ClientLead[] = [];
    const today: ClientLead[] = [];
    const thisWeek: ClientLead[] = [];
    const later: ClientLead[] = [];
    const unscheduled: ClientLead[] = [];

    leads.forEach((l) => {
      if (l.leadStatus === 'Won' || l.leadStatus === 'Lost') return;

      if (!l.nextFollowUpDate) {
        unscheduled.push(l);
      } else if (l.nextFollowUpDate < todayStr) {
        overdue.push(l);
      } else if (l.nextFollowUpDate === todayStr) {
        today.push(l);
      } else if (l.nextFollowUpDate <= inOneWeekStr) {
        thisWeek.push(l);
      } else {
        later.push(l);
      }
    });

    const sortFn = (a: ClientLead, b: ClientLead) =>
      (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || '');

    return {
      overdue: overdue.sort(sortFn),
      today: today.sort(sortFn),
      thisWeek: thisWeek.sort(sortFn),
      later: later.sort(sortFn),
      unscheduled,
    };
  }, [leads, todayStr, inOneWeekStr]);

  const renderLeadCard = (lead: ClientLead, isAlert = false) => {
    const cleanPhone = lead.clientMobile.replace(/[^0-9]/g, '');
    const whatsAppUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
      `Hello ${lead.clientName}, following up regarding your requirement at Arraylogic Software...`
    )}`;

    return (
      <div
        key={lead.id}
        className={`p-4 rounded-xl border transition-all ${
          isAlert
            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
            : 'bg-white border-slate-200 hover:border-indigo-200'
        } shadow-2xs space-y-3`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                {lead.leadStatus}
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                {lead.employeeName}
              </span>
            </div>
            <h4
              onClick={() => onViewClient(lead)}
              className="font-bold text-slate-900 text-sm mt-1 hover:text-indigo-600 cursor-pointer"
            >
              {lead.clientName}
            </h4>
            <p className="text-xs text-slate-500">{lead.clientCompany}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              {lead.nextFollowUpDate || 'None'}
            </span>
            {lead.budget && (
              <span className="text-[11px] text-slate-500 font-medium block">
                ₹ {lead.budget}
              </span>
            )}
          </div>
        </div>

        {lead.lastFollowUpRemarks && (
          <p className="text-xs text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-100 italic">
            "{lead.lastFollowUpRemarks}"
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.clientMobile}`}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={() => onOpenFollowUp(lead)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5" />
            Log Call & Update
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Follow-up Call & Meeting Schedule</h2>
          <p className="text-xs text-slate-500">
            Never miss a prospect. Scheduled client calls organized by urgency.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            {groups.overdue.length} Overdue
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-bold">
            <Clock className="w-3.5 h-3.5" />
            {groups.today.length} Due Today
          </span>
        </div>
      </div>

      {/* Overdue Section */}
      {groups.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <h3>Overdue Follow-ups ({groups.overdue.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.overdue.map((lead) => renderLeadCard(lead, true))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
          <Clock className="w-4 h-4" />
          <h3>Scheduled For Today ({groups.today.length})</h3>
        </div>
        {groups.today.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.today.map((lead) => renderLeadCard(lead))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No calls scheduled specifically for today. Check upcoming tasks below!
          </div>
        )}
      </div>

      {/* Upcoming This Week */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
          <Calendar className="w-4 h-4" />
          <h3>Upcoming Next 7 Days ({groups.thisWeek.length})</h3>
        </div>
        {groups.thisWeek.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.thisWeek.map((lead) => renderLeadCard(lead))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No follow-ups due in the next 7 days.
          </div>
        )}
      </div>

      {/* Later */}
      {groups.later.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <h3>Later ({groups.later.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.later.map((lead) => renderLeadCard(lead))}
          </div>
        </div>
      )}
    </div>
  );
};
