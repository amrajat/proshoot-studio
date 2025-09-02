# 🚀 Zero-Downtime Migration Guide: Supabase Custom Domain + Studio Subdomain

## 📋 **Migration Overview**
- **Current**: `your-project-id.supabase.co` on `proshoot.co`
- **Target**: `secure.proshoot.co` (Supabase) + `studio.proshoot.co` (App)
- **Goal**: Zero downtime migration with enhanced security

## 🔧 **Phase 1: Supabase Custom Domain Setup**

### **1.1 DNS Configuration in Cloudflare**
```bash
# Add CNAME record
Type: CNAME
Name: secure
Target: your-project-id.supabase.co.
TTL: 300 (5 minutes for quick changes)
```

### **1.2 Domain Verification**
```bash
# Install latest Supabase CLI
npm install -g supabase@latest

# Login to your account
supabase login

# Create custom domain
supabase domains create --project-ref YOUR_PROJECT_ID --custom-hostname secure.proshoot.co
```

**Expected Output:**
```
Required outstanding validation records:
_acme-challenge.secure.proshoot.co. TXT -> ca3-F1HvR9i938OgVwpCFwi1jTsbhe1hvT0Ic3efPY3Q
```

### **1.3 Add TXT Record in Cloudflare**
```bash
Type: TXT
Name: _acme-challenge.secure
Content: [the token from CLI output]
TTL: 300
```

### **1.4 Verify Domain**
```bash
# Run verification (may take 5-30 minutes)
supabase domains reverify --project-ref YOUR_PROJECT_ID

# Check status
supabase domains get --project-ref YOUR_PROJECT_ID
```

## 🔐 **Phase 2: OAuth Provider Updates (CRITICAL - Do BEFORE Activation)**

### **2.1 Google OAuth Console**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate: APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. **ADD** these redirect URIs (keep existing ones):
   ```
   https://secure.proshoot.co/auth/v1/callback
   https://studio.proshoot.co/auth/v1/callback
   ```

### **2.2 LinkedIn Developer Portal**
1. Visit [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Select your app
3. Go to Auth tab
4. **ADD** these redirect URLs (keep existing ones):
   ```
   https://secure.proshoot.co/auth/v1/callback
   https://studio.proshoot.co/auth/v1/callback
   ```

## ⚡ **Phase 3: Activate Custom Domain**

```bash
# Activate the domain (point of no return for OAuth)
supabase domains activate --project-ref YOUR_PROJECT_ID
```

**⚠️ After this step:**
- OAuth flows will use `secure.proshoot.co`
- Old project URL still works for API calls
- No downtime for existing sessions

## 🌐 **Phase 4: App Migration to studio.proshoot.co**

### **4.1 Cloudflare DNS for Studio Subdomain**
```bash
# Add CNAME for studio subdomain
Type: CNAME
Name: studio
Target: your-vercel-deployment.vercel.app (or your hosting provider)
TTL: 300
```

### **4.2 Update Environment Variables**
```env
# Update these in your deployment platform
NEXT_PUBLIC_SUPABASE_URL=https://secure.proshoot.co
NEXT_PUBLIC_APP_URL=https://studio.proshoot.co
MARKETING_SITE_URL=https://proshoot.co
```

### **4.3 Deploy to Studio Subdomain**
```bash
# If using Vercel
vercel --prod --alias studio.proshoot.co

# Update your deployment platform's custom domain settings
# Point studio.proshoot.co to your deployment
```

## 🔄 **Phase 5: Gradual Traffic Migration**

### **5.1 Test New Domains**
1. Test authentication: `https://studio.proshoot.co/auth`
2. Test API calls to: `https://secure.proshoot.co`
3. Verify OAuth flows work with new domains

### **5.2 Update DNS Gradually**
```bash
# Option 1: Immediate switch (recommended)
# Update proshoot.co A/CNAME to point to marketing site
# Users accessing studio features get redirected to studio.proshoot.co

# Option 2: Gradual with redirect
# Keep old domain active with 301 redirects to studio.proshoot.co
```

## 🛡️ **Phase 6: Security Hardening**

### **6.1 Update CORS Settings**
In Supabase Dashboard > Settings > API:
```
Allowed origins:
https://studio.proshoot.co
https://proshoot.co
```

### **6.2 Remove Old OAuth URLs (After 24-48 hours)**
- Remove old redirect URLs from Google/LinkedIn
- Keep only new custom domain URLs

### **6.3 Update Webhook URLs**
Update any webhook endpoints to use new domain:
```
https://studio.proshoot.co/api/webhooks/...
```

## 📊 **Rollback Plan**

If issues occur:

### **Emergency Rollback**
```bash
# Deactivate custom domain
supabase domains delete --project-ref YOUR_PROJECT_ID

# Revert DNS changes
# Point studio.proshoot.co back to old setup
# Update environment variables back to old URLs
```

### **OAuth Rollback**
- Re-add old OAuth redirect URLs
- Test authentication flows

## ✅ **Post-Migration Checklist**

- [ ] Custom domain active and SSL working
- [ ] OAuth flows working on new domains
- [ ] API calls working with secure.proshoot.co
- [ ] Studio app accessible at studio.proshoot.co
- [ ] Marketing site at proshoot.co
- [ ] Webhooks receiving data correctly
- [ ] All environment variables updated
- [ ] Old OAuth URLs removed (after 48h)
- [ ] DNS TTL increased to normal values (3600s)

## 🚨 **Critical Timing**

1. **Setup Phase**: Can be done anytime (DNS + verification)
2. **OAuth Updates**: MUST be done BEFORE domain activation
3. **Domain Activation**: Point of no return for OAuth
4. **App Migration**: Can be done gradually after domain activation

## 📞 **Support Contacts**

- Supabase Support: [support@supabase.io](mailto:support@supabase.io)
- Cloudflare Support: Available in dashboard
- OAuth Provider Support: Available in respective developer consoles

---

**⚠️ IMPORTANT**: Test everything in a staging environment first if possible. The OAuth redirect change is the most critical step that could cause authentication issues if not done correctly.
