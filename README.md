# AgriTrade Manager - Multi-Crop Trading Management System

A complete MERN stack web application for managing crop trading operations including purchases, sales, stock tracking, and analytics.

## 🚀 Features

- **Authentication**: JWT-based secure login system
- **Crop Management**: CRUD operations for multiple crops (Maize, Cotton, Wheat, Bajra, Soybean, etc.)
- **Farmer Management**: Complete farmer profile management
- **Purchase Management**: Record purchases with auto-calculations and CSV import/export
- **Sales Management**: Track sales to buyers with payment status
- **Stock Management**: Automatic stock updates and tracking
- **Dashboard & Analytics**: Real-time KPIs, charts, and reports using Recharts
- **Modern UI**: Responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- Recharts for data visualization
- React Hot Toast for notifications

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt for authentication
- Express Validator for input validation
- Multer for file uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd agritrade-manager
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Environment Setup

Create `.env` file in the `backend` directory:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your MongoDB connection:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agritrade
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 3. Seed Database

```bash
npm run seed
```

This will create:
- Admin user (admin@agritrade.com / admin123)
- Sample crops (Maize, Cotton, Wheat, Bajra, Soybean)
- Sample farmers and transactions

### 4. Start Development Servers

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000) concurrently.

### 5. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Login: admin@agritrade.com / admin123

## 📁 Project Structure

```
agritrade-manager/
├── backend/
│   ├── config/db.js
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Stock calculations
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   ├── api/         # API configuration
│   │   └── App.jsx
│   └── package.json
└── package.json         # Root package with dev scripts
```

## 🔧 Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend
- `npm run start` - Start production backend
- `npm run seed` - Seed database with sample data

**Backend:**
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm run seed` - Run seed script

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Crops
- `GET /api/crops` - Get all crops
- `POST /api/crops` - Create crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop

### Farmers
- `GET /api/farmers` - Get all farmers
- `POST /api/farmers` - Create farmer
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer

### Purchases
- `GET /api/purchases` - Get purchases (with filters)
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Sales
- `GET /api/sales` - Get sales (with filters)
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Stock
- `GET /api/stock` - Get stock for all crops
- `GET /api/stock/:cropId` - Get stock for specific crop
- `GET /api/stock/history/:cropId` - Get stock history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agritrade
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

2. **Build and Start:**
```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Serve static files** (using nginx, Apache, or CDN)

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: agritrade

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongodb:27017/agritrade
      JWT_SECRET: your-jwt-secret
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Features Overview

### Dashboard
- Real-time KPIs (Revenue, Cost, Profit)
- Interactive charts (Bar, Line, Pie)
- Crop-wise performance analysis
- Date range filtering

### Stock Management
- Automatic stock calculations
- Real-time updates on transactions
- Stock history tracking
- Average rate calculations

### Reporting
- Export to CSV/Excel
- Date range reports
- Crop-wise analysis
- Profit/loss summaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@agritrade.com or create an issue in the repository.

---

**AgriTrade Manager** - Digitizing agriculture trading for the modern world 🌾
