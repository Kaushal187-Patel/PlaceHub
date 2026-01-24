const express = require('express');
const axios = require('axios');

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

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

  // Check database
  try {
    const mongoose = require('mongoose');
    status.database = mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected';
  } catch (error) {
    status.database = 'error';
  }

  res.json({
    status: 'success',
    services: status,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;