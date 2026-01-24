import { UploadClient } from '@uploadcare/upload-client';

const PUBLIC_KEY = 'dbf1838a88113c48162b';

// Initialize Uploadcare client
const client = new UploadClient({ publicKey: PUBLIC_KEY });

class UploadcareService {
  // Upload resume file to Uploadcare
  async uploadResume(file) {
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, DOC, and DOCX files are allowed');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Upload to Uploadcare
      const result = await client.uploadFile(file, {
        store: 'auto',
        metadata: {
          filename: file.name,
          uploadedAt: new Date().toISOString(),
          fileType: 'resume'
        }
      });

      return {
        success: true,
        data: {
          uuid: result.uuid,
          name: result.name || file.name,
          size: result.size,
          mimeType: result.mimeType,
          url: result.cdnUrl,
          originalFilename: file.name,
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Uploadcare upload error:', error);
      throw new Error(error.message || 'Failed to upload resume');
    }
  }

  // Get file info from Uploadcare
  async getFileInfo(uuid) {
    try {
      const response = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
        headers: {
          'Authorization': `Uploadcare.Simple ${PUBLIC_KEY}:`,
          'Accept': 'application/vnd.uploadcare-v0.7+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file info');
      }

      const fileInfo = await response.json();
      return {
        success: true,
        data: {
          uuid: fileInfo.uuid,
          name: fileInfo.original_filename,
          size: fileInfo.size,
          mimeType: fileInfo.mime_type,
          url: fileInfo.original_file_url,
          cdnUrl: `https://ucarecdn.com/${fileInfo.uuid}/`,
          uploadedAt: fileInfo.datetime_uploaded
        }
      };
    } catch (error) {
      console.error('Uploadcare file info error:', error);
      throw new Error('Failed to get file information');
    }
  }

  // Generate CDN URL for file
  getCdnUrl(uuid, transformations = '') {
    return `https://ucarecdn.com/${uuid}/${transformations}`;
  }

  // Delete file from Uploadcare (requires secret key - should be done on backend)
  async deleteFile(uuid) {
    try {
      // This should ideally be done on the backend with secret key
      console.warn('File deletion should be handled on the backend for security');
      return { success: false, message: 'File deletion should be handled on backend' };
    } catch (error) {
      console.error('Uploadcare delete error:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export default new UploadcareService();