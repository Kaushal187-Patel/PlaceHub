import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ApplicationStatusUpdate = ({ application, onStatusUpdate }) => {
  const [status, setStatus] = useState(application.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'reviewed', label: 'Reviewed', color: 'text-blue-600' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'text-purple-600' },
    { value: 'interview', label: 'Interview', color: 'text-indigo-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { value: 'hired', label: 'Hired', color: 'text-green-600' }
  ];

  const handleStatusUpdate = async () => {
    if (status === application.status) {
      setMessage('No changes to update');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${application._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessage('Status updated successfully! Notifications sent to candidate.');
        onStatusUpdate && onStatusUpdate(application._id, status);
      } else {
        setMessage(data.message || 'Failed to update status');
      }
    } catch (error) {
      setMessage('Error updating status');
      console.error('Status update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status: 
            <span className={`ml-2 font-semibold ${statusOptions.find(opt => opt.value === application.status)?.color}`}>
              {statusOptions.find(opt => opt.value === application.status)?.label}
            </span>
          </label>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStatusUpdate}
          disabled={loading || status === application.status}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Update Status & Send Notifications
            </>
          )}
        </button>

        {message && (
          <div className={`flex items-center p-3 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusUpdate;