import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  CheckSquare,
  Square,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Save,
  Plus,
  Globe,
  Smartphone,
  TrendingUp,
  Search,
  Share2,
  Database,
  ShoppingCart,
  Palette,
  HelpCircle,
} from 'lucide-react';
import {
  ClientLead,
  RequirementType,
  ALL_REQUIREMENTS,
  LeadStatus,
  ALL_LEAD_STATUSES,
  LeadSource,
  ALL_LEAD_SOURCES,
} from '../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (lead: ClientLead, isNew: boolean) => void;
  initialLead?: ClientLead | null;
  employees: string[];
  defaultEmployee: string;
  onAddEmployee: (name: string) => void;
}

const REQUIREMENT_ICONS: Record<RequirementType, React.ReactNode> = {
  Website: <Globe className="w-4 h-4 text-blue-500" />,
  'Mobile App': <Smartphone className="w-4 h-4 text-emerald-500" />,
  'Digital Marketing': <TrendingUp className="w-4 h-4 text-purple-500" />,
  'Lead Generation': <TrendingUp className="w-4 h-4 text-amber-500" />,
  SEO: <Search className="w-4 h-4 text-cyan-500" />,
  'Social Media Marketing': <Share2 className="w-4 h-4 text-pink-500" />,
  'Software / CRM': <Database className="w-4 h-4 text-indigo-500" />,
  'E-commerce': <ShoppingCart className="w-4 h-4 text-orange-500" />,
  'Graphic Design': <Palette className="w-4 h-4 text-rose-500" />,
  Other: <HelpCircle className="w-4 h-4 text-slate-500" />,
};

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSaveLead,
  initialLead,
  employees,
  defaultEmployee,
  onAddEmployee,
}) => {
  const [employeeName, setEmployeeName] = useState(defaultEmployee || 'Shrawani Gavli');
  const [customEmployeeInput, setCustomEmployeeInput] = useState('');
  const [showAddEmployeeInput, setShowAddEmployeeInput] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [requirements, setRequirements] = useState<RequirementType[]>(['Website']);
  const [otherRequirementNote, setOtherRequirementNote] = useState('');

  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [leadSource, setLeadSource] = useState<LeadSource>('WhatsApp');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialLead) {
      setEmployeeName(initialLead.employeeName);
      setClientName(initialLead.clientName);
      setClientMobile(initialLead.clientMobile);
      setClientEmail(initialLead.clientEmail || '');
      setClientCompany(initialLead.clientCompany || '');
      setClientAddress(initialLead.clientAddress || '');
      setRequirements(initialLead.requirements || []);
      setOtherRequirementNote(initialLead.otherRequirementNote || '');
      setLeadStatus(initialLead.leadStatus || 'New');
      setLeadSource(initialLead.leadSource || 'WhatsApp');
      setBudget(initialLead.budget || '');
      setCurrency(initialLead.currency || 'INR (₹)');
      setNextFollowUpDate(initialLead.nextFollowUpDate || '');
      setRemarks(initialLead.remarks || '');
    } else {
      resetForm();
    }
    setFormErrors({});
  }, [initialLead, isOpen, defaultEmployee]);

  const resetForm = () => {
    setEmployeeName(defaultEmployee && defaultEmployee !== 'All' ? defaultEmployee : employees[0] || 'Shrawani Gavli');
    setClientName('');
    setClientMobile('');
    setClientEmail('');
    setClientCompany('');
    setClientAddress('');
    setRequirements(['Website']);
    setOtherRequirementNote('');
    setLeadStatus('New');
    setLeadSource('WhatsApp');
    setBudget('');
    setCurrency('INR (₹)');
    // Default next follow up to 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setNextFollowUpDate(d.toISOString().split('T')[0]);
    setRemarks('');
  };

  const handleToggleRequirement = (req: RequirementType) => {
    if (requirements.includes(req)) {
      setRequirements(requirements.filter((r) => r !== req));
    } else {
      setRequirements([...requirements, req]);
    }
  };

  const setDateShortcut = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    setNextFollowUpDate(target.toISOString().split('T')[0]);
  };

  const handleAddNewEmployee = () => {
    if (customEmployeeInput.trim()) {
      onAddEmployee(customEmployeeInput.trim());
      setEmployeeName(customEmployeeInput.trim());
      setCustomEmployeeInput('');
      setShowAddEmployeeInput(false);
    }
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!clientName.trim()) {
      errors.clientName = 'Client Name is required';
    }
    if (!clientMobile.trim()) {
      errors.clientMobile = 'Client Mobile Number is required';
    } else if (clientMobile.replace(/[^0-9]/g, '').length < 7) {
      errors.clientMobile = 'Please enter a valid phone number';
    }
    if (requirements.length === 0) {
      errors.requirements = 'Please select at least one requirement';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (addAnother = false) => {
    if (!validate()) return;

    const leadToSave: ClientLead = {
      id: initialLead ? initialLead.id : 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      employeeName,
      clientName: clientName.trim(),
      clientMobile: clientMobile.trim(),
      clientEmail: clientEmail.trim(),
      clientCompany: clientCompany.trim() || clientName.trim() + ' Enterprise',
      clientAddress: clientAddress.trim(),
      requirements,
      otherRequirementNote: requirements.includes('Other') ? otherRequirementNote.trim() : undefined,
      remarks: remarks.trim(),
      leadStatus,
      leadSource,
      budget: budget.trim(),
      currency,
      nextFollowUpDate: nextFollowUpDate || undefined,
      lastFollowUpDate: initialLead?.lastFollowUpDate,
      lastFollowUpRemarks: initialLead?.lastFollowUpRemarks,
      createdDate: initialLead?.createdDate || new Date().toISOString(),
      followUpHistory: initialLead?.followUpHistory || [
        {
          id: 'fu-' + Date.now(),
          date: new Date().toISOString(),
          note: `Lead created by ${employeeName} with status '${leadStatus}'.`,
          employeeName,
          statusUpdatedTo: leadStatus,
        },
      ],
      driveAttachments: initialLead?.driveAttachments || [],
    };

    onSaveLead(leadToSave, !initialLead);

    if (addAnother) {
      resetForm();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-md">
                CRM Form
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {initialLead ? 'Edit Client Record' : 'Add New Client & Lead Details'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow CRM standard flow: Employee → Client → Requirement → Remarks & Follow-up
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SECTION 1: Employee Details */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">Employee Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEmployeeInput(!showAddEmployeeInput)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddEmployeeInput ? 'Select Existing' : '+ Add New Employee'}
              </button>
            </div>

            {showAddEmployeeInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter employee full name"
                  value={customEmployeeInput}
                  onChange={(e) => setCustomEmployeeInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddNewEmployee}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Save Employee
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assigned Employee Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    >
                      {employees.map((emp) => (
                        <option key={emp} value={emp}>
                          {emp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      {ALL_LEAD_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Client Details */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-semibold text-slate-900 text-sm">Client Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client / Contact Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma / John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden ${
                      formErrors.clientName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {formErrors.clientName && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.clientName}</p>
                )}
              </div>

              {/* Client Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="e.g. 9820123456 or +91 9820123456"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden ${
                      formErrors.clientMobile ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {formErrors.clientMobile && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.clientMobile}</p>
                )}
              </div>

              {/* Client Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. client@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Client Company Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. ABC Pvt Ltd / TechCorp"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Client Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client Address / Office Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Street, City, State, Country"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Requirement */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Client Requirement <span className="text-red-500">*</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRequirements([...ALL_REQUIREMENTS])}
                  className="text-indigo-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setRequirements([])}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select all software and IT services requested by the client:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {ALL_REQUIREMENTS.map((req) => {
                const isSelected = requirements.includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    onClick={() => handleToggleRequirement(req)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="shrink-0">{REQUIREMENT_ICONS[req]}</span>
                    <span className="truncate">{req}</span>
                  </button>
                );
              })}
            </div>

            {formErrors.requirements && (
              <p className="text-[11px] text-red-500 mt-2">{formErrors.requirements}</p>
            )}

            {/* If "Other" is checked, show custom details field */}
            {requirements.includes('Other') && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specify Other Requirement
                </label>
                <input
                  type="text"
                  placeholder="Describe customized solution (e.g., Cloud Migration, ERP, AI Chatbot)"
                  value={otherRequirementNote}
                  onChange={(e) => setOtherRequirementNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* SECTION 4: Pipeline Status & Follow-up Details */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-semibold text-slate-900 text-sm">Lead Status, Budget & Follow-up</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lead Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lead Status
                </label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                >
                  {ALL_LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimated Budget
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-300 bg-white">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-100 text-xs font-medium px-2 py-2 border-r border-slate-300 text-slate-700 outline-hidden"
                  >
                    <option value="INR (₹)">₹ INR</option>
                    <option value="USD ($)">$ USD</option>
                    <option value="EUR (€)">€ EUR</option>
                    <option value="AED (AED)">AED</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. 50,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-hidden"
                  />
                </div>
              </div>

              {/* Next Follow-up Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Next Follow-up Date
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDateShortcut(1)}
                      className="px-1.5 py-0.5 bg-slate-200/70 hover:bg-indigo-100 hover:text-indigo-700 rounded text-slate-600"
                    >
                      +1d
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateShortcut(3)}
                      className="px-1.5 py-0.5 bg-slate-200/70 hover:bg-indigo-100 hover:text-indigo-700 rounded text-slate-600"
                    >
                      +3d
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateShortcut(7)}
                      className="px-1.5 py-0.5 bg-slate-200/70 hover:bg-indigo-100 hover:text-indigo-700 rounded text-slate-600"
                    >
                      +7d
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Remarks */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h3 className="font-semibold text-slate-900 text-sm">
                Remarks & Discussion Notes
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Requirements specification, discussion notes, budget constraints, timeline & key follow-up items.
            </p>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                rows={4}
                placeholder="Enter client conversation summary, technical specifications, competitor comparisons, follow-up instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Reset Form
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>

            {!initialLead && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors hidden sm:inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Save & Add Another
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {initialLead ? 'Update Client' : 'Save Client to CRM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
