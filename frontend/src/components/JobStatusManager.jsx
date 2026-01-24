import React, { useState } from 'react';
import { Play, Pause, X, Edit } from 'lucide-react';

const JobStatusManager = ({ job, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const updateJobStatus = async (newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/jobs/${job._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        onStatusUpdate && onStatusUpdate(job._id, newStatus);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
        {job.status.toUpperCase()}
      </span>
      
      {job.status === 'active' && (
        <button
          onClick={() => updateJobStatus('paused')}
          disabled={loading}
          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
          title="Pause Job"
        >
          <Pause className="w-4 h-4" />
        </button>
      )}
      
      {job.status === 'paused' && (
        <button
          onClick={() => updateJobStatus('active')}
          disabled={loading}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          title="Activate Job"
        >
          <Play className="w-4 h-4" />
        </button>
      )}
      
      {(job.status === 'active' || job.status === 'paused') && (
        <button
          onClick={() => updateJobStatus('closed')}
          disabled={loading}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Close Job"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default JobStatusManager;