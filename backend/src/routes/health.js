const express = require('express');
const axios = require('axios');
const { sequelize } = require('../config/database');

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

router.get('/status', async (req, res) => {
  const status = {
    backend: 'healthy',
    database: 'unknown',
    mlService: 'unknown'
  };

  // Check ML service
  try {
    await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 5000 });
    status.mlService = 'healthy';
  } catch (error) {
    status.mlService = 'unavailable';
  }

  // Check database (PostgreSQL via Sequelize)
  try {
    await sequelize.authenticate();
    status.database = 'healthy';
  } catch (error) {
    status.database = 'disconnected';
  }

  const allHealthy = status.database === 'healthy';
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'success' : 'degraded',
    services: status,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;