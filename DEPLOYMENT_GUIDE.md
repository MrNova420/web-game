# Production Deployment Checklist

## Game Flow Architecture (v1.1.0)

**New Optimized Startup Flow:**
1. **Instant Menu Display** (< 100ms) - User sees game-menu (2).html design immediately
2. **Background Asset Preloading** - 6 critical assets load while user browses menu
3. **User-Controlled Start** - GameEngine initializes only when "Play" clicked
4. **Loading Manager** - Shows progress during game system initialization
5. **39 Game Systems** - All systems initialize in sequence
6. **Game Ready** - User can play immediately

**Critical Components:**
- `client/src/ui/GameMenu.ts` - Menu manager with background preloading
- `client/src/main.ts` - Orchestrates startup flow
- `client/src/core/GameEngine.ts` - Main game engine (39 systems)
- `client/src/assets/AssetLoader.ts` - Asset loading infrastructure

---

## Pre-Deployment Checklist

### Code Quality ✓
- [ ] All linting errors fixed
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME comments addressed
- [ ] Code reviewed and approved
- [ ] Git history clean (no sensitive data)
- [ ] GameMenu.ts properly integrated
- [ ] Asset preloading tested with real assets
- [ ] Menu-to-game transition smooth

### Testing ✓
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All stress tests passing
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Performance benchmarks met
- [ ] Memory leak testing complete
- [ ] Network stress testing complete

### Security ✓
- [ ] No API keys in code
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] XSS prevention in place
- [ ] Rate limiting configured
- [ ] HTTPS enabled
- [ ] Security headers set

### Performance ✓
- [ ] Bundle size optimized (< 1MB total)
- [ ] Images compressed
- [ ] Assets minified
- [ ] Gzip compression enabled
- [ ] CDN configured
- [ ] Caching strategy implemented
- [ ] Lazy loading enabled
- [ ] Code splitting configured

### Monitoring ✓
- [ ] Error tracking setup
- [ ] Performance monitoring enabled
- [ ] Analytics configured
- [ ] Logging system in place
- [ ] Uptime monitoring configured
- [ ] Alerts configured

---

## Deployment Steps

### 1. Final Testing

```bash
# Run complete test suite
cd /path/to/web-game
./test-all.sh

# Build both client and server
cd client && npm run build
cd ../server && npm run build

# Test production builds locally
cd server && npm start &
cd client && npx serve -s dist
```

### 2. Environment Configuration

**Client (.env.production):**
```env
VITE_API_URL=https://api.yourgame.com
VITE_SOCKET_URL=https://api.yourgame.com
VITE_CDN_URL=https://cdn.yourgame.com
VITE_ANALYTICS_ID=your-analytics-id
```

**Server (.env.production):**
```env
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://yourgame.com
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
```

### 3. Build for Production

```bash
# Client
cd client
npm run build
# Output in client/dist/

# Server
cd server
npm run build
# Output in server/dist/
```

### 4. Deploy Options

---

## Option A: Vercel (Recommended for Client)

### Quick Deploy
```bash
cd client
npm install -g vercel
vercel --prod
```

### Custom Domain Setup
1. Add domain in Vercel dashboard
2. Update DNS records:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Environment Variables
```bash
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production
```

---

## Option B: Netlify (Alternative for Client)

### Deploy via CLI
```bash
cd client
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Netlify Configuration
**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

## Option C: AWS Deployment (Full Stack)

### Client (S3 + CloudFront)

**1. Create S3 Bucket:**
```bash
aws s3 mb s3://yourgame-client
aws s3 website s3://yourgame-client \
  --index-document index.html \
  --error-document index.html
```

**2. Upload Build:**
```bash
cd client
npm run build
aws s3 sync dist/ s3://yourgame-client --delete
```

**3. Create CloudFront Distribution:**
```bash
# Via AWS Console
# - Origin: S3 bucket
# - Cache: Enabled
# - Compress: Enabled
# - Custom domain: yourgame.com
```

**4. Invalidate Cache:**
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Server (EC2 or ECS)

**EC2 Setup:**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/your-repo/web-game.git
cd web-game/server
npm install
npm run build

# Start with PM2
pm2 start dist/server.js --name game-server
pm2 save
pm2 startup

# Configure Nginx reverse proxy
sudo apt-get install nginx
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourgame.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Option D: Docker Deployment

### Docker Compose Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    restart: always
    
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - server
    restart: always
```

**Server Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

**Client Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Option E: DigitalOcean App Platform

### Deploy via Git
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables
4. Deploy

### Deploy via CLI
```bash
doctl apps create --spec .do/app.yaml
```

**.do/app.yaml:**
```yaml
name: web-game
services:
- name: server
  github:
    branch: main
    repo: your-username/web-game
  source_dir: /server
  build_command: npm run build
  run_command: node dist/server.js
  http_port: 8080
  
- name: client
  github:
    branch: main
    repo: your-username/web-game
  source_dir: /client
  build_command: npm run build
  http_port: 80
  routes:
  - path: /
```

---

## Post-Deployment Verification

### 1. Smoke Tests

```bash
# Check server health
curl https://api.yourgame.com/health

# Check client loads
curl -I https://yourgame.com

# Test WebSocket connection
wscat -c wss://api.yourgame.com/socket.io/
```

### 2. Functional Tests

- [ ] Game loads successfully
- [ ] Player can move
- [ ] Multiplayer works
- [ ] Assets load correctly
- [ ] No console errors
- [ ] Performance acceptable

### 3. Performance Tests

```bash
# Run Lighthouse audit
npx lighthouse https://yourgame.com \
  --output=html \
  --output-path=./audit.html

# Expected scores:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 95
# - SEO: > 90
```

### 4. Monitor Initial Traffic

- Watch error logs
- Monitor response times
- Track user sessions
- Check resource usage

---

## Rollback Plan

### Quick Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
```bash
netlify rollback
```

**Docker:**
```bash
docker-compose down
git checkout previous-version
docker-compose up -d
```

**AWS:**
```bash
# Revert to previous S3 version
aws s3 sync s3://backup-bucket s3://yourgame-client

# Rollback server
pm2 stop game-server
git checkout previous-tag
npm install
npm run build
pm2 restart game-server
```

---

## Monitoring & Maintenance

### Error Tracking
- **Sentry** - Error monitoring
- **LogRocket** - Session replay
- **Datadog** - Full-stack monitoring

### Performance Monitoring
- **Google Analytics** - User analytics
- **New Relic** - Application performance
- **Pingdom** - Uptime monitoring

### Log Management
```bash
# PM2 logs
pm2 logs game-server

# Docker logs
docker-compose logs -f

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy
```bash
# Daily database backup
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Weekly asset backup
aws s3 sync s3://yourgame-assets s3://yourgame-assets-backup

# Configuration backup
tar -czf config-$(date +%Y%m%d).tar.gz .env nginx.conf
```

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer (AWS ELB, Nginx)
- Multiple server instances
- Redis for session storage
- Database replication

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layer
- Use CDN for assets

### Auto-scaling
```yaml
# AWS Auto Scaling configuration
Min instances: 2
Max instances: 10
Target CPU: 70%
Scale up: Add 2 instances
Scale down: Remove 1 instance
```

---

## Security Hardening

### Server Security
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Install fail2ban
sudo apt-get install fail2ban

# SSL certificate (Let's Encrypt)
sudo certbot --nginx -d yourgame.com -d api.yourgame.com
```

### Application Security
- Rate limiting
- Input sanitization
- CSRF protection
- SQL injection prevention
- XSS prevention

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor performance
- Review user feedback

### Weekly
- Run full test suite
- Review analytics
- Update dependencies

### Monthly
- Security audit
- Performance optimization
- Backup verification
- Capacity planning

---

## Emergency Contacts

- **Developer**: your-email@example.com
- **DevOps**: devops@example.com
- **On-call**: +1-xxx-xxx-xxxx

---

## Additional Resources

- **Status Page**: https://status.yourgame.com
- **Documentation**: https://docs.yourgame.com
- **Support**: https://support.yourgame.com
- **API Docs**: https://api.yourgame.com/docs

---

**Last Updated:** 2025-11-01
