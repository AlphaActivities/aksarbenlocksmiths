# Netlify Forms Diagnostic Guide

## Current Status
✅ Diagnostic logging added to `src/components/ContactSection.tsx`
✅ Build completed successfully
✅ Static registration form confirmed in `dist/index.html`

## What to Check on Deployed Site

### 1. Open Browser DevTools Console
Before submitting the form, open DevTools (F12) and go to the Console tab.

### 2. Submit the Contact Form
Fill out all fields and click submit. You should see these console logs:

```
[Contact] ENV { ENABLE: 'true', FAKE: undefined }
[Contact] Will POST body form-name=contact&name=...&email=...&phone=...&service=...&message=...
[Contact] Response 200 OK
[Contact] Response body <!DOCTYPE html>...
```

### 3. Check Network Tab
In DevTools Network tab, look for:
- **Request URL:** `https://aksarbenlocksmiths.com/` (or your domain)
- **Request Method:** `POST`
- **Status:** `200 OK` (or `404` if form not detected)
- **Request Headers:**
  - `Content-Type: application/x-www-form-urlencoded`
- **Form Data:**
  - `form-name: contact`
  - `name: [your input]`
  - `email: [your input]`
  - `phone: [your input]`
  - `service: [selected service]`
  - `message: [your message]`

### 4. Verify Built Form Attributes

**Static registration form in `dist/index.html`:** ✅ CONFIRMED
```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input type="hidden" name="form-name" value="contact" />
  <input type="text" name="name" />
  <input type="email" name="email" />
  <input type="tel" name="phone" />
  <input type="text" name="service" />
  <textarea name="message"></textarea>
  <input type="text" name="bot-field" />
</form>
```

**Dynamic form (rendered by React):**
- ✅ `name="contact"`
- ✅ `method="POST"`
- ✅ `data-netlify="true"`
- ✅ `data-netlify-honeypot="bot-field"`
- ✅ Hidden inputs: `form-name`, `bot-field`, `service`

### 5. Common Issues to Check

**If POST returns 404:**
- Netlify hasn't detected the form yet (needs a fresh deploy)
- Check Netlify Forms dashboard: Site Settings → Forms

**If POST returns 200 but no email:**
- Check Netlify Forms dashboard for submission
- Verify form notifications are enabled
- Check spam folder

**If ENABLE is 'false' or undefined:**
- `.env.production` not loaded or missing `VITE_ENABLE_FORM_SEND=true`
- Check Netlify environment variables UI

**If console shows errors:**
- Copy full error message
- Check if fetch is blocked by CORS (shouldn't happen with same-origin POST)

## Environment Variables

**Development (visual-only mode):**
```
VITE_ENABLE_FORM_SEND=false
```

**Production (real submissions):**
```
VITE_ENABLE_FORM_SEND=true
```

## Next Steps

1. Deploy this build to Netlify
2. Open deployed site in browser
3. Open DevTools Console and Network tabs
4. Submit test form
5. Collect all console output and network request details
6. Check Netlify Forms dashboard for submission

## Removing Diagnostic Logs

After collecting evidence, remove these temporary logs from `handleSubmit`:
- `console.log('[Contact] ENV', ...)`
- `console.log('[Contact] Will POST body', ...)`
- `console.log('[Contact] Response', ...)`
- `console.log('[Contact] Response body', ...)`

Keep the error log:
- `console.error('[Contact] POST failed', err)` ✅ Keep this one
