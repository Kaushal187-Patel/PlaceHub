import { useState } from 'react';
import { mlApi } from '../services/api';

const TestMLConnection = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: Health Check
      console.log('Testing health check...');
      const healthResponse = await mlApi.get('/health');
      results.health = {
        success: true,
        data: healthResponse.data
      };
      console.log('Health check passed:', healthResponse.data);
    } catch (error) {
      results.health = {
        success: false,
        error: error.message
      };
      console.error('Health check failed:', error);
    }

    try {
      // Test 2: Job Roles
      console.log('Testing job roles...');
      const rolesResponse = await mlApi.get('/job-roles');
      results.jobRoles = {
        success: true,
        data: rolesResponse.data
      };
      console.log('Job roles passed:', rolesResponse.data);
    } catch (error) {
      results.jobRoles = {
        success: false,
        error: error.message
      };
      console.error('Job roles failed:', error);
    }

    try {
      // Test 3: Career List
      console.log('Testing career list...');
      const careersResponse = await mlApi.get('/career/list');
      results.careers = {
        success: true,
        data: careersResponse.data
      };
      console.log('Career list passed:', careersResponse.data);
    } catch (error) {
      results.careers = {
        success: false,
        error: error.message
      };
      console.error('Career list failed:', error);
    }

    try {
      // Test 4: Skills Extraction
      console.log('Testing skills extraction...');
      const skillsResponse = await mlApi.post('/resume/skills', {
        resume_text: 'Python, JavaScript, React, SQL, Machine Learning'
      });
      results.skills = {
        success: true,
        data: skillsResponse.data
      };
      console.log('Skills extraction passed:', skillsResponse.data);
    } catch (error) {
      results.skills = {
        success: false,
        error: error.message
      };
      console.error('Skills extraction failed:', error);
    }

    try {
      // Test 5: Career Recommendations
      console.log('Testing career recommendations...');
      const recommendationsResponse = await mlApi.post('/career/recommendations', {
        skills: 'python, javascript, react',
        interests: 'web development, problem solving',
        education: 'Bachelor of Computer Science',
        goals: 'remote work, high salary'
      });
      results.recommendations = {
        success: true,
        data: recommendationsResponse.data
      };
      console.log('Career recommendations passed:', recommendationsResponse.data);
    } catch (error) {
      results.recommendations = {
        success: false,
        error: error.message
      };
      console.error('Career recommendations failed:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        ML Service Connection Test (Port 5002)
      </h2>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="mb-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
      >
        {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div
              key={testName}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <h3 className={`font-semibold ${
                result.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {testName.charAt(0).toUpperCase() + testName.slice(1)}: {result.success ? 'PASSED' : 'FAILED'}
              </h3>
              {result.success ? (
                <pre className="mt-2 text-sm text-green-700 dark:text-green-300 overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  Error: {result.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestMLConnection; 