# Netlify + Vercel Deployment Guide

## 🚀 Deploy AgriTrade Manager to Netlify + Vercel

### Prerequisites
- GitHub account
- Netlify account (free)
- Vercel account (free)
- MongoDB Atlas account (free)

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
cd agritrade-manager
git init
git add .
git commit -m "Initial commit - AgriTrade Manager"
git branch -M main
git remote add origin https://github.com/yourusername/agritrade-manager.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Create Vercel Configuration
Create `vercel.json` in the backend folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "MONGO_URI": "@mongo_uri",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (32+ characters)
   - `NODE_ENV`: `production`
6. Click "Deploy"

### 2.3 Get Backend URL
After deployment, Vercel will give you a URL like:
`https://agritrade-manager-backend.vercel.app`

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Update API Configuration
Update `frontend/src/api/axios.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3.2 Create Netlify Configuration
Create `netlify.toml` in the frontend folder:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 3.3 Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Set **Base directory** to `frontend`
5. Set **Build command** to `npm run build`
6. Set **Publish directory** to `dist`
7. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-url.vercel.app/api`
8. Click "Deploy site"

---

## Step 4: Setup MongoDB Atlas

### 4.1 Create MongoDB Atlas Account
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (free tier)

### 4.2 Configure Database Access
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username/password
4. Set privileges to "Read and write to any database"

### 4.3 Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow from anywhere) for development
4. For production, add specific IPs

### 4.4 Get Connection String
1. Go to "Clusters"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

---

## Step 5: Configure Environment Variables

### 5.1 Vercel Environment Variables
In your Vercel dashboard:
- `MONGO_URI`: `mongodb+srv://username:password@cluster.mongodb.net/agritrade?retryWrites=true&w=majority`
- `JWT_SECRET`: `your-super-secure-jwt-secret-key-minimum-32-characters`
- `NODE_ENV`: `production`

### 5.2 Netlify Environment Variables
In your Netlify dashboard:
- `VITE_API_URL`: `https://your-backend-url.vercel.app/api`

---

## Step 6: Seed Production Database

### 6.1 Update Seed Script for Production
Create `backend/seed-production.js`:

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import your models and seed data
const seedData = require('./utils/seedData');

const seedProduction = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to production database');
    
    // Run your existing seed function
    await seedData();
    
    console.log('Production database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding production database:', error);
    process.exit(1);
  }
};

seedProduction();
```

### 6.2 Run Seed Script
```bash
cd backend
node seed-production.js
```

---

## Step 7: Test Your Deployment

### 7.1 Test Backend
```bash
curl https://your-backend-url.vercel.app/api/health
```

### 7.2 Test Frontend
1. Visit your Netlify URL
2. Try logging in with: `admin@agritrade.com` / `admin123`
3. Test all features

---

## Step 8: Custom Domain (Optional)

### 8.1 Netlify Custom Domain
1. Go to Netlify dashboard
2. Click "Domain settings"
3. Add your custom domain
4. Configure DNS records

### 8.2 Vercel Custom Domain
1. Go to Vercel dashboard
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records

---

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check if backend URL is correct in frontend
   - Verify CORS settings in backend

2. **Database Connection:**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs in deployment platform

4. **Authentication Issues:**
   - Verify JWT_SECRET is set correctly
   - Check token storage in browser
   - Verify API endpoints are accessible

### Environment Variables Checklist:
- ✅ `MONGO_URI` (Vercel)
- ✅ `JWT_SECRET` (Vercel)
- ✅ `NODE_ENV` (Vercel)
- ✅ `VITE_API_URL` (Netlify)

---

## 📊 Monitoring

### Vercel Monitoring:
- Check function logs
- Monitor API response times
- Set up alerts for errors

### Netlify Monitoring:
- Check build logs
- Monitor site performance
- Set up form submissions (if needed)

---

## 🎯 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.vercel.app`
- **API**: `https://your-backend-name.vercel.app/api`

Your AgriTrade Manager is now live and accessible worldwide! 🌍
