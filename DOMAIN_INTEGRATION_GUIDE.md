# Domain Integration Guide: Hostinger to Vercel

## Overview
This guide will help you properly integrate your Hostinger domain (flappypi.fun) with Vercel deployment and fix the Pi Network validation key issues.

## Current Issues
1. **Domain Integration**: Your domain is hosted on Hostinger but app is deployed on Vercel
2. **Validation Key**: Pi Network needs to verify your domain ownership
3. **White Screen**: Validation issues can cause loading problems in Pi Browser

## Step-by-Step Solution

### 1. Domain DNS Configuration (Hostinger)

#### A. Access Hostinger DNS Settings
1. Log into your Hostinger account
2. Go to "Domains" → "flappypi.fun"
3. Click "DNS" or "Manage DNS"

#### B. Configure DNS Records
Add these DNS records:

**A Record:**
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 300
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

**Additional A Records (if needed):**
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 300
```

### 2. Vercel Domain Configuration

#### A. Add Domain to Vercel
1. Go to your Vercel dashboard
2. Select your Flappy Pi project
3. Go to "Settings" → "Domains"
4. Add domain: `flappypi.fun`
5. Add subdomain: `www.flappypi.fun`

#### B. Verify Domain Ownership
1. Vercel will provide DNS records to verify
2. Add these records to Hostinger DNS
3. Wait for DNS propagation (up to 48 hours)

### 3. Pi Network Validation Key Setup

#### A. Validation Key Files
The following files are already created in your project:

1. `/public/validation-key.txt`
2. `/public/flappypi.fun-validation-key.txt`
3. `/public/.well-known/flappypi.fun-validation-key.txt`

All contain the validation key:
```
94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce
```

#### B. Verify Validation Key Accessibility
After deployment, verify these URLs are accessible:
- `https://flappypi.fun/validation-key.txt`
- `https://flappypi.fun/flappypi.fun-validation-key.txt`
- `https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt`

### 4. Vercel Configuration Updates

The `vercel.json` file has been updated with:
- Proper headers for validation key files
- CORS headers for Pi Network verification
- Redirects for validation key access
- Production environment settings

### 5. Pi Network App Configuration

#### A. Update Pi App Settings
1. Go to Pi Developer Portal
2. Select your Flappy Pi app
3. Update domain settings:
   - **Domain**: `flappypi.fun`
   - **Validation Key**: `94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce`

#### B. Verify Domain in Pi Network
1. Pi Network will automatically verify your domain
2. Check the verification status in Pi Developer Portal
3. Ensure all validation key URLs are accessible

### 6. Testing and Verification

#### A. Test Validation Key URLs
```bash
# Test these URLs in your browser or curl:
curl https://flappypi.fun/validation-key.txt
curl https://flappypi.fun/flappypi.fun-validation-key.txt
curl https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt
```

#### B. Test Pi Browser Integration
1. Open Pi Browser
2. Navigate to `https://flappypi.fun`
3. Verify the app loads without white screen
4. Check console for any validation errors

### 7. Troubleshooting

#### A. DNS Issues
If domain doesn't resolve:
1. Check DNS propagation: https://www.whatsmydns.net/
2. Verify DNS records in Hostinger
3. Wait up to 48 hours for full propagation

#### B. Validation Key Issues
If validation fails:
1. Verify all validation key files are accessible
2. Check file permissions on Vercel
3. Ensure no caching issues

#### C. White Screen Issues
If white screen persists:
1. Check browser console for errors
2. Verify Pi SDK initialization
3. Test with the provided test file: `test-pi-browser.html`

### 8. Deployment Checklist

- [ ] DNS records configured in Hostinger
- [ ] Domain added to Vercel
- [ ] Validation key files accessible
- [ ] Pi Network app settings updated
- [ ] Domain verified in Pi Network
- [ ] App loads in Pi Browser
- [ ] No white screen issues

### 9. Monitoring

#### A. Domain Health
Monitor these URLs:
- `https://flappypi.fun` (main app)
- `https://flappypi.fun/validation-key.txt` (validation)
- `https://flappypi.fun/test-pi-browser.html` (test page)

#### B. Pi Network Integration
- Check Pi Developer Portal for domain status
- Monitor app performance in Pi Browser
- Track user engagement metrics

## Quick Fix Commands

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

### Test Validation Key
```bash
curl -I https://flappypi.fun/validation-key.txt
```

### Check DNS Propagation
```bash
nslookup flappypi.fun
```

## Support

If issues persist:
1. Check Vercel deployment logs
2. Verify DNS configuration
3. Test validation key accessibility
4. Contact Pi Network support if needed

## Notes

- DNS changes can take up to 48 hours to propagate
- Pi Network validation is automatic once files are accessible
- The validation key is unique to your domain and app
- Keep the validation key secure and don't share it publicly 