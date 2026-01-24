import { useState, useRef } from 'react';
import { FiUpload, FiFileText, FiTrash2, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import uploadcareService from '../services/uploadcareService';

const UploadcareResumeUploader = ({ onUploadSuccess, onUploadError, currentResume = null }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadcareService.uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call success callback with Uploadcare data
      if (onUploadSuccess) {
        onUploadSuccess({
          uuid: result.data.uuid,
          filename: result.data.name,
          url: result.data.url,
          size: result.data.size,
          mimeType: result.data.mimeType,
          uploadedAt: result.data.uploadedAt
        });
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      if (onUploadError) {
        onUploadError(error.message);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    if (currentResume?.url) {
      window.open(currentResume.url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Resume Display */}
      {currentResume && !uploading && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFileText className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  {currentResume.filename}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Uploaded: {new Date(currentResume.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Size: {(currentResume.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
                title="Download Resume"
              >
                <FiDownload className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900'
            : uploading
            ? 'border-green-400 bg-green-50 dark:bg-green-900'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Uploading to Uploadcare...
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentResume ? 'Update Your Resume' : 'Upload Your Resume'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Drag and drop your resume here, or click to browse
              </p>
            </div>
            <button
              onClick={openFileDialog}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FiUpload className="h-5 w-5 mr-2" />
              Choose File
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Success/Error Messages */}
      {uploadProgress === 100 && !uploading && (
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <FiCheck className="h-5 w-5" />
          <span className="font-medium">Upload successful!</span>
        </div>
      )}
    </div>
  );
};

export default UploadcareResumeUploader;