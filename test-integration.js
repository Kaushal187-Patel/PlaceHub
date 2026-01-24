const axios = require('axios');

// Service URLs
const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';
const ML_SERVICE_URL = 'http://localhost:5001';

// Test configuration
const TEST_USER = {
  name: 'Test User',
  email: 'test@aspiro.dev',
  password: 'testpass123',
  role: 'student'
};

const CAREER_TEST_DATA = {
  education_level: 'Bachelor',
  field_of_study: 'Computer Science',
  programming_skills: 8,
  communication_skills: 7,
  leadership_skills: 6,
  years_experience: 2,
  interests_tech: 9,
  interests_business: 4
};

let authToken = '';

async function testService(url, name) {
  try {
    const response = await axios.get(`${url}/api/health`);
    console.log(`✓ ${name} is running (${response.status})`);
    return true;
  } catch (error) {
    console.log(`✗ ${name} is not accessible: ${error.message}`);
    return false;
  }
}

async function testFrontend() {
  try {
    const response = await axios.get(FRONTEND_URL);
    console.log(`✓ Frontend is accessible (${response.status})`);
    return true;
  } catch (error) {
    console.log(`✗ Frontend is not accessible: ${error.message}`);
    return false;
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, TEST_USER);
    console.log(`✓ User registration works`);
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`✓ User registration works (user already exists)`);
      return true;
    }
    console.log(`✗ User registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    authToken = response.data.token;
    console.log(`✓ User login works`);
    return true;
  } catch (error) {
    console.log(`✗ User login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCareerRecommendation() {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/careers/suggestions`,
      CAREER_TEST_DATA,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✓ Career recommendation works`);
    console.log(`  Recommendations: ${response.data.data?.length || 0}`);
    return true;
  } catch (error) {
    console.log(`✗ Career recommendation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testMLServiceDirect() {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/career/recommend`, CAREER_TEST_DATA);
    console.log(`✓ ML Service direct access works`);
    console.log(`  Recommendations: ${response.data.recommendations?.length || 0}`);
    return true;
  } catch (error) {
    console.log(`✗ ML Service direct access failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('========================================');
  console.log('    Aspiro Integration Tests');
  console.log('========================================\n');

  const tests = [
    { name: 'Backend Service', test: () => testService(BACKEND_URL, 'Backend') },
    { name: 'ML Service', test: () => testService(ML_SERVICE_URL, 'ML Service') },
    { name: 'Frontend Service', test: testFrontend },
    { name: 'User Registration', test: testUserRegistration },
    { name: 'User Login', test: testUserLogin },
    { name: 'Career Recommendation (via Backend)', test: testCareerRecommendation },
    { name: 'ML Service Direct Access', test: testMLServiceDirect }
  ];

  let passed = 0;
  const total = tests.length;

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    try {
      if (await test()) {
        passed++;
      }
    } catch (error) {
      console.log(`✗ ${name} failed with error: ${error.message}`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log(`Integration Test Results: ${passed}/${total}`);
  console.log('========================================');

  if (passed === total) {
    console.log('🎉 All integration tests passed!');
    console.log('\nAspiro is ready to use:');
    console.log(`- Frontend: ${FRONTEND_URL}`);
    console.log(`- Backend API: ${BACKEND_URL}/api`);
    console.log(`- ML Service: ${ML_SERVICE_URL}/api`);
  } else {
    console.log('⚠️  Some tests failed. Check the services above.');
    console.log('\nMake sure all services are running:');
    console.log('- npm run dev (from root directory)');
    console.log('- Or start services individually');
  }

  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runIntegrationTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Integration test error:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };