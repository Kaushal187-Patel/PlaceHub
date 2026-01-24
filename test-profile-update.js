const axios = require('axios');

const testProfileUpdate = async () => {
  try {
    console.log('🧪 Testing Profile Update Fix...\n');

    // Step 1: Register a test user
    console.log('1. Creating test user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Update Test User',
      email: 'update-test@test.com',
      password: 'TestPass123',
      role: 'student'
    });

    const token = registerResponse.data.data.token;
    console.log('✅ Test user created successfully');

    // Step 2: Test profile update with simple data
    console.log('\n2. Testing profile update...');
    const updateData = {
      name: 'Updated Test User',
      phone: '1234567890',
      location: 'Test City',
      bio: 'This is a test bio'
    };

    const updateResponse = await axios.put('http://localhost:5000/api/users/profile', updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Profile update successful!');
    console.log('Updated data:', {
      name: updateResponse.data.data.name,
      phone: updateResponse.data.data.phone,
      location: updateResponse.data.data.location,
      bio: updateResponse.data.data.bio
    });

    // Step 3: Verify the update by fetching profile
    console.log('\n3. Verifying update by fetching profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const profile = profileResponse.data.data;
    console.log('✅ Profile fetched successfully!');
    console.log('Verified data:', {
      name: profile.name,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio
    });

    console.log('\n🎉 Profile update is working correctly!');

  } catch (error) {
    console.error('❌ Profile update test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Errors:', error.response?.data?.errors);
  }
};

testProfileUpdate();