# 🚀 Deploy Your Lead Generation Platform to Vercel

## Quick Deployment Steps

### 1. Prepare Your GitHub Repository
```bash
# Create a new repository on GitHub
# Push your code to GitHub
git init
git add .
git commit -m "Initial commit - Lead Generation Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lead-generator.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration

### 3. Set Environment Variables in Vercel
In your Vercel dashboard, go to your project → Settings → Environment Variables:

**Required Variables:**
```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

**Optional Variables (for enhanced features):**
```
SENDGRID_API_KEY=your_sendgrid_key
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### 4. Database Setup
**Option A: Use Vercel Postgres (Recommended)**
```bash
# In Vercel dashboard
1. Go to Storage tab
2. Create Postgres database
3. Copy connection string to DATABASE_URL
```

**Option B: Use External Database**
- Neon.tech (Free PostgreSQL)
- PlanetScale (Free MySQL)
- Supabase (Free PostgreSQL)

### 5. Build Commands (Automatic)
Vercel will use these commands automatically:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install"
}
```

## 🎯 Platform Features After Deployment

✅ **Instant Business Discovery**
- Find businesses without websites in Uganda
- OpenStreetMap integration (no API keys needed)
- Real business data from multiple sources

✅ **Multi-Channel Communication**
- WhatsApp Business API integration
- Free SMS via TextBelt
- Email via FormSubmit (no DNS setup)
- Webhook automation for follow-ups

✅ **Professional Templates**
- Ugandan market-focused messaging
- 700K-1.7M UGX pricing included
- Professional business outreach

## 🌍 Production URLs
After deployment, your platform will be available at:
- `https://your-project-name.vercel.app`
- Custom domain: Add in Vercel dashboard

## 🔧 Troubleshooting

**Build Issues:**
- Check Vercel build logs in dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

**Database Issues:**
- Test DATABASE_URL connection
- Run migrations if needed
- Check Vercel function logs

**API Issues:**
- Verify environment variables
- Check Vercel function timeout (30s max)
- Review API logs in Vercel dashboard

## 📊 Expected Performance
- **Global CDN**: Fast loading worldwide
- **Serverless Functions**: Automatic scaling
- **99.9% Uptime**: Vercel's reliability
- **HTTPS**: Automatic SSL certificates

Your lead generation business will be live and ready to generate income within minutes of deployment!

## 💰 Costs
- **Vercel Pro**: $20/month (recommended for business use)
- **Database**: 
  - Vercel Postgres: $20/month
  - Neon.tech: Free tier available
- **Total**: ~$20-40/month for full professional setup

This investment pays for itself with just 1-2 website clients per month at 700K+ UGX each!