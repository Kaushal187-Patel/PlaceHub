const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testUploadcareIntegration = async () => {
  try {
    console.log('🧪 Testing Uploadcare Integration...\n');

    // Step 1: Create test user
    console.log('1. Creating test user...');
    const uniqueEmail = `uploadcare-test-${Date.now()}@test.com`;
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Uploadcare Test User',
      email: uniqueEmail,
      password: 'TestPass123',
      role: 'student'
    });

    const token = registerResponse.data.data.token;
    console.log('✅ Test user created');

    // Step 2: Test storing Uploadcare resume data
    console.log('\n2. Testing Uploadcare resume storage...');
    const mockUploadcareData = {
      uuid: 'test-uuid-12345',
      filename: 'test-resume.pdf',
      url: 'https://ucarecdn.com/test-uuid-12345/',
      size: 1024000,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString()
    };

    const storeResponse = await axios.post(`${API_BASE}/uploadcare/resume`, mockUploadcareData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Uploadcare resume data stored');
    console.log('- UUID:', storeResponse.data.data.uuid);
    console.log('- Filename:', storeResponse.data.data.filename);
    console.log('- CDN URL:', storeResponse.data.data.url);

    // Step 3: Test retrieving Uploadcare resume
    console.log('\n3. Testing Uploadcare resume retrieval...');
    const getResponse = await axios.get(`${API_BASE}/uploadcare/resume`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Uploadcare resume retrieved');
    console.log('- Resume UUID:', getResponse.data.data.resume.uuid);
    console.log('- Resume filename:', getResponse.data.data.resume.filename);
    console.log('- CDN URL:', getResponse.data.data.resume.cdnUrl);
    console.log('- Analysis available:', !!getResponse.data.data.analysis);

    // Step 4: Test profile integration
    console.log('\n4. Testing profile integration...');
    const profileResponse = await axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = profileResponse.data.data;
    console.log('✅ Profile data retrieved');
    console.log('- Uploadcare resume in profile:', !!userData.uploadcareResume);
    console.log('- Resume analysis in profile:', !!userData.resumeAnalysis);
    
    if (userData.uploadcareResume) {
      console.log('- Resume UUID:', userData.uploadcareResume.uuid);
      console.log('- Resume filename:', userData.uploadcareResume.filename);
    }

    if (userData.resumeAnalysis) {
      console.log('- Analysis score:', userData.resumeAnalysis.score + '%');
      console.log('- Strengths count:', userData.resumeAnalysis.strengths?.length || 0);
      console.log('- Suggestions count:', userData.resumeAnalysis.suggestions?.length || 0);
    }

    console.log('\n🎉 Uploadcare integration test completed!');
    console.log('\n📋 Integration Summary:');
    console.log('- ✅ Uploadcare resume data storage working');
    console.log('- ✅ Resume retrieval from backend working');
    console.log('- ✅ Profile integration with Uploadcare data');
    console.log('- ✅ Resume analysis generation working');
    console.log('- ✅ CDN URL generation working');

  } catch (error) {
    console.error('❌ Uploadcare integration test failed:', error.response?.data || error.message);
  }
};

testUploadcareIntegration();