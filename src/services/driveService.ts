import { DriveBackupFile, DriveAttachment, ClientLead } from '../types';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3';
const ROOT_FOLDER_NAME = 'Arraylogic CRM Backups & Documents';

/**
 * Searches for or creates a dedicated root folder in user's Google Drive.
 */
export async function getOrCreateFolder(
  folderName: string = ROOT_FOLDER_NAME,
  accessToken: string
): Promise<string> {
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id, name)`;

  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to query Google Drive folder: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Directory for Arraylogic Software CRM backups and client attachments',
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create Google Drive folder: ${createResponse.status} ${errorText}`);
  }

  const createdData = await createResponse.json();
  return createdData.id;
}

/**
 * Uploads a JSON backup of the CRM leads to Google Drive.
 */
export async function uploadBackupToDrive(
  leads: ClientLead[],
  accessToken: string,
  backupName?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const folderId = await getOrCreateFolder(ROOT_FOLDER_NAME, accessToken);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = backupName || `Arraylogic_CRM_Backup_${timestamp}.json`;

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    description: `Arraylogic CRM automated backup containing ${leads.length} leads created on ${new Date().toLocaleString()}`,
    mimeType: 'application/json',
  };

  const payload = JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalLeads: leads.length,
    leads,
  }, null, 2);

  // Use multipart upload to send metadata + content together
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    payload +
    closeDelimiter;

  const uploadUrl = `${UPLOAD_API_URL}/files?uploadType=multipart&fields=id,name,webViewLink`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload backup to Google Drive: ${res.status} ${err}`);
  }

  return await res.json();
}

/**
 * Uploads a client attachment (PDF, Proposal, Contract, Image) to Google Drive.
 */
export async function uploadClientFileToDrive(
  file: File,
  clientName: string,
  accessToken: string
): Promise<DriveAttachment> {
  const folderId = await getOrCreateFolder(ROOT_FOLDER_NAME, accessToken);

  const fileMetadata = {
    name: `[${clientName}] ${file.name}`,
    parents: [folderId],
    description: `Client document for ${clientName} uploaded via Arraylogic CRM`,
  };

  const metadataBlob = new Blob([JSON.stringify(fileMetadata)], { type: 'application/json; charset=UTF-8' });
  const formData = new FormData();
  formData.append('metadata', metadataBlob);
  formData.append('file', file);

  // Boundary-safe multipart
  const boundary = '-------' + Math.random().toString().slice(2);
  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(fileMetadata) +
    `\r\n`;

  const fileBuffer = await file.arrayBuffer();

  const preContent = new TextEncoder().encode(metadataPart + `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`);
  const postContent = new TextEncoder().encode(`\r\n--${boundary}--`);

  const combinedBody = new Uint8Array(preContent.length + fileBuffer.byteLength + postContent.length);
  combinedBody.set(preContent, 0);
  combinedBody.set(new Uint8Array(fileBuffer), preContent.length);
  combinedBody.set(postContent, preContent.length + fileBuffer.byteLength);

  const res = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: combinedBody,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload client file to Drive: ${res.status} ${err}`);
  }

  const result = await res.json();
  return {
    id: result.id,
    name: result.name || file.name,
    mimeType: result.mimeType || file.type,
    webViewLink: result.webViewLink,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Lists backups in Google Drive created for Arraylogic CRM.
 */
export async function listDriveBackups(accessToken: string): Promise<DriveBackupFile[]> {
  try {
    const folderId = await getOrCreateFolder(ROOT_FOLDER_NAME, accessToken);
    const query = `'${folderId}' in parents and trashed = false and (name contains 'Arraylogic_CRM' or mimeType = 'application/json')`;
    const url = `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,createdTime,modifiedTime,size,description,mimeType,webViewLink)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to list Google Drive backups: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing backups:', err);
    throw err;
  }
}

/**
 * Downloads file content from Google Drive for restore/inspection.
 */
export async function downloadFileContent(fileId: string, accessToken: string): Promise<string> {
  const url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to download file from Google Drive: ${res.status} ${err}`);
  }

  return await res.text();
}

/**
 * Deletes a file from Google Drive (CRITICAL: MUST have user confirmation before calling).
 */
export async function deleteDriveFile(fileId: string, accessToken: string): Promise<void> {
  const url = `${DRIVE_API_URL}/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${res.status} ${err}`);
  }
}
