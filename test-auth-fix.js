const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function testAuthFix() {
  console.log('Testing authentication fix...\n');

  // Test user credentials
  const testUser = {
    email: 'test@aspiro.dev',
    password: 'testpass123'
  };

  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✓ Login successful');

    // 2. Test career suggestions (should not logout on error)
    console.log('\n2. Testing career suggestions...');
    try {
      const careerResponse = await axios.post(
        `${BACKEND_URL}/api/careers/suggestions`,
        {
          education_level: 'Bachelor',
          field_of_study: 'Computer Science',
          skills: { programming: 8, communication: 7, leadership: 6 },
          interests: { technology: 9, business: 4 },
          experience: { years: 2 }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ Career suggestions work');
      console.log(`  Got ${careerResponse.data.data?.length || 0} recommendations`);
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('✓ Career suggestions returned fallback data');
      } else {
        console.log(`✗ Career suggestions failed: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

    // 3. Test resume analysis (should not logout on error)
    console.log('\n3. Testing resume analysis...');
    try {
      const FormData = require('form-data');
      const fs = require('fs');
      
      // Create a test file
      const testContent = 'Test resume content with skills like JavaScript and Python';
      fs.writeFileSync('test-resume.txt', testContent);
      
      const formData = new FormData();
      formData.append('resume', fs.createReadStream('test-resume.txt'));
      formData.append('job_description', 'Software Engineer position');

      const resumeResponse = await axios.post(
        `${BACKEND_URL}/api/resume/analyze`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            ...formData.getHeaders()
          } 
        }
      );
      console.log('✓ Resume analysis works');
      console.log(`  Analysis rating: ${resumeResponse.data.data?.overall_rating}`);
      
      // Cleanup
      fs.unlinkSync('test-resume.txt');
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('✓ Resume analysis returned fallback data');
      } else {
        console.log(`✗ Resume analysis failed: ${error.response?.status} - ${error.response?.data?.message}`);
      }
      // Cleanup on error
      try { fs.unlinkSync('test-resume.txt'); } catch {}
    }

    // 4. Verify token is still valid
    console.log('\n4. Verifying token is still valid...');
    const profileResponse = await axios.get(
      `${BACKEND_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Token is still valid - no automatic logout occurred');
    console.log(`  User: ${profileResponse.data.data.name}`);

    console.log('\n🎉 Authentication fix test PASSED!');
    console.log('Users will no longer be logged out on service errors.');

  } catch (error) {
    console.log(`\n❌ Test failed: ${error.response?.data?.message || error.message}`);
  }
}

testAuthFix();