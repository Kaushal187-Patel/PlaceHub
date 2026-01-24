import api from './api';
import uploadcareService from './uploadcareService';

class UploadcareResumeService {
  // Upload resume to Uploadcare and store data in backend
  async uploadResume(file) {
    try {
      // First upload to Uploadcare
      const uploadResult = await uploadcareService.uploadResume(file);
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload to Uploadcare');
      }

      // Then store Uploadcare data in backend
      const response = await api.post('/uploadcare/resume', {
        uuid: uploadResult.data.uuid,
        filename: uploadResult.data.name,
        url: uploadResult.data.url,
        size: uploadResult.data.size,
        mimeType: uploadResult.data.mimeType,
        uploadedAt: uploadResult.data.uploadedAt
      });

      return {
        status: 'success',
        data: {
          ...uploadResult.data,
          backendStored: true
        }
      };

    } catch (error) {
      console.error('Upload resume error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload resume');
    }
  }

  // Get user's resume from backend
  async getResume() {
    try {
      const response = await api.get('/uploadcare/resume');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'error', message: 'No resume found' };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch resume');
    }
  }

  // Get resume file info from Uploadcare
  async getResumeFileInfo(uuid) {
    try {
      return await uploadcareService.getFileInfo(uuid);
    } catch (error) {
      throw new Error('Failed to get resume file info');
    }
  }

  // Generate CDN URL for resume
  getResumeCdnUrl(uuid, transformations = '') {
    return uploadcareService.getCdnUrl(uuid, transformations);
  }
}

export default new UploadcareResumeService();