import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ClientLead, LeadStatus, LeadSource, RequirementType, ALL_REQUIREMENTS } from '../types';

const STORAGE_KEY = 'arraylogic_crm_leads_v2';
const EMPLOYEES_KEY = 'arraylogic_crm_employees_v2';

export const DEFAULT_EMPLOYEES = [
  'Shrawani Gavli',
  'Mamta Dasarwar (Digital Marketing Executive)',
  'Akshay Patil',
  'Mayuri B.',
  'Vikram Malhotra',
  'Pooja Kulkarni',
];

export const INITIAL_LEADS: ClientLead[] = [
  {
    id: 'lead-1',
    employeeName: 'Shrawani Gavli',
    clientName: 'ABC Enterprises',
    clientMobile: '9820123456',
    clientEmail: 'contact@abcpvtltd.com',
    clientCompany: 'ABC Pvt Ltd',
    clientAddress: 'Plot 42, Tech Park, Baner, Pune, MH',
    requirements: ['Website', 'Software / CRM'],
    leadStatus: 'New',
    leadSource: 'WhatsApp',
    budget: '75,000',
    currency: 'INR (₹)',
    nextFollowUpDate: '2026-10-10',
    createdDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    remarks: 'Client needs a modern responsive corporate website with CRM lead capture integration. Preliminary quotation discussed.',
    followUpHistory: [
      {
        id: 'fu-1',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        note: 'First introductory call on WhatsApp. Shared company profile deck.',
        employeeName: 'Shrawani Gavli',
        statusUpdatedTo: 'New',
      },
    ],
  },
  {
    id: 'lead-2',
    employeeName: 'Mamta Dasarwar (Digital Marketing Executive)',
    clientName: 'XYZ Technologies',
    clientMobile: '9730987654',
    clientEmail: 'info@xyzltd.com',
    clientCompany: 'XYZ Ltd',
    clientAddress: '12th Floor, Cyber Heights, Hitec City, Hyderabad',
    requirements: ['Digital Marketing', 'Lead Generation', 'SEO'],
    leadStatus: 'Follow-up',
    leadSource: 'Referral',
    budget: '1,20,000',
    currency: 'INR (₹)',
    nextFollowUpDate: '2026-10-12',
    lastFollowUpDate: '2026-10-05',
    lastFollowUpRemarks: 'Discussed monthly retainer model for B2B LinkedIn & Google Ads campaigns.',
    createdDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    remarks: 'Looking for aggressive B2B client acquisition through paid ads and organic SEO ranking for industrial keywords.',
    followUpHistory: [
      {
        id: 'fu-2-1',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        note: 'Referral from existing client. Initial requirements gathered.',
        employeeName: 'Mamta Dasarwar (Digital Marketing Executive)',
        statusUpdatedTo: 'Contacted',
      },
      {
        id: 'fu-2-2',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        note: 'Sent proposal outline. Follow-up scheduled with marketing head on 12th Oct.',
        employeeName: 'Mamta Dasarwar (Digital Marketing Executive)',
        statusUpdatedTo: 'Follow-up',
      },
    ],
  },
  {
    id: 'lead-3',
    employeeName: 'Akshay Patil',
    clientName: 'Apex Health Systems',
    clientMobile: '9845112233',
    clientEmail: 'procurement@apexhealth.org',
    clientCompany: 'Apex Care LLP',
    clientAddress: 'MG Road, Indiranagar, Bengaluru, KA',
    requirements: ['Mobile App', 'Software / CRM'],
    leadStatus: 'Proposal Sent',
    leadSource: 'Website',
    budget: '2,50,000',
    currency: 'INR (₹)',
    nextFollowUpDate: '2026-10-15',
    lastFollowUpDate: '2026-10-06',
    lastFollowUpRemarks: 'Sent detailed RFP document and mobile app architecture diagram.',
    createdDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    remarks: 'Patient appointment booking mobile app (iOS & Android) with doctor consultation portal and telemed features.',
    followUpHistory: [
      {
        id: 'fu-3-1',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        note: 'Website enquiry form received. Scheduled tech demo.',
        employeeName: 'Akshay Patil',
        statusUpdatedTo: 'Contacted',
      },
      {
        id: 'fu-3-2',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        note: 'Proposal sent to management board. Awaiting review.',
        employeeName: 'Akshay Patil',
        statusUpdatedTo: 'Proposal Sent',
      },
    ],
  },
  {
    id: 'lead-4',
    employeeName: 'Mayuri B.',
    clientName: 'Solux Fashion Retail',
    clientMobile: '9921445566',
    clientEmail: 'founder@soluxfashion.store',
    clientCompany: 'Solux Retail Pvt Ltd',
    clientAddress: 'Linking Road, Bandra West, Mumbai, MH',
    requirements: ['E-commerce', 'Social Media Marketing', 'Graphic Design'],
    leadStatus: 'Won',
    leadSource: 'Instagram',
    budget: '1,80,000',
    currency: 'INR (₹)',
    nextFollowUpDate: '2026-10-20',
    lastFollowUpDate: '2026-10-04',
    lastFollowUpRemarks: 'Contract signed! Advance payment 50% received.',
    createdDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    remarks: 'Full Shopify customized storefront with Instagram reels marketing and festival creative banner designs.',
    followUpHistory: [
      {
        id: 'fu-4-1',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        note: 'Final negotiation closed. Payment invoice raised.',
        employeeName: 'Mayuri B.',
        statusUpdatedTo: 'Won',
      },
    ],
  },
];

const migrateEmployeeName = (name: string): string => {
  if (name === 'Rahul Sharma') return 'Shrawani Gavli';
  if (name === 'Priya Patel') return 'Mamta Dasarwar (Digital Marketing Executive)';
  if (name === 'Amit Verma') return 'Akshay Patil';
  if (name === 'Neha Deshmukh') return 'Mayuri B.';
  return name;
};

export function getStoredLeads(): ClientLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('arraylogic_crm_leads_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    const parsed: ClientLead[] = JSON.parse(raw);
    const migrated = parsed.map((lead) => ({
      ...lead,
      employeeName: migrateEmployeeName(lead.employeeName),
      followUpHistory: (lead.followUpHistory || []).map((fu) => ({
        ...fu,
        employeeName: migrateEmployeeName(fu.employeeName),
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
    return INITIAL_LEADS;
  }
}

export function saveStoredLeads(leads: ClientLead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads to localStorage', e);
  }
}

export function getStoredEmployees(): string[] {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY) || localStorage.getItem('arraylogic_crm_employees_v1');
    if (!raw) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed: string[] = JSON.parse(raw);
    const migrated = parsed.map(migrateEmployeeName);
    const unique = Array.from(new Set(migrated));
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(unique));
    return unique;
  } catch (e) {
    return DEFAULT_EMPLOYEES;
  }
}

export function addStoredEmployee(employeeName: string): string[] {
  const current = getStoredEmployees();
  if (employeeName.trim() && !current.includes(employeeName.trim())) {
    const updated = [...current, employeeName.trim()];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

/**
 * Exports leads to CSV format and triggers browser download.
 */
export function exportLeadsToCSV(leads: ClientLead[], filename = 'Arraylogic_CRM_Leads.csv'): void {
  const csvData = leads.map((lead) => ({
    'Employee Name': lead.employeeName,
    'Client Name': lead.clientName,
    'Company Name': lead.clientCompany,
    'Mobile Number': lead.clientMobile,
    'Email Address': lead.clientEmail,
    'Address': lead.clientAddress,
    'Requirements': lead.requirements.join('; ') + (lead.otherRequirementNote ? ` (${lead.otherRequirementNote})` : ''),
    'Lead Status': lead.leadStatus,
    'Lead Source': lead.leadSource,
    'Budget': lead.budget ? `${lead.currency || 'INR'} ${lead.budget}` : '',
    'Next Follow-up Date': lead.nextFollowUpDate || '',
    'Last Follow-up Date': lead.lastFollowUpDate || '',
    'Last Follow-up Remarks': lead.lastFollowUpRemarks || '',
    'Created Date': new Date(lead.createdDate).toLocaleDateString(),
    'Remarks / Notes': lead.remarks || '',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports leads to Excel XLSX format and triggers browser download.
 */
export function exportLeadsToExcel(leads: ClientLead[], filename = 'Arraylogic_CRM_Leads.xlsx'): void {
  const data = leads.map((lead) => ({
    'Employee Name': lead.employeeName,
    'Client Name': lead.clientName,
    'Company Name': lead.clientCompany,
    'Mobile Number': lead.clientMobile,
    'Email Address': lead.clientEmail,
    'Address': lead.clientAddress,
    'Requirements': lead.requirements.join('; ') + (lead.otherRequirementNote ? ` (${lead.otherRequirementNote})` : ''),
    'Lead Status': lead.leadStatus,
    'Lead Source': lead.leadSource,
    'Budget': lead.budget || '',
    'Currency': lead.currency || 'INR (₹)',
    'Next Follow-up Date': lead.nextFollowUpDate || '',
    'Last Follow-up Date': lead.lastFollowUpDate || '',
    'Created Date': new Date(lead.createdDate).toLocaleDateString(),
    'Remarks / Notes': lead.remarks || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients & Leads');
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates and downloads a sample CSV template for import.
 */
export function downloadSampleTemplate(): void {
  const sampleRows = [
    {
      'Employee Name': 'Shrawani Gavli',
      'Client Name': 'Acme Corp',
      'Company Name': 'Acme Solutions Ltd',
      'Mobile Number': '9876543210',
      'Email Address': 'alex@acme.com',
      'Address': 'Suite 101, Silicon Tower, Pune',
      'Requirements': 'Website; SEO; Software / CRM',
      'Lead Status': 'New',
      'Lead Source': 'Website',
      'Budget': '50,000',
      'Next Follow-up Date': '2026-10-18',
      'Remarks / Notes': 'Needs quote for custom inventory CRM',
    },
    {
      'Employee Name': 'Mamta Dasarwar (Digital Marketing Executive)',
      'Client Name': 'Starlight Studios',
      'Company Name': 'Starlight Media Pvt Ltd',
      'Mobile Number': '9811223344',
      'Email Address': 'media@starlight.co',
      'Address': 'Bandra Kurla Complex, Mumbai',
      'Requirements': 'Digital Marketing; Social Media Marketing',
      'Lead Status': 'Contacted',
      'Lead Source': 'Instagram',
      'Budget': '80,000',
      'Next Follow-up Date': '2026-10-22',
      'Remarks / Notes': 'Festival campaign creatives and influencer outreach',
    },
  ];

  const csv = Papa.unparse(sampleRows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Arraylogic_CRM_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses an Excel or CSV file into raw rows.
 */
export async function parseFileForImport(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return jsonData;
  }

  // Treat as CSV / Text
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Converts imported raw row object to ClientLead format with smart column matching.
 */
export function convertImportRowToLead(row: Record<string, any>, defaultEmployee = 'Shrawani Gavli'): ClientLead {
  const getField = (aliases: string[]) => {
    for (const key of Object.keys(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const alias of aliases) {
        if (normalizedKey === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          return String(row[key] || '').trim();
        }
      }
    }
    return '';
  };

  const employee = getField(['employeename', 'employee', 'assignedemployee', 'agent', 'staff']) || defaultEmployee;
  const clientName = getField(['clientname', 'client', 'name', 'contactperson', 'customer']) || 'Unnamed Client';
  const mobile = getField(['mobilenumber', 'mobile', 'phone', 'contact', 'cell', 'clientmobilenumber', 'phonenumber']) || '';
  const email = getField(['emailaddress', 'email', 'mail', 'clientemail']) || '';
  const company = getField(['companyname', 'company', 'organization', 'clientcompanyname', 'business']) || 'Individual';
  const address = getField(['address', 'location', 'city', 'clientaddress']) || '';
  
  const rawRequirements = getField(['requirements', 'requirement', 'services', 'service', 'needed', 'needs']) || '';
  const matchedRequirements: RequirementType[] = [];

  ALL_REQUIREMENTS.forEach((req) => {
    if (rawRequirements.toLowerCase().includes(req.toLowerCase())) {
      matchedRequirements.push(req);
    }
  });

  if (matchedRequirements.length === 0) {
    if (rawRequirements.trim()) {
      matchedRequirements.push('Other');
    } else {
      matchedRequirements.push('Website');
    }
  }

  const rawStatus = getField(['leadstatus', 'status', 'stage']) || 'New';
  let leadStatus: LeadStatus = 'New';
  const normalizedStatus = rawStatus.toLowerCase();
  if (normalizedStatus.includes('won') || normalizedStatus.includes('closed') || normalizedStatus.includes('success')) {
    leadStatus = 'Won';
  } else if (normalizedStatus.includes('lost') || normalizedStatus.includes('dropped')) {
    leadStatus = 'Lost';
  } else if (normalizedStatus.includes('proposal') || normalizedStatus.includes('quote')) {
    leadStatus = 'Proposal Sent';
  } else if (normalizedStatus.includes('follow') || normalizedStatus.includes('meeting')) {
    leadStatus = 'Follow-up';
  } else if (normalizedStatus.includes('contact')) {
    leadStatus = 'Contacted';
  } else {
    leadStatus = 'New';
  }

  const rawSource = getField(['leadsource', 'source', 'channel', 'platform']) || 'Website';
  let leadSource: LeadSource = 'Website';
  const sLower = rawSource.toLowerCase();
  if (sLower.includes('whatsapp')) leadSource = 'WhatsApp';
  else if (sLower.includes('facebook')) leadSource = 'Facebook';
  else if (sLower.includes('instagram')) leadSource = 'Instagram';
  else if (sLower.includes('referral')) leadSource = 'Referral';
  else if (sLower.includes('call')) leadSource = 'Calling';
  else if (sLower.includes('email')) leadSource = 'Email Campaign';
  else leadSource = 'Other';

  const budget = getField(['budget', 'amount', 'cost', 'dealvalue', 'value']) || '';
  const nextFollowUp = getField(['nextfollowupdate', 'followup', 'followupdate', 'nextfollowup']) || '';
  const remarks = getField(['remarks', 'notes', 'comments', 'description', 'requirementdetails']) || '';

  return {
    id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    employeeName: employee,
    clientName,
    clientMobile: mobile,
    clientEmail: email,
    clientCompany: company,
    clientAddress: address,
    requirements: matchedRequirements,
    otherRequirementNote: rawRequirements.includes('Other') ? rawRequirements : undefined,
    leadStatus,
    leadSource,
    budget,
    currency: 'INR (₹)',
    nextFollowUpDate: nextFollowUp,
    createdDate: new Date().toISOString(),
    remarks,
    followUpHistory: [
      {
        id: 'fu-import-' + Date.now(),
        date: new Date().toISOString(),
        note: `Imported via spreadsheet data. Initial status: ${leadStatus}`,
        employeeName: employee,
        statusUpdatedTo: leadStatus,
      },
    ],
  };
}
