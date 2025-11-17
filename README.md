# Banking Portal - Financial Dashboard

A comprehensive banking portal application with real-time financial analytics, transaction management, and personalized financial tools.

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- WebSockets (real-time updates)
- JWT Authentication

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- React Router v6
- Axios

**Testing:**
- Jest (unit & integration tests)
- Playwright (e2e tests)

## Features

### Financial Dashboard Overview
- Real-time financial health monitoring
- Current balance, income, expenses, and net worth tracking
- Visual data representation with interactive charts
- Income vs expenses comparison
- Recent transactions list
- Month-over-month trend analysis
- Responsive design (desktop, tablet, mobile)

### Authentication & Security
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers

### Real-time Updates
- WebSocket integration for live data updates
- Dashboard refreshes within 5 seconds of transaction changes

## Getting Started

### 1. Clone and Setup

```bash
# Navigate to project directory
cd test_projex3

# Copy environment variables
cp .env.example .env

# Edit .env and update values (especially JWT_SECRET and DB_PASSWORD)
```

### 2. Start Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Verify database is running
docker ps
```

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/health
- **WebSocket:** ws://localhost:5000/ws

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/overview` - Get financial overview
- `GET /api/dashboard/summary` - Get financial summary

## License

Educational/Development purposes - Banking Portal Sprint
