# Deployment Guide

## Overview

This guide covers deploying the Personal Portfoy application with OAuth2 authentication to various platforms.

## Prerequisites

- Production Supabase project
- OAuth2 providers configured (Google)
- Environment variables ready
- Domain name (for production OAuth2 redirects)

## Environment Variables

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Optional Variables

```env
NODE_ENV=production
```

## Platform-Specific Deployment

### Vercel

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Set environment to "Production"

4. **Configure OAuth2 redirect URLs**
   - Update Supabase OAuth2 redirect URLs:
     - `https://your-domain.vercel.app/api/auth/callback`
   - Update Google Cloud Console redirect URIs:
     - `https://your-domain.vercel.app/api/auth/callback`

5. **Deploy**
   - Vercel automatically deploys on push
   - Or click "Deploy" manually

### Netlify

1. **Build command**
   ```bash
   npm run build
   ```

2. **Publish directory**
   ```
   .next
   ```

3. **Environment variables**
   - Go to Site Settings → Environment Variables
   - Add all required variables

4. **Configure OAuth2 redirect URLs**
   - Same as Vercel steps

### AWS Amplify

1. **Connect repository**
   - Go to AWS Amplify Console
   - Connect your Git repository

2. **Build settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment variables**
   - Add in Amplify Console → App Settings → Environment Variables

### Railway

1. **Create new project**
   - Connect GitHub repository
   - Railway auto-detects Next.js

2. **Environment variables**
   - Add in Railway dashboard → Variables

3. **Deploy**
   - Railway automatically deploys

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js**
   ```javascript
   module.exports = {
     output: 'standalone',
   };
   ```

3. **Build and run**
   ```bash
   docker build -t personal-portfoy .
   docker run -p 3000:3000 --env-file .env.local personal-portfoy
   ```

## Post-Deployment Checklist

### 1. Verify Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `NEXT_PUBLIC_SITE_URL` matches production domain

### 2. Update OAuth2 Redirect URLs

**Supabase:**
- [ ] Add production callback URL: `https://your-domain.com/api/auth/callback`

**Google Cloud Console:**
- [ ] Add authorized redirect URI: `https://your-domain.com/api/auth/callback`

### 3. Test Authentication Flow

- [ ] Visit `/login`
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth2 flow
- [ ] Verify redirect to `/test`
- [ ] Verify user information displayed

### 4. Test Protected Routes

- [ ] Visit `/test` (should redirect to login if not authenticated)
- [ ] Visit `/profile` (should redirect to login if not authenticated)
- [ ] After login, verify access to protected routes

### 5. Test Token Refresh

- [ ] Wait for token to expire (or manually expire)
- [ ] Make request to protected route
- [ ] Verify token refreshes automatically
- [ ] Verify no interruption in user flow

### 6. Verify Security

- [ ] Cookies are httpOnly
- [ ] Cookies are secure (HTTPS only)
- [ ] No tokens in client-side code
- [ ] CSRF protection working

## Monitoring

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

### Logging

Monitor these events:
- Authentication failures
- Token refresh failures
- OAuth2 callback errors
- Middleware redirects

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Troubleshooting

### Issue: OAuth2 Redirect Not Working

**Symptoms:**
- Redirects to wrong URL
- OAuth2 callback fails

**Solutions:**
- Verify `NEXT_PUBLIC_SITE_URL` matches production domain
- Check OAuth2 redirect URLs in Supabase and Google Console
- Verify callback route handler is accessible

### Issue: Tokens Not Persisting

**Symptoms:**
- User logged out after page reload
- Tokens not found in cookies

**Solutions:**
- Verify cookie settings (httpOnly, secure, sameSite)
- Check domain and path settings
- Verify Supabase SSR cookie handling

### Issue: CORS Errors

**Symptoms:**
- CORS errors in browser console
- API requests failing

**Solutions:**
- Verify Supabase CORS settings
- Check API route CORS headers
- Verify domain whitelist

## Rollback Plan

1. **Keep previous deployment**
   - Vercel: Previous deployment available
   - Other platforms: Tag releases

2. **Database migrations**
   - Supabase migrations are versioned
   - Can rollback if needed

3. **Environment variables**
   - Keep backup of production variables
   - Can revert if issues occur

## Performance Optimization

### Build Optimization

- Enable Next.js production optimizations
- Use static generation where possible
- Optimize images and assets

### Runtime Optimization

- Enable edge caching
- Use CDN for static assets
- Monitor bundle size

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] Environment variables secured
- [ ] OAuth2 redirect URLs validated
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] CORS properly configured

## Support

For issues or questions:
- Check [documentation](./README.md)
- Review [architecture docs](./authentication/architecture.md)
- Open an issue on GitHub

