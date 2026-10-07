export type RequirementType =
  | 'Website'
  | 'Mobile App'
  | 'Digital Marketing'
  | 'Lead Generation'
  | 'SEO'
  | 'Social Media Marketing'
  | 'Software / CRM'
  | 'E-commerce'
  | 'Graphic Design'
  | 'Other';

export const ALL_REQUIREMENTS: RequirementType[] = [
  'Website',
  'Mobile App',
  'Digital Marketing',
  'Lead Generation',
  'SEO',
  'Social Media Marketing',
  'Software / CRM',
  'E-commerce',
  'Graphic Design',
  'Other',
];

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Follow-up',
  'Proposal Sent',
  'Won',
  'Lost',
];

export type LeadSource =
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Website'
  | 'Referral'
  | 'Calling'
  | 'Email Campaign'
  | 'Other';

export const ALL_LEAD_SOURCES: LeadSource[] = [
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Website',
  'Referral',
  'Calling',
  'Email Campaign',
  'Other',
];

export interface FollowUpLog {
  id: string;
  date: string;
  note: string;
  employeeName: string;
  statusUpdatedTo?: LeadStatus;
}

export interface DriveAttachment {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: number;
  uploadedAt: string;
}

export interface ClientLead {
  id: string;
  employeeName: string;
  clientName: string;
  clientMobile: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  requirements: RequirementType[];
  otherRequirementNote?: string;
  remarks: string;
  leadStatus: LeadStatus;
  leadSource: LeadSource;
  budget?: string;
  currency?: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  lastFollowUpDate?: string;
  lastFollowUpRemarks?: string;
  createdDate: string; // ISO
  followUpHistory: FollowUpLog[];
  driveAttachments?: DriveAttachment[];
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export interface EmployeeAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Sales Executive' | 'CRM Manager' | 'Team Lead' | 'Digital Marketing Executive';
  mobile?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthSession {
  employee: EmployeeAccount;
  loginTime: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  employeeName: string;
  action: string;
  details: string;
  category: 'auth' | 'lead' | 'backup' | 'export';
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  description?: string;
  mimeType: string;
  webViewLink?: string;
}
