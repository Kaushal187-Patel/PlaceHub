import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const JobDeadlineExtension = ({ onClose }) => {
  const [extensionJobs, setExtensionJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    fetchExtensionJobs();
  }, []);

  const fetchExtensionJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/jobs/extension-required', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setExtensionJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching extension jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendDeadline = async (jobId) => {
    if (!newDeadline) {
      alert('Please select a new deadline');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/jobs/${jobId}/extend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newDeadline })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        alert('Job deadline extended successfully!');
        setExtensionJobs(prev => prev.filter(job => job._id !== jobId));
        setSelectedJob(null);
        setNewDeadline('');
      }
    } catch (error) {
      console.error('Error extending deadline:', error);
      alert('Failed to extend deadline');
    }
  };

  const handleRejectExtension = async (jobId) => {
    if (!confirm('Are you sure you want to close this job? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/jobs/${jobId}/reject-extension`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        alert('Job closed successfully');
        setExtensionJobs(prev => prev.filter(job => job._id !== jobId));
      }
    } catch (error) {
      console.error('Error rejecting extension:', error);
      alert('Failed to close job');
    }
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (extensionJobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiAlertTriangle className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Job Deadline Extensions Required
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiXCircle className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-gray-600">
            The following jobs are expiring soon. Please decide whether to extend or close them.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {extensionJobs.map((job) => (
            <div key={job._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Expires: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 mr-1" />
                      {getDaysLeft(job.applicationDeadline)} days left
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Applications received: {job.applications?.length || 0}
                  </p>
                </div>
              </div>

              {selectedJob === job._id ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Application Deadline:
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => handleExtendDeadline(job._id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <FiCheckCircle className="h-4 w-4 mr-2" />
                      Extend Deadline
                    </button>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setSelectedJob(job._id)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FiCalendar className="h-4 w-4 mr-2" />
                    Extend Deadline
                  </button>
                  <button
                    onClick={() => handleRejectExtension(job._id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <FiXCircle className="h-4 w-4 mr-2" />
                    Close Job
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobDeadlineExtension;