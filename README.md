# DevGuard AI Elite

Enterprise-grade operational telemetry platform for developer burnout and productivity monitoring.

## Project Structure
```
DevGuardAIElite/
├── frontend/           # React frontend application
│   ├── pages/         # React page components
│   ├── services/      # API and service integrations
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main React application
│   ├── index.html     # HTML entry point
│   ├── index.tsx      # React entry point
│   ├── server.js      # Frontend server
│   └── package.json   # Frontend dependencies
├── backend/           # Express.js backend server
│   ├── server.js      # Main server file
│   ├── .env           # Environment variables
│   └── package.json   # Backend dependencies
└── README.md          # This file
```

## API Endpoints
- `GET /api/developers` - Get all developers
- `POST /api/developers` - Create new developer
- `POST /api/activity` - Log developer activity
- `GET /api/metrics/:developerId` - Get developer metrics
- `GET /api/insights/:developerId` - Get AI insights
- `POST /api/insights` - Save AI insight

## Running the Application

### Backend Server
```bash
cd backend
npm install
npm start
```
Backend will run on: http://localhost:3002

### Frontend Server
```bash
cd frontend  
npm install
npm start
```
Frontend will run on: http://localhost:3000

### Quick Start (Windows)
- Backend: Double-click `backend/start.bat`
- Frontend: Double-click `frontend/start.bat`
