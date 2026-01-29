const { Sequelize } = require('sequelize');

// Get database URI from environment
let databaseURI = process.env.NODE_ENV === 'production'
  ? (process.env.DATABASE_URI_PROD || process.env.DATABASE_URI || process.env.DATABASE_URL)
  : (process.env.DATABASE_URI || process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/placementhub');

// If password contains special chars, ensure it's URL-encoded
if (databaseURI && !databaseURI.includes('%')) {
  const uriMatch = databaseURI.match(/^postgres(ql)?:\/\/([^:]+):([^@]+)@(.+)$/);
  if (uriMatch) {
    const [, , , password] = uriMatch;
    const encodedPassword = encodeURIComponent(password);
    databaseURI = databaseURI.replace(`:${password}@`, `:${encodedPassword}@`);
  }
}

let sequelize;
try {
  // Create Sequelize instance immediately so models can use it
  sequelize = new Sequelize(databaseURI, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
  });
} catch (error) {
  console.error('❌ Failed to initialize Sequelize:', error.message);
  console.error('💡 Check DATABASE_URI/DATABASE_URL format in .env');
  throw error;
}

const connectDB = async () => {
  try {

    // Test the connection
    await sequelize.authenticate();
    console.log('📊 PostgreSQL Connected successfully');

    // Ensure extensions needed for indexes exist
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    // Sync models
    // In production (Render), you likely need an initial schema without migrations.
    // Enable this by setting DB_SYNC=true in environment variables.
    if (process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true') {
      await sequelize.sync({ force: false });
      console.log('📊 Database models synchronized');
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('📊 PostgreSQL connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure PostgreSQL is running and DATABASE_URI is set correctly in .env');
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
