/**
 * One-time script: Add experience and current_job columns to applications table.
 * Run from backend folder: node scripts/add-application-columns.js
 */
require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function addColumns() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.query(`
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience TEXT;
    `);
    console.log('✓ Column "experience" added (or already exists).');

    await sequelize.query(`
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS current_job TEXT;
    `);
    console.log('✓ Column "current_job" added (or already exists).');

    console.log('Done. You can submit job applications now.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addColumns();
