# Netlify Deploy Button Configuration

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/MrNova420/web-game)

## One-Click Deploy

Click the button above to deploy Fantasy Survival MMO to Netlify in one click!

### What Happens When You Click Deploy:

1. **Fork Repository** - Creates a copy in your GitHub account
2. **Configure Site** - Netlify auto-configures build settings
3. **Deploy** - Builds and deploys your game
4. **Live in 2-5 minutes** - Your game is online and ready to play!

### After Deployment:

Your game will be live at: `https://random-name-123.netlify.app`

**What works immediately:**
✅ Menu appears instantly (< 100ms)
✅ Asset preloading in background
✅ User can click "Play" to start
✅ Full game with all 39 systems
✅ 3D world renders
✅ Player controls work

### Important Notes:

⚠️ **Assets**: The `extracted_assets` folder is large (4,885 files). The deploy may take longer on first build as it copies all assets. Subsequent builds use cache.

💡 **Tip**: For best performance, consider hosting assets on a CDN (AWS S3, Cloudinary) and updating environment variables.

## Manual Configuration

If you need to configure manually:

### Build Settings:
```
Build command: cd client && npm install && npm run build
Publish directory: client/dist
```

### Environment Variables (Optional):
```
NODE_VERSION = 18
VITE_API_URL = (your backend URL if separate)
VITE_SOCKET_URL = (your WebSocket URL if separate)
```

## Testing Your Deployed Game

1. Visit your Netlify URL
2. See instant menu display
3. Wait for "Ready to play!" message (1-2 seconds)
4. Click "Play" button
5. Game loads with loading screen
6. 3D world appears
7. Use WASD to move, mouse to look around

## Customization

### Custom Domain:
1. Go to Netlify Dashboard → Domain settings
2. Add your custom domain
3. Follow DNS configuration steps

### Backend Integration:
If you have a separate backend:
1. Deploy backend (Heroku, Railway, etc.)
2. Update environment variables in Netlify
3. Configure CORS on backend

## Need Help?

See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for comprehensive deployment guide.

---

**Your game will be fully ready to play online after clicking deploy!** 🎮🚀
