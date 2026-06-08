require('dotenv').config();

// Fail fast on missing/weak critical secrets before accepting traffic.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'your_jwt_secret_here') {
  console.error('❌ JWT_SECRET must be set to a strong value (>= 32 chars). Refusing to start.');
  process.exit(1);
}

const app = require('./src/app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 PlaceHub Backend Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});