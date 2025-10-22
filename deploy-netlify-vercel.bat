@echo off
echo 🚀 AgriTrade Manager - Netlify + Vercel Deployment
echo ================================================

echo.
echo 📋 Prerequisites Check:
echo - GitHub account ✓
echo - Netlify account ✓  
echo - Vercel account ✓
echo - MongoDB Atlas account ✓

echo.
echo 📝 Step-by-Step Instructions:
echo.
echo 1. Push your code to GitHub:
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/yourusername/agritrade-manager.git
echo    git push -u origin main
echo.
echo 2. Setup MongoDB Atlas:
echo    - Go to https://cloud.mongodb.com
echo    - Create free cluster
echo    - Get connection string
echo    - Add database user
echo.
echo 3. Deploy Backend to Vercel:
echo    - Go to https://vercel.com
echo    - Import GitHub repository
echo    - Set Root Directory to "backend"
echo    - Add Environment Variables:
echo      MONGO_URI: mongodb+srv://user:pass@cluster.mongodb.net/agritrade
echo      JWT_SECRET: your-super-secure-jwt-secret-key-minimum-32-characters
echo      NODE_ENV: production
echo    - Deploy
echo.
echo 4. Deploy Frontend to Netlify:
echo    - Go to https://netlify.com
echo    - Import GitHub repository
echo    - Set Base directory to "frontend"
echo    - Set Build command to "npm run build"
echo    - Set Publish directory to "dist"
echo    - Add Environment Variable:
echo      VITE_API_URL: https://your-backend-url.vercel.app/api
echo    - Deploy
echo.
echo 5. Seed Production Database:
echo    cd backend
echo    node seed-production.js
echo.
echo 6. Test Your Deployment:
echo    - Visit your Netlify URL
echo    - Login: admin@agritrade.com / admin123
echo    - Test all features
echo.
echo 📚 For detailed instructions, see NETLIFY-VERCEL-DEPLOYMENT.md
echo.
pause
