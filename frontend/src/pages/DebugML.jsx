import { useState } from 'react';
import TestMLConnection from '../components/TestMLConnection';
import { mlApi } from '../services/api';

const DebugML = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const testBasicConnection = async () => {
    setIsLoading(true);
    addLog('Testing basic ML service connection...', 'info');

    try {
      const response = await mlApi.get('/health');
      addLog(`✅ Health check successful: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`❌ Health check failed: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }

    setIsLoading(false);
  };

  const testResumeAnalysis = async () => {
    setIsLoading(true);
    addLog('Testing resume analysis with sample text...', 'info');

    try {
      const response = await mlApi.post('/resume/skills', {
        resume_text: 'Software Developer with 5 years experience in Python, JavaScript, React, Node.js, SQL, and AWS. Led team of 3 developers on React project. Improved system performance by 30%.'
      });
      addLog(`✅ Skills extraction successful: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`❌ Skills extraction failed: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }

    setIsLoading(false);
  };

  const testCareerRecommendations = async () => {
    setIsLoading(true);
    addLog('Testing career recommendations...', 'info');

    try {
      const response = await mlApi.post('/career/recommendations', {
        skills: 'python, javascript, react, sql, machine learning',
        interests: 'web development, data analysis, problem solving',
        education: 'Bachelor of Computer Science',
        goals: 'remote work, high salary, career growth'
      });
      addLog(`✅ Career recommendations successful: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`❌ Career recommendations failed: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }

    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ML Service Debug
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test and debug the ML service connection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Tests
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={testBasicConnection}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Test Health Check
                </button>

                <button
                  onClick={testResumeAnalysis}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Test Resume Analysis
                </button>

                <button
                  onClick={testCareerRecommendations}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Test Career Recommendations
                </button>

                <button
                  onClick={clearLogs}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API Configuration
              </h2>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">ML API URL:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {import.meta.env.VITE_ML_API_URL || 'http://localhost:5001/api'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Backend API URL:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Debug Logs
            </h2>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No logs yet. Run a test to see results.
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm font-mono ${
                        log.type === 'success' ? 'text-green-700 dark:text-green-300' :
                        log.type === 'error' ? 'text-red-700 dark:text-red-300' :
                        'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 dark:text-gray-400">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comprehensive Test Component */}
        <div className="mt-8">
          <TestMLConnection />
        </div>
      </div>
    </div>
  );
};

export default DebugML; 