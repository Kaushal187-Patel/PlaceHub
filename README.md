# PlaceHub - AI-Powered Career Recommendation Platform

Complete full-stack application with AI-powered career recommendations and job matching.

## 🚀 Quick Start

### Option 1: Run All Services Together

```bash
# Install all dependencies
npm run install-all

# Start all services (Backend, Frontend, ML Service)
npm run dev
```

### Option 2: Run Services Individually

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - ML Service
cd ml-service
python app.py
```

### Option 3: Using Scripts

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

## 📋 Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- Git

## 🌐 Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001
- **MongoDB**: mongodb://localhost:27017

## 🛠️ Architecture

```
placementhub-app/
├── frontend/          # React.js application
├── backend/           # Node.js/Express API
├── ml-service/        # Python Flask ML API
├── package.json       # Root package manager
├── docker-compose.yml # Container orchestration
└── README.md         # This file
```

## 🔧 Environment Setup

1. **Backend** (.env):

```env
NODE_ENV=development
PORT=5000
DATABASE_URI=postgres://postgres:password@localhost:5432/placementhub
JWT_SECRET=your_jwt_secret
```

2. **Frontend** (.env):

```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_API_URL=http://localhost:5001/api
```

3. **ML Service** (.env):

```env
FLASK_ENV=development
PORT=5001
BACKEND_URL=http://localhost:5000
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

## 📝 Available Scripts

- `npm run dev` - Start all services
- `npm run install-all` - Install all dependencies
- `npm run backend` - Start backend only
- `npm run frontend` - Start frontend only
- `npm run ml-service` - Start ML service only
- `npm run build` - Build frontend for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test all services
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.
