# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### Issue: OAuth2 Redirect Not Working

**Symptoms:**
- Clicking "Sign in with Google" doesn't redirect
- Redirects to wrong URL
- OAuth2 callback fails

**Solutions:**
1. Verify `NEXT_PUBLIC_SITE_URL` in `.env.local`:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. Check Supabase OAuth2 redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `http://localhost:3000/api/auth/callback`

3. Check Google Cloud Console:
   - Go to APIs & Services → Credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback`

#### Issue: "Failed to sign in with google"

**Symptoms:**
- Error message after clicking Google sign-in
- OAuth2 flow fails

**Solutions:**
1. Verify Google OAuth2 credentials in Supabase:
   - Go to Supabase Dashboard → Authentication → Providers
   - Check Google provider is enabled
   - Verify Client ID and Client Secret

2. Check Google Cloud Console:
   - Verify OAuth2 consent screen is configured
   - Check API is enabled (Google+ API)
   - Verify redirect URIs match

#### Issue: User Not Authenticated After Login

**Symptoms:**
- Login succeeds but user appears logged out
- Redirects to login after successful authentication

**Solutions:**
1. Check middleware configuration:
   - Verify protected routes are defined
   - Check redirect logic

2. Verify cookies are set:
   - Check browser DevTools → Application → Cookies
   - Look for `sb-` prefixed cookies

3. Check Supabase session:
   - Verify session is created in Supabase Dashboard
   - Check user exists in Authentication → Users

### Token Issues

#### Issue: Tokens Not Refreshing

**Symptoms:**
- User logged out after token expiration
- 401 errors after some time

**Solutions:**
1. Check middleware token refresh:
   - Verify proactive refresh logic
   - Check token expiration threshold (5 minutes)

2. Verify refresh endpoint:
   - Test `/api/auth/refresh` endpoint
   - Check for errors in logs

3. Check refresh token:
   - Verify refresh token exists
   - Check refresh token expiration

#### Issue: "Token expired" Errors

**Symptoms:**
- Frequent token expiration errors
- User logged out unexpectedly

**Solutions:**
1. Increase refresh threshold:
   ```typescript
   const fiveMinutes = 10 * 60 * 1000; // 10 minutes
   ```

2. Check token expiration time:
   - Verify tokens have sufficient expiration time
   - Check Supabase token settings

### Route Protection Issues

#### Issue: Protected Routes Not Working

**Symptoms:**
- Unauthenticated users can access protected routes
- No redirect to login

**Solutions:**
1. Check middleware configuration:
   - Verify protected routes array
   - Check middleware matcher pattern

2. Verify authentication check:
   - Check `getUser()` returns user
   - Verify session exists

#### Issue: Infinite Redirect Loop

**Symptoms:**
- Page keeps redirecting
- Browser shows redirect loop error

**Solutions:**
1. Check middleware redirect logic:
   - Verify redirect conditions
   - Check for circular redirects

2. Verify route definitions:
   - Check public vs protected routes
   - Ensure login route is public

### Development Issues

#### Issue: "Cannot find module" Errors

**Symptoms:**
- Import errors
- Module not found errors

**Solutions:**
1. Check TypeScript paths:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. Verify file paths:
   - Check import paths are correct
   - Verify files exist

#### Issue: Build Errors

**Symptoms:**
- `npm run build` fails
- TypeScript errors

**Solutions:**
1. Check TypeScript errors:
   ```bash
   npm run build
   ```

2. Fix type errors:
   - Check error messages
   - Update types as needed

3. Verify dependencies:
   ```bash
   npm install
   ```

### Testing Issues

#### Issue: Tests Failing

**Symptoms:**
- Jest tests fail
- Mock errors

**Solutions:**
1. Clear Jest cache:
   ```bash
   npm test -- --clearCache
   ```

2. Check mocks:
   - Verify mocks are set up correctly
   - Check mock implementations

3. Update test dependencies:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   ```

## Getting Help

### Check Documentation

1. [README.md](../README.md) - Getting started
2. [Architecture](./authentication/architecture.md) - System architecture
3. [Token Refresh](./authentication/token-refresh.md) - Token management

### Debug Steps

1. **Check browser console** for client-side errors
2. **Check server logs** for server-side errors
3. **Check Supabase logs** in dashboard
4. **Verify environment variables** are set correctly
5. **Test endpoints** directly (curl, Postman)

### Common Debugging Commands

```bash
# Check environment variables
cat .env.local

# Run development server with verbose logging
npm run dev

# Run tests with verbose output
npm test -- --verbose

# Check build output
npm run build
```

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Check [Next.js Documentation](https://nextjs.org/docs)
4. Open a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Logs/output

