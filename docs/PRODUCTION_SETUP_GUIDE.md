# 🚀 Zero-Downtime Subdomain Migration Guide

## 📋 **Migration Strategy**

**Goal**: Deploy V2 app to `studio.proshoot.co` while keeping existing app running on main domain with same OAuth apps.

**Approach**: Backward-compatible configuration → Gradual traffic migration → Clean shutdown

---

## 🔧 **1. Update Existing OAuth Apps (Zero Downtime)**

### **1.1 Add Subdomain to Existing Google OAuth**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate: **APIs & Services** → **Credentials**
3. **Edit your EXISTING OAuth 2.0 Client ID** (don't create new)
4. **ADD** these to existing configuration (keep all existing URLs):

**Authorized JavaScript origins** (ADD to existing):

```text
https://studio.proshoot.co
```

**Authorized redirect URIs** (ADD to existing):

```text
https://your-project-id.supabase.co/auth/v1/callback
https://studio.proshoot.co/auth/callback
```

1. **Save** - Your main app continues working, subdomain now supported

### **1.2 Add Subdomain to Existing LinkedIn OAuth**

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Select your **EXISTING** app (don't create new)
3. Go to **Auth** tab
4. **ADD** these to existing redirect URLs (keep all existing):

```text
https://your-project-id.supabase.co/auth/v1/callback
https://studio.proshoot.co/auth/callback
```

1. **Save** - Your main app continues working, subdomain now supported

---

## 🗄️ **2. Supabase Configuration (Use Existing Project)**

### **2.1 Update Existing Google Provider**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate: **Authentication** → **Providers**
3. **Edit your EXISTING Google provider** (already configured)
4. **No changes needed** - same Client ID/Secret works for both domains

### **2.2 Update CORS Settings for Subdomain**

1. In Supabase Dashboard → **Settings** → **API**
2. **ADD** to existing allowed origins (keep existing):

```text
https://studio.proshoot.co
```

---

## 🛡️ **3. Cloudflare Turnstile Setup (If Not Already Done)**

### **3.1 Update Existing Turnstile Site**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile**
3. **Edit your EXISTING site** (don't create new)
4. **ADD** domain: `studio.proshoot.co` to existing configuration

### **3.2 Get Keys (Use Existing)**

1. Copy your existing keys:
   - **Site Key** (public) - same as current
   - **Secret Key** (private) - same as current

---

## 🌐 **4. Supabase Custom Domain Migration (Zero Downtime)**

### **4.1 Setup Custom Domain (Parallel to Existing)**

1. Install Supabase CLI: `npm install -g supabase@latest`
2. Login: `supabase login`
3. Create custom domain (doesn't affect existing):

```bash
supabase domains create --project-ref YOUR_PROJECT_ID --custom-hostname secure.proshoot.co
```

### **4.2 DNS Configuration in Cloudflare**

1. Add CNAME record for Supabase:

```text
Type: CNAME
Name: secure
Target: your-project-id.supabase.co.
TTL: 300
```

2. Add TXT record (from CLI output):

```text
Type: TXT
Name: _acme-challenge.secure
Content: [token from CLI output]
TTL: 300
```

3. Add CNAME for studio subdomain:

```text
Type: CNAME
Name: studio
Target: your-vercel-deployment.vercel.app
TTL: 300
```

### **4.3 Verify and Activate Domain**

1. Verify domain (may take 5-30 minutes):

```bash
supabase domains reverify --project-ref YOUR_PROJECT_ID
```

2. Check status:

```bash
supabase domains get --project-ref YOUR_PROJECT_ID
```

3. **CRITICAL**: Update OAuth redirects BEFORE activation:
   - Add `https://secure.proshoot.co/auth/v1/callback` to Google/LinkedIn
   - Keep existing URLs for backward compatibility

4. Activate domain (point of no return):

```bash
supabase domains activate --project-ref YOUR_PROJECT_ID
```

**⚠️ After activation**: OAuth flows use `secure.proshoot.co`, but existing API calls still work

---

## 🔑 **5. Environment Variables Setup**

### **5.1 Production Environment Variables**

Add these to your deployment platform (Vercel/Netlify):

```env
# Google OAuth (use EXISTING credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_existing_google_client_id
GOOGLE_CLIENT_SECRET=your_existing_google_client_secret

# Turnstile (use EXISTING keys)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_existing_turnstile_site_key
TURNSTILE_SECRET_KEY=your_existing_turnstile_secret_key

# Supabase (use NEW custom domain after Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://secure.proshoot.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_supabase_anon_key

# Application URLs (NEW subdomain)
NEXT_PUBLIC_APP_URL=https://studio.proshoot.co
NEXT_PUBLIC_MARKETING_SITE_URL=https://proshoot.co
```

### **5.2 Deploy to Subdomain**

1. **Deploy V2 app to subdomain**:
   - Create new deployment/project for subdomain
   - Use environment variables above
   - Deploy to `studio.proshoot.co`

2. **Keep main domain running**:
   - Don't touch existing deployment
   - Both apps run simultaneously

---

## 🔄 **6. Phased Migration Strategy**

### **6.1 Phase 1: Setup Custom Domain (Day 1)**

1. **Complete Steps 1-4** above
2. **Deploy V2 app** to `studio.proshoot.co` with `secure.proshoot.co` API
3. **Keep main app running** with old `your-project-id.supabase.co`
4. **Test thoroughly**:
   - Authentication flows on subdomain
   - API calls to custom domain
   - Feature parity verification

### **6.2 Phase 2: Migrate Main App to Custom Domain (Day 2-3)**

1. **Update main app environment variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://secure.proshoot.co
   ```

2. **Deploy main app** with new Supabase URL
3. **Both apps now use** `secure.proshoot.co`
4. **Monitor for issues** - rollback if needed

### **6.3 Phase 3: Traffic Migration (Week 1-4)**

1. **Week 1**: Parallel testing and soft launch
2. **Week 2-3**: Redirect banners and new user routing
3. **Week 4**: Full traffic redirect to subdomain
4. **Week 5**: Cleanup and shutdown main domain

### **6.4 Phase 4: OAuth Cleanup (After Week 5)**

1. **Remove old OAuth redirect URLs**:
   - Remove `your-project-id.supabase.co/auth/v1/callback`
   - Keep only `secure.proshoot.co/auth/v1/callback`

2. **Update DNS** to point main domain to marketing site

---

## ✅ **7. Testing Checklist**

### **7.1 Test Authentication**

- [ ] Visit `https://studio.proshoot.co`
- [ ] Test Google One Tap appears
- [ ] Test Google OAuth login
- [ ] Test email/OTP login
- [ ] Test CAPTCHA functionality

### **7.2 Test Security Features**

- [ ] Test rate limiting (attempt login 6+ times)
- [ ] Test CAPTCHA reset on errors
- [ ] Verify secure storage is working
- [ ] Check error handling doesn't expose sensitive info

### **7.3 Monitor Logs**

- [ ] Check Supabase Dashboard → **Authentication** → **Users**
- [ ] Verify new users are created properly
- [ ] Monitor authentication logs for errors

---

## 🚨 **Critical Notes**

1. **OAuth Setup**: Must be done BEFORE activating custom domains
2. **Environment Variables**: Double-check all keys are correct
3. **DNS Propagation**: May take 5-30 minutes for changes to take effect
4. **Testing**: Test everything in staging first if possible

---

## 📞 **Support Contacts**

- **Google Cloud**: [Google Cloud Console Support](https://console.cloud.google.com/)
- **Supabase**: [support@supabase.io](mailto:support@supabase.io)
- **Cloudflare**: Available in dashboard
- **Vercel/Netlify**: Available in respective dashboards

---

## 🎯 **What's Already Implemented**

✅ **Google One Tap Component** - Enterprise security with rate limiting
✅ **Login Form** - Dual CAPTCHA protection and secure storage
✅ **Turnstile Verification API** - Server-side token validation
✅ **Auth Callback Handler** - Secure redirect validation
✅ **Error Handling** - Comprehensive logging and user feedback
✅ **Security Features** - Input validation, XSS protection, rate limiting

**Status**: Ready for production deployment after manual configuration steps above.
