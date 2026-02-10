# MongoDB to PostgreSQL Migration Guide

This document outlines the complete migration from MongoDB (Mongoose) to PostgreSQL (Sequelize) for the PlaceHub application.

## ✅ Completed Changes

### 1. Package Dependencies

- **Removed**: `mongoose`, `express-mongo-sanitize`
- **Added**: `sequelize`, `pg`
- Updated `package.json` keywords from "mongodb" to "postgresql"

### 2. Database Configuration

- **File**: `backend/src/config/database.js`
- Replaced Mongoose connection with Sequelize
- Uses `DATABASE_URI` environment variable
- Supports connection pooling and graceful shutdown

### 3. Models Converted (All to Sequelize)

All models have been converted from Mongoose schemas to Sequelize models:

- ✅ **User** (`backend/src/models/User.js`)

  - UUID primary keys instead of ObjectId
  - JSONB for nested objects (experience, education, resumeAnalysis, uploadcareResume)
  - ARRAY type for skills
  - Instance methods preserved (getSignedJwtToken, matchPassword, getResetPasswordToken)
  - Hooks converted to Sequelize hooks

- ✅ **Job** (`backend/src/models/Job.js`)

  - Foreign key: `recruiterId` (references users.id)
  - ARRAY type for skills
  - GIN indexes for array and text search

- ✅ **Application** (`backend/src/models/Application.js`)

  - Foreign keys: `userId`, `jobId`, `resumeId`
  - Unique constraint on (userId, jobId)

- ✅ **Resume** (`backend/src/models/Resume.js`)

  - JSONB for analysis data
  - Hook to ensure only one latest resume per user

- ✅ **SavedJob** (`backend/src/models/SavedJob.js`)

  - Foreign keys: `userId`, `jobId`
  - Unique constraint on (userId, jobId)

- ✅ **Notification** (`backend/src/models/Notification.js`)
  - Foreign keys: `userId`, `applicationId`

### 4. Model Associations

- **File**: `backend/src/models/index.js` (NEW)
- All model associations defined (hasMany, belongsTo)
- Must be imported before using models with associations

### 5. Controllers Updated

All controllers converted from Mongoose queries to Sequelize:

- ✅ **users.js**:

  - `find()` → `findAll()` / `findAndCountAll()`
  - `findById()` → `findByPk()`
  - `findOne()` → `findOne()`
  - `populate()` → `include` option
  - `$or`, `$regex` → `Op.or`, `Op.iLike`

- ✅ **jobs.js**:

  - Array queries: `$in` → `Op.overlap` for PostgreSQL arrays
  - Date comparisons: `$gt` → `Op.gt`
  - Foreign key: `recruiter` → `recruiterId`

- ✅ **applications.js**:

  - All queries converted to Sequelize
  - Includes for related models

- ✅ **auth.js**:
  - `findOne()` → `findOne({ where: {...} })`
  - `findByIdAndUpdate()` → `findByPk()` + `update()`
  - `select('+password')` → `attributes: { include: ['password'] }`

### 6. Middleware Updated

- ✅ **auth.js**: `findById()` → `findByPk()`

### 7. Services Updated

- ✅ **jobExpiryService.js**: All MongoDB queries converted to Sequelize
- ✅ **chatbotService.js**: `findById()` → `findByPk()`

### 8. Configuration Files

- ✅ **app.js**:

  - Removed `express-mongo-sanitize`
  - Updated database connection import
  - Added models initialization

- ✅ **passport.js**: All User queries converted to Sequelize

- ✅ **.env.example**: Updated with PostgreSQL DATABASE_URI format

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:

- `sequelize` (v6.35.2)
- `pg` (v8.11.3)

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with:

```env
DATABASE_URI=postgres://postgres:Kaushal%408697@127.0.0.1:5432/PlaceHub
```

**Note**: URL-encode special characters in passwords (e.g., `@` becomes `%40`)

### 3. Database Setup

Make sure PostgreSQL is running and the database `PlaceHub` exists:

```sql
CREATE DATABASE PlaceHub;
```

### 4. Run Database Migrations

The application will automatically sync models on first run (development mode).
For production, you should use migrations:

```bash
# In development, models auto-sync
npm run dev

# For production, create migrations
npx sequelize-cli migration:generate --name initial-schema
```

### 5. Important Notes

#### Field Name Changes

- `_id` → `id` (UUID instead of ObjectId)
- `recruiter` → `recruiterId` (in Job model)
- `user` → `userId` (in Application, Resume, SavedJob, Notification)
- `job` → `jobId` (in Application, SavedJob)
- `resume` → `resumeId` (in Application)

#### Query Changes

- MongoDB: `User.find({ email: 'test@example.com' })`
- Sequelize: `User.findOne({ where: { email: 'test@example.com' } })`

- MongoDB: `User.findById(id).select('-password')`
- Sequelize: `User.findByPk(id, { attributes: { exclude: ['password'] } })`

- MongoDB: `.populate('job')`
- Sequelize: `include: [{ model: Job, as: 'job' }]`

#### Array Queries

- MongoDB: `skills: { $in: ['JavaScript', 'Python'] }`
- Sequelize: `skills: { [Op.overlap]: ['JavaScript', 'Python'] }`

#### Date Queries

- MongoDB: `applicationDeadline: { $gt: new Date() }`
- Sequelize: `applicationDeadline: { [Op.gt]: new Date() }`

## 🚨 Breaking Changes

1. **ID Format**: Changed from MongoDB ObjectId to UUID

   - All `_id` references now use `id`
   - Frontend may need updates if it hardcodes `_id`

2. **Foreign Key Names**: Changed to camelCase with "Id" suffix

   - `recruiter` → `recruiterId`
   - `user` → `userId`
   - `job` → `jobId`

3. **Query Syntax**: All queries must use Sequelize syntax

   - No more `.populate()` - use `include` instead
   - No more `.select()` - use `attributes` instead

4. **Model Imports**: Models should be imported from `../models` (index file)
   ```javascript
   const { User, Job, Application } = require("../models");
   ```

## 📝 Next Steps

1. **Test the Application**:

   ```bash
   npm run dev
   ```

2. **Check Database Connection**:

   - Look for "📊 PostgreSQL Connected successfully" in console
   - Verify tables are created

3. **Update Frontend** (if needed):

   - Change `_id` to `id` in API responses
   - Update foreign key field names if hardcoded

4. **Data Migration** (if you have existing MongoDB data):

   - Export data from MongoDB
   - Transform ObjectIds to UUIDs
   - Transform field names (recruiter → recruiterId, etc.)
   - Import to PostgreSQL

5. **Create Database Indexes**:
   - The models define indexes, but you may want to add:
     ```sql
     CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For text search
     ```

## 🔍 Verification Checklist

- [ ] Database connection successful
- [ ] All models sync without errors
- [ ] User registration works
- [ ] User login works
- [ ] Job creation works
- [ ] Application submission works
- [ ] Resume upload works
- [ ] All API endpoints respond correctly

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Migrations Guide](https://sequelize.org/docs/v6/other-topics/migrations/)

## ⚠️ Troubleshooting

### Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URI format and encoding
- Verify database exists: `psql -l`

### Model Sync Issues

- Check for syntax errors in model definitions
- Verify all foreign key references are correct
- Check that models/index.js is imported before using associations

### Query Issues

- Ensure Sequelize operators are imported: `const { Op } = require('sequelize');`
- Check that `include` arrays match association names defined in models/index.js

---

**Migration completed on**: January 24, 2026
**Database**: PostgreSQL
**ORM**: Sequelize v6.35.2
