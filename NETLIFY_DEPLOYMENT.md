# 🌐 Netlify Deployment Guide

## Quick Deploy to Netlify

This guide will help you deploy the Fantasy Survival MMO to Netlify for online testing and playing.

---

## Prerequisites

- **GitHub Account** (for continuous deployment)
- **Netlify Account** (free) - [Sign up here](https://app.netlify.com/signup)
- **Node.js 18+** (for local builds)

---

## Method 1: Deploy via Netlify UI (Easiest)

### Step 1: Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your `MrNova420/web-game` repository
5. Choose the branch to deploy (e.g., `main` or `copilot/optimize-game-flow-and-menu`)

### Step 2: Configure Build Settings

Netlify will auto-detect settings, but verify:

**Build Settings:**
```
Base directory: (leave empty)
Build command: cd client && npm install && npm run build
Publish directory: client/dist
```

**Environment Variables:**
```
NODE_VERSION = 18
VITE_API_URL = https://your-backend.com (if you have a backend)
```

### Step 3: Deploy

1. Click "Deploy site"
2. Wait for build to complete (~2-5 minutes)
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 4: Test Your Game

1. Visit your Netlify URL
2. You'll see the **menu instantly** (< 100ms)
3. **Assets preload in background** (1-2 seconds)
4. See **"Ready to play!"** message
5. Click **"Play"** to start the game
6. Game loads with all 39 systems

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This opens a browser for authentication.

### Step 3: Build the Client

```bash
cd client
npm install
npm run build
```

### Step 4: Deploy

**For Production:**
```bash
cd ..
netlify deploy --prod --dir=client/dist
```

**For Preview (Test First):**
```bash
netlify deploy --dir=client/dist
```

### Step 5: View Your Site

```bash
netlify open:site
```

---

## Method 3: Continuous Deployment (Recommended)

### Setup Auto-Deploy from GitHub

**This method automatically deploys when you push to GitHub.**

1. **Connect Repository** (see Method 1, Step 1)
2. **Configure Build** (see Method 1, Step 2)
3. **Enable Auto-Deploy:**
   - Production: Deploys from `main` branch
   - Preview: Deploys from PRs and other branches

### Configuration File

The `netlify.toml` file in the repository root configures:
- Build commands
- Environment variables
- Redirects for SPA routing
- Security headers
- Asset caching

**Key Settings:**
```toml
[build]
  command = "cd client && npm install && npm run build"
  publish = "client/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Asset Handling on Netlify

### Symlink Issue

Netlify doesn't support symlinks by default. The `extracted_assets` folder needs to be accessible.

**Solution 1: Copy Assets During Build**

Update `client/package.json`:
```json
{
  "scripts": {
    "build": "npm run copy-assets && vite build",
    "copy-assets": "mkdir -p public/extracted_assets && cp -r ../extracted_assets/* public/extracted_assets/ 2>/dev/null || true"
  }
}
```

**Solution 2: Use Netlify Large Media** (for large asset folders)
```bash
netlify plugins:install netlify-lm-plugin
netlify lm:install
netlify lm:setup
```

**Solution 3: Host Assets on CDN** (recommended for production)
- Upload `extracted_assets` to AWS S3, Cloudinary, or similar
- Update `VITE_CDN_URL` environment variable
- Assets load from CDN instead of local files

---

## Environment Variables

### Set Environment Variables in Netlify

**Via UI:**
1. Go to Site Settings → Environment variables
2. Add variables:
   ```
   VITE_API_URL = https://your-backend.com
   VITE_SOCKET_URL = wss://your-backend.com
   NODE_VERSION = 18
   ```

**Via CLI:**
```bash
netlify env:set VITE_API_URL "https://your-backend.com"
netlify env:set VITE_SOCKET_URL "wss://your-backend.com"
netlify env:set NODE_VERSION "18"
```

**Via netlify.toml:**
Already configured in `netlify.toml` file.

---

## Custom Domain Setup

### Add Custom Domain

1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `fantasy-survival-mmo.com`)
4. Follow DNS setup instructions

### DNS Configuration

**Option A: Use Netlify DNS** (easiest)
1. Update nameservers at your domain registrar
2. Point to Netlify's nameservers
3. SSL certificate automatically provisioned

**Option B: External DNS**
Add these records:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

### Enable HTTPS

- Automatically enabled with Netlify
- Free SSL certificate from Let's Encrypt
- Auto-renewal

---

## Backend API Deployment

### Option 1: Netlify Functions (Serverless)

**For simple API endpoints:**

1. Create `netlify/functions/` directory
2. Add serverless functions:

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from serverless!' })
  };
};
```

3. Access at: `https://your-site.netlify.app/.netlify/functions/api`

### Option 2: External Backend

Deploy server separately:
- **Heroku** - Node.js hosting
- **Railway** - Modern Node.js hosting
- **Render** - Full-stack hosting
- **DigitalOcean App Platform**
- **AWS EC2** / **Google Cloud**

Update environment variables to point to backend URL.

### Option 3: Hybrid Approach

- **Frontend on Netlify** (optimized for static content)
- **Backend on dedicated host** (better for WebSocket/real-time)
- Configure CORS on backend
- Set `VITE_API_URL` to backend URL

---

## Performance Optimization

### Build Optimization

**Already configured in `vite.config.ts`:**
- Code splitting (separate chunks for Three.js, React, game systems)
- Minification with Terser
- Tree shaking
- No source maps in production

**Netlify Optimizations:**
- Automatic Brotli/Gzip compression
- Global CDN (instant load worldwide)
- HTTP/2 and HTTP/3 support
- Prerendering (optional)

### Asset Optimization

```bash
# Install Netlify plugin for optimization
netlify plugins:install @netlify/plugin-nextjs
netlify plugins:install netlify-plugin-image-optim
```

Add to `netlify.toml`:
```toml
[[plugins]]
  package = "netlify-plugin-image-optim"
```

---

## Testing Your Deployment

### Pre-Deployment Checklist

- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Assets accessible in build: Check `client/dist/`
- [ ] Environment variables configured

### Post-Deployment Testing

**1. Load Speed:**
- Menu appears < 100ms ✓
- Assets preload 1-2 seconds ✓
- Game starts smoothly ✓

**2. Functionality:**
- [ ] Menu displays correctly
- [ ] "Play" button works
- [ ] Assets load (check browser console)
- [ ] Game engine initializes
- [ ] 3D world renders
- [ ] Player controls work

**3. Performance:**
```bash
# Run Lighthouse audit
npx lighthouse https://your-site.netlify.app \
  --output=html \
  --output-path=./lighthouse-report.html

# Expected scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
```

**4. Browser Compatibility:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Monitoring & Analytics

### Netlify Analytics

Enable in Site Settings → Analytics:
- Page views
- Unique visitors
- Top pages
- Bandwidth usage

### Error Monitoring

**Setup Sentry:**
```bash
npm install @sentry/vite-plugin
```

Add to `vite.config.ts`:
```typescript
import sentryVitePlugin from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "fantasy-survival-mmo"
    })
  ]
});
```

### Performance Monitoring

**Google Analytics:**
Add to `client/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## Troubleshooting

### Issue: Build Fails

**Check:**
1. Build logs in Netlify dashboard
2. Node version matches (18+)
3. Dependencies install correctly

**Solution:**
```bash
# Test build locally
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Assets Not Loading

**Check:**
1. Browser console for 404 errors
2. Asset paths in network tab
3. `extracted_assets` symlink

**Solution:**
Use asset copying script (see Asset Handling section above)

### Issue: White Screen

**Check:**
1. Browser console for errors
2. Check if index.html loaded
3. Verify build output

**Solution:**
```bash
# Check built files
ls -la client/dist/
# Should see index.html and assets/
```

### Issue: Menu Not Appearing

**Check:**
1. `GameMenu.ts` in bundle
2. Console errors
3. Network requests

**Solution:**
Clear cache and rebuild:
```bash
cd client
rm -rf dist node_modules/.vite
npm run build
```

---

## Rollback Procedure

### Rollback to Previous Deploy

**Via UI:**
1. Go to Deploys tab
2. Find previous successful deploy
3. Click "⋯" → "Publish deploy"

**Via CLI:**
```bash
netlify rollback
```

---

## Scaling & Performance

### Automatic Scaling

Netlify automatically scales to handle traffic:
- Global CDN (188+ edge locations)
- Instant cache invalidation
- DDoS protection included
- No server management needed

### Bandwidth Limits

**Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Pro Tier** ($19/month):
- 400 GB bandwidth/month
- 25,000 build minutes/month
- Analytics and more

---

## Continuous Deployment Workflow

```
1. Push code to GitHub
   ↓
2. Netlify detects changes
   ↓
3. Build starts automatically
   ↓
4. Tests run (if configured)
   ↓
5. Build succeeds → Deploy to production
   ↓
6. Site live in 2-5 minutes
```

**Branch Previews:**
- Every PR gets a preview URL
- Test before merging
- Share with team

---

## Security Best Practices

### Already Configured

✅ Security headers in `netlify.toml`
✅ HTTPS enforced
✅ Content Security Policy (CSP) ready
✅ XSS protection enabled

### Additional Security

**Environment Variables:**
- Never commit secrets to GitHub
- Use Netlify environment variables
- Different values for preview/production

**API Security:**
- Use CORS properly
- Implement rate limiting on backend
- Validate all inputs

---

## Cost Estimate

### Free Tier (Sufficient for Testing)

✅ Perfect for your needs:
- 100 GB bandwidth (enough for 1000s of plays)
- 300 build minutes
- Automatic deployments
- HTTPS included
- Global CDN

### When to Upgrade

Upgrade to Pro ($19/month) when:
- Traffic exceeds 100 GB/month
- Need team collaboration
- Want advanced analytics
- Need faster builds

---

## Quick Commands Reference

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Link existing site
netlify link

# Deploy preview
netlify deploy

# Deploy production
netlify deploy --prod

# Open site in browser
netlify open:site

# View logs
netlify logs

# Set environment variable
netlify env:set KEY "value"

# List sites
netlify sites:list

# Build locally
netlify build

# Test locally with Netlify Dev
netlify dev
```

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Community Forums**: https://answers.netlify.com/
- **Status Page**: https://www.netlifystatus.com/
- **GitHub Issues**: Your repository issues

---

## Next Steps

1. ✅ Deploy to Netlify using Method 1 (UI)
2. ✅ Test the game online
3. ✅ Share preview URL with team
4. ✅ Configure custom domain (optional)
5. ✅ Set up backend hosting (if needed)
6. ✅ Enable monitoring and analytics
7. ✅ Optimize based on real-world usage

---

**Your game is now ready for online testing on Netlify!** 🎮🚀

Visit your site and click "Play" to start the Fantasy Survival MMO experience.

---

**Last Updated:** 2025-11-02
**Version:** 1.1.0 (Optimized for Netlify)
