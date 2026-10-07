import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Table,
  Eye,
  Plus,
} from 'lucide-react';
import { ClientLead } from '../types';
import {
  parseFileForImport,
  convertImportRowToLead,
  exportLeadsToCSV,
  exportLeadsToExcel,
  downloadSampleTemplate,
} from '../services/storage';

interface ImportExportModalProps {
  leads: ClientLead[];
  onImportLeads: (newLeads: ClientLead[], replaceExisting: boolean) => void;
  defaultEmployee: string;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  leads,
  onImportLeads,
  defaultEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ClientLead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);
    setParseError(null);
    setImportSuccessMsg(null);
    setIsProcessing(true);

    try {
      const rawRows = await parseFileForImport(file);
      if (!rawRows || rawRows.length === 0) {
        throw new Error('No rows found in the selected spreadsheet file.');
      }

      const converted = rawRows.map((row) =>
        convertImportRowToLead(row, defaultEmployee && defaultEmployee !== 'All' ? defaultEmployee : 'Rahul Sharma')
      );

      setParsedLeads(converted);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setParseError(err.message || 'Failed to parse file. Make sure it is a valid CSV or Excel file.');
      setParsedLeads([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = () => {
    if (parsedLeads.length === 0) return;
    onImportLeads(parsedLeads, replaceMode);
    setImportSuccessMsg(
      `Successfully imported ${parsedLeads.length} client leads into Arraylogic CRM!`
    );
    setSelectedFile(null);
    setParsedLeads([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Excel & CSV Spreadsheet Hub
          </h2>
          <p className="text-xs text-slate-500">
            Bulk import client contacts, download templates, and export leads to Excel or CSV.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'import'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Import File
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'export'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Export Leads
          </button>
        </div>
      </div>

      {activeTab === 'import' ? (
        <div className="space-y-6">
          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{importSuccessMsg}</div>
              <button
                onClick={() => setImportSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Excel or CSV File</h3>
                <p className="text-xs text-slate-500">
                  Supported formats: <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Download CSV Sample Template
              </button>
            </div>

            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-xl p-8 text-center transition-colors">
              <input
                type="file"
                id="spreadsheet-file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="spreadsheet-file" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to select or drop Excel/CSV file here'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Automatically maps Employee, Client Name, Company, Mobile, Email, Requirements, Status, and Remarks.
                </p>
                <div className="mt-4">
                  <span className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-xs inline-block">
                    Browse File
                  </span>
                </div>
              </label>
            </div>

            {isProcessing && (
              <div className="mt-4 text-center text-xs text-indigo-600 font-medium animate-pulse">
                Analyzing and mapping spreadsheet columns...
              </div>
            )}

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parseError}
              </div>
            )}
          </div>

          {/* Import Preview Table */}
          {parsedLeads.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-600" />
                    Preview Data ({parsedLeads.length} leads detected)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review parsed rows before committing to Arraylogic CRM.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceMode}
                      onChange={(e) => setReplaceMode(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Replace all existing CRM leads</span>
                  </label>

                  <button
                    onClick={handleExecuteImport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Import {parsedLeads.length} Leads
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Mobile</th>
                      <th className="py-2.5 px-3">Requirements</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedLeads.map((lead, idx) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{lead.employeeName}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{lead.clientName}</td>
                        <td className="py-2 px-3 text-slate-600">{lead.clientCompany}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{lead.clientMobile}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium">
                            {lead.requirements.join(', ')}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold text-[10px]">
                            {lead.leadStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{lead.nextFollowUpDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Export Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Export Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Export as CSV</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Download a clean comma-separated values file compatible with Google Sheets, Excel, or other CRM software. Includes all client contact details, requirements, and follow-ups.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <strong className="text-slate-900">{leads.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="font-mono">.csv (UTF-8)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => exportLeadsToCSV(leads)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Arraylogic_CRM_Leads.csv
            </button>
          </div>

          {/* Excel XLSX Export Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Export as Microsoft Excel (.xlsx)</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Download formatted Excel workbook ready for corporate reporting, pivot tables, team sharing, and management meetings.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <strong className="text-slate-900">{leads.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="font-mono">.xlsx (Workbook)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => exportLeadsToExcel(leads)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Arraylogic_CRM_Leads.xlsx
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
