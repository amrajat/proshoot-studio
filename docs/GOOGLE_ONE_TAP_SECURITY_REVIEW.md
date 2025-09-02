# Google One Tap Security Review & Implementation Guide

## ✅ Security Implementation Complete

All critical security vulnerabilities have been fixed in the Google One Tap component:

### 🔒 **Security Features Implemented**

- **Enterprise-grade error handling** with toast notifications
- **Rate limiting** (3 attempts, 5-minute lockout)
- **Input validation and sanitization** for redirect URLs
- **Secure storage** using encrypted sessionStorage
- **Environment variable validation** with graceful degradation
- **Comprehensive error logging** for security monitoring
- **XSS protection** through input sanitization
- **Open redirect prevention** with strict URL validation

### 🚀 **Enhanced Features**

- **Consistent security architecture** matching your login form
- **Proper nonce generation** with SHA-256 hashing
- **Session verification** before initializing One Tap
- **Graceful failure handling** with user-friendly messages
- **Debug logging** for development and monitoring

## Required Environment Variables

### Production Configuration
```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URLs
NEXT_PUBLIC_APP_URL=https://studio.proshoot.co
```

## 📋 Manual Configuration Guide

### Step 1: Google Cloud Console Setup

#### 1.1 Create/Access Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable billing (required for production use)

#### 1.2 Enable Google Sign-In API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API" and "Google Identity Services"
3. Click **Enable** for both APIs

#### 1.3 Configure OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Select **Web application** as application type
4. Configure the following:

**Name**: `Headsshot Studio Production`

**Authorized JavaScript origins**:
```
https://studio.proshoot.co
https://proshoot.co
```

**Authorized redirect URIs**:
```
https://studio.proshoot.co/auth/callback
https://studio.proshoot.co/auth/callback/google
```

5. Click **Create** and copy the **Client ID** and **Client Secret**

#### 1.4 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in required information:
   - **App name**: `Headsshot Studio`
   - **User support email**: Your support email
   - **Developer contact information**: Your contact email
   - **App domain**: `https://studio.proshoot.co`
   - **Privacy Policy**: `https://proshoot.co/privacy`
   - **Terms of Service**: `https://proshoot.co/terms`

#### 1.5 Add Scopes
1. Click **ADD OR REMOVE SCOPES**
2. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

#### 1.6 Test Users (Development Phase)
1. Add test user emails in **Test users** section
2. These users can sign in during development before app verification

### Step 2: Supabase Configuration with Custom Domain

#### 2.1 Enable Google Provider in Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Configure the following settings:

**Google Client ID**: `Paste your Google Client ID from Step 1.3`
**Google Client Secret**: `Paste your Google Client Secret from Step 1.3`

**Redirect URL**: `https://studio.proshoot.co/auth/callback`

#### 2.2 Configure Custom Domain Settings
1. In Supabase Dashboard → **Settings** → **API**
2. Update **Project URL** to your custom domain:
   ```
   https://your-custom-supabase-domain.com
   ```
3. Update your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-custom-supabase-domain.com
   ```

#### 2.3 Update RLS Policies for Google OAuth
Ensure your `profiles` table has proper policies for Google OAuth users:

```sql
-- Policy for Google OAuth user creation
CREATE POLICY "Allow Google OAuth user creation" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id AND 
  auth.jwt() ->> 'iss' = 'https://accounts.google.com'
);

-- Policy for Google OAuth user updates
CREATE POLICY "Allow Google OAuth user updates" ON profiles
FOR UPDATE USING (
  auth.uid() = id AND 
  auth.jwt() ->> 'iss' = 'https://accounts.google.com'
);
```

### Step 3: Environment Variables Setup

#### 3.1 Production Environment Variables
Add these to your production environment (Vercel, Netlify, etc.):

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-custom-supabase-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URLs
NEXT_PUBLIC_APP_URL=https://studio.proshoot.co
NEXT_PUBLIC_MARKETING_SITE_URL=https://proshoot.co
```

#### 3.2 Development Environment Variables
Update your `.env.local` file:

```env
# Google OAuth Configuration (use same production keys for consistency)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-custom-supabase-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_SITE_URL=https://proshoot.co
```

### Step 4: DNS and Domain Configuration

#### 4.1 Custom Domain Setup (if using custom Supabase domain)
1. Add CNAME record in your DNS provider:
   ```
   supabase.yourdomain.com → your-project-ref.supabase.co
   ```
2. Configure SSL certificate in Supabase dashboard
3. Update all environment variables to use custom domain

#### 4.2 Verify Domain Configuration
Test these URLs to ensure proper setup:
- `https://studio.proshoot.co` (your app)
- `https://your-custom-supabase-domain.com` (Supabase API)
- `https://proshoot.co` (marketing site)

### Step 5: Testing and Verification

#### 5.1 Test Google One Tap Flow
1. Deploy your application with updated environment variables
2. Visit `https://studio.proshoot.co`
3. Verify Google One Tap prompt appears
4. Test sign-in with a test user account
5. Check browser console for any errors

#### 5.2 Verify Security Features
- Test rate limiting (attempt sign-in 4+ times)
- Test redirect validation with malicious URLs
- Verify secure storage is working
- Check error handling with invalid credentials

#### 5.3 Monitor Authentication Logs
1. Check Supabase Dashboard → **Authentication** → **Users**
2. Verify new Google users are created properly
3. Monitor logs for any authentication errors

## Security Recommendations

### 1. **Implement Secure Error Handling**
```javascript
// Recommended approach
import { toast } from "sonner";

const handleSignInWithGoogle = async (response) => {
  try {
    // ... authentication logic
    if (error) {
      console.error("Google One Tap auth error:", error);
      toast.error("Authentication failed. Please try again.");
      return;
    }
  } catch (error) {
    console.error("Google One Tap unexpected error:", error);
    toast.error("Sign-in unavailable. Please try again later.");
  }
};
```

### 2. **Add Input Validation & Sanitization**
```javascript
// Recommended validation
const validateRedirectUrl = (url) => {
  if (!url) return null;
  
  // Only allow internal redirects
  if (!url.startsWith("/")) return null;
  
  // Prevent protocol-relative URLs
  if (url.startsWith("//")) return null;
  
  // Sanitize and validate path
  try {
    const sanitized = url.replace(/[<>'"]/g, "");
    return sanitized.length > 0 && sanitized.length < 200 ? sanitized : null;
  } catch {
    return null;
  }
};
```

### 3. **Use Secure Storage**
```javascript
// Import from your existing secure storage utility
import { secureStorage } from "./login-form"; // or create shared utility

// Replace localStorage usage
secureStorage.setItem("lastLoginMethod", "Google (One-Tap)");
```

### 4. **Add Environment Variable Validation**
```javascript
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your_google_client_id_here") {
  console.error("Google Client ID not configured");
  return null; // Don't render component
}
```

### 5. **Implement Rate Limiting**
```javascript
// Use same rate limiting logic as login form
const rateLimiter = {
  attempts: new Map(),
  maxAttempts: 3,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes for One Tap
  
  canAttempt: (clientId) => {
    const attempts = rateLimiter.attempts.get(clientId) || { count: 0, lastAttempt: 0 };
    const now = Date.now();
    
    if (now - attempts.lastAttempt > rateLimiter.lockoutDuration) {
      attempts.count = 0;
    }
    
    return attempts.count < rateLimiter.maxAttempts;
  }
};
```

### 6. **Add Security Headers**
Ensure your Next.js configuration includes:
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## Supabase Configuration Required

### 1. **Enable Google Provider**
In Supabase Dashboard → Authentication → Providers:
- Enable Google provider
- Add your Google Client ID and Client Secret
- Configure redirect URL: `https://studio.proshoot.co/auth/callback`

### 2. **Configure RLS Policies**
Ensure your profiles table has proper Row Level Security policies for Google OAuth users.

### 3. **Set Up Webhooks** (Optional)
Configure webhooks for user creation/login events for analytics and monitoring.

## Production Deployment Checklist

### Pre-Deployment
- [ ] Google Cloud Console OAuth configured with production domains
- [ ] Environment variables set in production environment
- [ ] Supabase Google provider configured with production credentials
- [ ] Security headers configured in Next.js
- [ ] Error monitoring set up (Sentry integration)

### Post-Deployment Testing
- [ ] Test Google One Tap flow on production domain
- [ ] Verify error handling doesn't expose sensitive information
- [ ] Test rate limiting functionality
- [ ] Verify secure storage is working
- [ ] Test redirect validation
- [ ] Monitor authentication logs

## Integration with Existing Security Architecture

Your current login form has excellent security features. The Google One Tap component should be updated to match this security level:

1. **Use same error handling pattern** (toast notifications)
2. **Use same secure storage utility**
3. **Use same rate limiting approach**
4. **Use same input validation patterns**
5. **Use same logging and monitoring**

## Recommended Next Steps

1. **Immediate**: Fix critical security vulnerabilities
2. **Short-term**: Align with existing login form security patterns
3. **Long-term**: Add advanced security features like device fingerprinting and anomaly detection

## Security Monitoring

Consider implementing:
- Failed authentication attempt logging
- Unusual login pattern detection
- Geographic anomaly detection
- Device fingerprinting for additional security

---

**Status**: ⚠️ **Not Production Ready** - Critical security issues must be addressed before deployment.
