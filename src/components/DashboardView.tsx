import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Cloud,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import {
  ClientLead,
  LeadStatus,
  ALL_LEAD_STATUSES,
  RequirementType,
  ALL_REQUIREMENTS,
} from '../types';

interface DashboardViewProps {
  leads: ClientLead[];
  onAddNewClient: () => void;
  onViewClient: (lead: ClientLead) => void;
  onEditClient: (lead: ClientLead) => void;
  onDeleteClient: (lead: ClientLead) => void;
  onOpenFollowUp: (lead: ClientLead) => void;
  onExportFiltered: (filtered: ClientLead[]) => void;
  selectedEmployeeFilter: string;
  setSelectedEmployeeFilter: (emp: string) => void;
  employees: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onAddNewClient,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onOpenFollowUp,
  onExportFiltered,
  selectedEmployeeFilter,
  setSelectedEmployeeFilter,
  employees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [requirementFilter, setRequirementFilter] = useState<string>('All');
  const [followUpFilter, setFollowUpFilter] = useState<'All' | 'Overdue' | 'Today' | 'Upcoming'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortField, setSortField] = useState<'created' | 'followup' | 'client' | 'status'>('created');
  const [sortAsc, setSortAsc] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Summary Metrics
  const stats = useMemo(() => {
    let wonCount = 0;
    let newCount = 0;
    let followUpCount = 0;
    let proposalCount = 0;
    let overdueCount = 0;
    let totalBudgetVal = 0;

    leads.forEach((l) => {
      if (l.leadStatus === 'Won') wonCount++;
      if (l.leadStatus === 'New') newCount++;
      if (l.leadStatus === 'Follow-up' || l.leadStatus === 'Contacted') followUpCount++;
      if (l.leadStatus === 'Proposal Sent') proposalCount++;

      if (l.nextFollowUpDate && l.nextFollowUpDate < todayStr && l.leadStatus !== 'Won' && l.leadStatus !== 'Lost') {
        overdueCount++;
      }

      const numBudget = parseFloat((l.budget || '').replace(/[^0-9.]/g, ''));
      if (!isNaN(numBudget)) {
        totalBudgetVal += numBudget;
      }
    });

    return {
      total: leads.length,
      won: wonCount,
      newLeads: newCount,
      activeFollowups: followUpCount,
      proposals: proposalCount,
      overdue: overdueCount,
      pipelineValue: totalBudgetVal,
    };
  }, [leads, todayStr]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Employee filter
        if (selectedEmployeeFilter !== 'All' && lead.employeeName !== selectedEmployeeFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'All' && lead.leadStatus !== statusFilter) {
          return false;
        }

        // Requirement filter
        if (requirementFilter !== 'All' && !lead.requirements.includes(requirementFilter as RequirementType)) {
          return false;
        }

        // Follow up date filter
        if (followUpFilter === 'Overdue') {
          if (!lead.nextFollowUpDate || lead.nextFollowUpDate >= todayStr || lead.leadStatus === 'Won' || lead.leadStatus === 'Lost') {
            return false;
          }
        } else if (followUpFilter === 'Today') {
          if (lead.nextFollowUpDate !== todayStr) return false;
        } else if (followUpFilter === 'Upcoming') {
          if (!lead.nextFollowUpDate || lead.nextFollowUpDate <= todayStr) return false;
        }

        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = lead.clientName.toLowerCase().includes(q);
          const matchCompany = lead.clientCompany?.toLowerCase().includes(q);
          const matchMobile = lead.clientMobile?.includes(q);
          const matchEmp = lead.employeeName?.toLowerCase().includes(q);
          const matchRemarks = lead.remarks?.toLowerCase().includes(q);
          const matchReq = lead.requirements.some((r) => r.toLowerCase().includes(q));

          return matchName || matchCompany || matchMobile || matchEmp || matchRemarks || matchReq;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'created') {
          diff = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        } else if (sortField === 'followup') {
          const fa = a.nextFollowUpDate || '9999-99-99';
          const fb = b.nextFollowUpDate || '9999-99-99';
          diff = fa.localeCompare(fb);
        } else if (sortField === 'client') {
          diff = a.clientName.localeCompare(b.clientName);
        } else if (sortField === 'status') {
          diff = a.leadStatus.localeCompare(b.leadStatus);
        }
        return sortAsc ? -diff : diff;
      });
  }, [leads, selectedEmployeeFilter, statusFilter, requirementFilter, followUpFilter, searchTerm, sortField, sortAsc, todayStr]);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Follow-up':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Proposal Sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatFollowUpDisplay = (lead: ClientLead) => {
    if (!lead.nextFollowUpDate) {
      return <span className="text-slate-400 text-xs italic">Not set</span>;
    }

    const dateStr = lead.nextFollowUpDate;
    const isOverdue = dateStr < todayStr && lead.leadStatus !== 'Won' && lead.leadStatus !== 'Lost';
    const isToday = dateStr === todayStr;

    // Friendly date format
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${d} ${months[parseInt(m, 10) - 1]}`;

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          {formatted} (Overdue)
        </span>
      );
    }
    if (isToday) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600" />
          {formatted} (Today)
        </span>
      );
    }

    return (
      <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
        <Calendar className="w-3 h-3 text-slate-400" />
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Clients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Clients</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-600 mt-0.5">In CRM database</p>
        </div>

        {/* New Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">New Leads</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.newLeads}</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Awaiting initial call</p>
        </div>

        {/* In Follow-up */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Follow-ups</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.activeFollowups}</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Active discussions</p>
        </div>

        {/* Proposal Sent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Proposals Sent</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.proposals}</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Under evaluation</p>
        </div>

        {/* Deals Won */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Won / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.won}</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Successful contracts</p>
        </div>

        {/* Overdue Alert or Pipeline */}
        <div className={`p-4 rounded-xl border shadow-2xs transition-colors ${
          stats.overdue > 0
            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">Overdue Follow-ups</span>
            <AlertCircle className={`w-4 h-4 ${stats.overdue > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {stats.overdue}
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {stats.overdue > 0 ? 'Requires immediate action' : 'All up to date'}
          </p>
        </div>
      </div>

      {/* Action Bar & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Top Search & Primary Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, company, mobile, requirement, employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportFiltered(filteredLeads)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Export visible leads to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export ({filteredLeads.length})
            </button>

            <button
              onClick={onAddNewClient}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Client
            </button>
          </div>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-600 font-semibold mr-1">Status:</span>
            {['All', ...ALL_LEAD_STATUSES].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Additional Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Requirement Filter */}
            <select
              value={requirementFilter}
              onChange={(e) => setRequirementFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs outline-hidden"
            >
              <option value="All">All Requirements</option>
              {ALL_REQUIREMENTS.map((req) => (
                <option key={req} value={req}>
                  {req}
                </option>
              ))}
            </select>

            {/* Follow-up Urgency Filter */}
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs outline-hidden font-medium"
            >
              <option value="All">All Follow-ups</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Today">Due Today</option>
              <option value="Upcoming">Upcoming</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 text-xs rounded font-medium ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-0.5 text-xs rounded font-medium ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main CRM Leads Table matching prompt layout:
          Employee | Client | Company | Mobile | Requirement | Status | Follow-up | Actions */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    Employee
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Client
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Company
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Mobile
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Requirement
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Follow-up
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const cleanPhone = lead.clientMobile.replace(/[^0-9]/g, '');
                    const whatsAppUrl = `https://wa.me/${
                      cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
                    }?text=${encodeURIComponent(
                      `Hello ${lead.clientName}, connecting with you from Arraylogic Software...`
                    )}`;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        {/* Employee */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                              {lead.employeeName.charAt(0)}
                            </div>
                            <span>{lead.employeeName}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <button
                            onClick={() => onViewClient(lead)}
                            className="hover:text-indigo-600 text-left hover:underline flex items-center gap-1"
                          >
                            {lead.clientName}
                          </button>
                          {lead.budget && (
                            <span className="text-[10px] text-slate-600 font-normal block">
                              Budget: {lead.currency?.split(' ')[0] || '₹'} {lead.budget}
                            </span>
                          )}
                        </td>

                        {/* Company */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {lead.clientCompany || 'Individual'}
                        </td>

                        {/* Mobile */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.clientMobile}`}
                              className="font-mono text-slate-800 hover:text-indigo-600 font-medium"
                            >
                              {lead.clientMobile}
                            </a>
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        {/* Requirement */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {lead.requirements.slice(0, 2).map((req) => (
                              <span
                                key={req}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60"
                              >
                                {req}
                              </span>
                            ))}
                            {lead.requirements.length > 2 && (
                              <span
                                className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-semibold"
                                title={lead.requirements.join(', ')}
                              >
                                +{lead.requirements.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${getStatusBadge(
                              lead.leadStatus
                            )}`}
                          >
                            {lead.leadStatus}
                          </span>
                        </td>

                        {/* Follow-up */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {formatFollowUpDisplay(lead)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenFollowUp(lead)}
                              title="Log Follow-up"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Follow-up</span>
                            </button>

                            <button
                              onClick={() => onViewClient(lead)}
                              title="View Full Profile"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onEditClient(lead)}
                              title="Edit Client"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteClient(lead)}
                              title="Delete Client"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      <div className="max-w-sm mx-auto space-y-3">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-medium text-slate-600">No client records found matching current criteria.</p>
                        <button
                          onClick={onAddNewClient}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                        >
                          + Add First Client
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> clients
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Arraylogic CRM v1.0 • Ready</span>
            </div>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const cleanPhone = lead.clientMobile.replace(/[^0-9]/g, '');
            const whatsAppUrl = `https://wa.me/${
              cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
            }?text=${encodeURIComponent(
              `Hello ${lead.clientName}, regarding your inquiry with Arraylogic Software...`
            )}`;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border mb-1.5 ${getStatusBadge(
                          lead.leadStatus
                        )}`}
                      >
                        {lead.leadStatus}
                      </span>
                      <h3
                        onClick={() => onViewClient(lead)}
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer"
                      >
                        {lead.clientName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {lead.clientCompany || 'Individual'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Agent</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {lead.employeeName}
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-1 my-3">
                    {lead.requirements.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Notes snippet */}
                  {lead.remarks && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg mb-3">
                      {lead.remarks}
                    </p>
                  )}
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Next Follow-up:</span>
                    {formatFollowUpDisplay(lead)}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenFollowUp(lead)}
                        className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg"
                      >
                        Follow-up
                      </button>
                      <button
                        onClick={() => onViewClient(lead)}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
