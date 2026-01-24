const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const cleanupSecurity = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspiro');
    console.log('Connected to MongoDB');

    // Find users with invalid password hashes
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users to check`);

    let fixedCount = 0;
    let removedCount = 0;

    for (const user of users) {
      // Check if password is not properly hashed
      if (!user.password || (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$'))) {
        console.log(`User ${user.email} has invalid password hash`);
        
        // Remove users with invalid passwords for security
        await User.findByIdAndDelete(user._id);
        removedCount++;
        console.log(`Removed user: ${user.email}`);
      }
    }

    console.log(`Security cleanup completed:`);
    console.log(`- Users with invalid passwords removed: ${removedCount}`);
    console.log(`- Valid users remaining: ${users.length - removedCount}`);
    
    if (removedCount > 0) {
      console.log('\nIMPORTANT: Users with invalid password hashes have been removed.');
      console.log('They will need to register again with proper credentials.');
    }

  } catch (error) {
    console.error('Security cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run cleanup if called directly
if (require.main === module) {
  cleanupSecurity();
}

module.exports = cleanupSecurity;