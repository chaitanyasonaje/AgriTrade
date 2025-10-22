# Deployment Guide - AgriTrade Manager

## 🚀 Quick Deployment Options

### Option 1: Local Development Setup

1. **Install Prerequisites:**
   ```bash
   # Install Node.js (v16+) from https://nodejs.org
   # Install MongoDB locally or use MongoDB Atlas
   ```

2. **Setup Project:**
   ```bash
   cd agritrade-manager
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. **Configure Environment:**
   ```bash
   # Copy environment file
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your MongoDB URI:
   # MONGO_URI=mongodb://localhost:27017/agritrade
   # JWT_SECRET=your-super-secret-key-here
   ```

4. **Seed Database & Start:**
   ```bash
   npm run seed
   npm run dev
   ```

5. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api
   - Login: admin@agritrade.com / admin123

---

## 🌐 Cloud Deployment Options

### Option 2: Heroku Deployment

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Prepare for Heroku:**
   ```bash
   cd agritrade-manager
   
   # Create Procfile for backend
   echo "web: npm start" > backend/Procfile
   
   # Add start script to backend/package.json
   # "start": "node server.js"
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   heroku create agritrade-backend-yourname
   heroku addons:create mongolab:sandbox
   heroku config:set JWT_SECRET=your-production-secret-key
   heroku config:set NODE_ENV=production
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

4. **Deploy Frontend:**
   ```bash
   cd frontend
   # Update src/api/axios.js with Heroku backend URL
   # const API_BASE_URL = 'https://agritrade-backend-yourname.herokuapp.com/api';
   
   npm run build
   # Deploy dist/ folder to Netlify, Vercel, or GitHub Pages
   ```

### Option 3: Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   railway init
   railway add mongodb
   railway variables set JWT_SECRET=your-production-secret
   railway variables set NODE_ENV=production
   railway up
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   # Update API URL in src/api/axios.js
   npm run build
   railway init
   railway up
   ```

### Option 4: Vercel + MongoDB Atlas

1. **Setup MongoDB Atlas:**
   - Create account at https://cloud.mongodb.com
   - Create cluster and get connection string
   - Whitelist IP addresses

2. **Deploy Backend to Vercel:**
   ```bash
   cd backend
   npm install -g vercel
   vercel
   # Set environment variables in Vercel dashboard:
   # MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/agritrade
   # JWT_SECRET=your-secret-key
   ```

3. **Deploy Frontend to Vercel:**
   ```bash
   cd frontend
   # Update API URL in src/api/axios.js
   vercel
   ```

---

## 🐳 Docker Deployment

### Option 5: Docker Compose

1. **Create Dockerfile for Backend:**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend:**
   ```dockerfile
   # frontend/Dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     mongodb:
       image: mongo:latest
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_DATABASE: agritrade
       volumes:
         - mongodb_data:/data/db
   
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         MONGO_URI: mongodb://mongodb:27017/agritrade
         JWT_SECRET: your-jwt-secret
         NODE_ENV: production
       depends_on:
         - mongodb
   
     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       depends_on:
         - backend
   
   volumes:
     mongodb_data:
   ```

4. **Deploy with Docker:**
   ```bash
   docker-compose up -d
   ```

---

## 🔧 Production Configuration

### Environment Variables for Production:

```env
# Backend .env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agritrade
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
NODE_ENV=production
```

### Frontend API Configuration:

Update `frontend/src/api/axios.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'
  : 'http://localhost:5000/api';
```

### Security Checklist:

- ✅ Change default JWT secret
- ✅ Use HTTPS in production
- ✅ Set secure MongoDB credentials
- ✅ Enable CORS for your domain
- ✅ Use environment variables
- ✅ Enable MongoDB authentication

---

## 📊 Monitoring & Maintenance

### Health Checks:
- Backend: `GET /api/health`
- Frontend: Check if app loads

### Database Backup:
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/agritrade" --out=backup/
```

### Logs:
- Backend logs: Check your hosting platform logs
- Frontend errors: Browser console
- Database logs: MongoDB logs

---

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check CORS configuration in backend
   - Verify API URL in frontend

2. **Database Connection:**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database is running

3. **Authentication Issues:**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Check localStorage for token

4. **Build Errors:**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall
   - Check for missing dependencies

### Support:
- Check application logs
- Verify environment variables
- Test API endpoints with Postman
- Check browser console for errors

---

## 🎯 Recommended Deployment Path:

**For Beginners:** Railway (easiest)
**For Production:** Vercel + MongoDB Atlas
**For Full Control:** Docker + VPS
**For Enterprise:** Kubernetes + Cloud Provider

Choose the option that best fits your needs and technical expertise!
