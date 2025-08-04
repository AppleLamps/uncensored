# Supabase Edge Functions Setup Guide

This guide will help you set up secure Supabase Edge Functions to handle API keys safely on the backend, removing the need to store sensitive API keys in localStorage.

## Overview

The application has been updated to use Supabase Edge Functions for:
- **Chat Completion**: Secure OpenRouter API interactions
- **Image Generation**: Secure GETIMG API interactions

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
3. **Deno**: Required for Edge Functions (automatically installed with Supabase CLI)

## Installation Steps

### 1. Install Supabase CLI

**Windows (PowerShell):**
```powershell
iwr https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip -OutFile supabase.zip
Expand-Archive supabase.zip -DestinationPath .
Move-Item .\supabase.exe C:\Windows\System32\
```

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
npm install -g supabase
```

### 2. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `uncensored-ai-chat`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 3. Initialize Local Supabase

```bash
# Navigate to your project directory
cd /path/to/TESTING-GEM

# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

**Note**: Replace `YOUR_PROJECT_REF` with your actual project reference from the Supabase dashboard URL.

### 4. Set Environment Variables

Create a `.env` file in your Supabase functions directory:

```bash
# Create environment file for Edge Functions
echo "OPENROUTER_API_KEY=your_openrouter_api_key_here" > supabase/.env
echo "GETIMG_API_KEY=your_getimg_api_key_here" >> supabase/.env
```

**Important**: 
- Replace `your_openrouter_api_key_here` with your actual OpenRouter API key
- Replace `your_getimg_api_key_here` with your actual GETIMG API key
- Never commit the `.env` file to version control

### 5. Deploy Edge Functions

```bash
# Deploy the chat completion function
supabase functions deploy chat-completion

# Deploy the image generation function
supabase functions deploy generate-image
```

### 6. Set Production Environment Variables

In your Supabase dashboard:

1. Go to **Settings** → **Edge Functions**
2. Add environment variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `GETIMG_API_KEY`: Your GETIMG API key

### 7. Update Frontend Configuration

Update the `secure-api.js` file with your Supabase project details:

```javascript
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

You can find these values in your Supabase dashboard under **Settings** → **API**.

## Testing the Setup

### 1. Test Chat Completion

```bash
curl -X POST 'https://your-project-id.supabase.co/functions/v1/chat-completion' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": false
  }'
```

### 2. Test Image Generation

```bash
curl -X POST 'https://your-project-id.supabase.co/functions/v1/generate-image' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "width": 1024,
    "height": 1024
  }'
```

## Security Benefits

✅ **API Keys Protected**: API keys are stored securely on the server, never exposed to the browser

✅ **XSS Protection**: Even if your frontend is compromised, API keys remain safe

✅ **Centralized Management**: All API keys managed in one secure location

✅ **Rate Limiting**: Supabase provides built-in rate limiting for Edge Functions

✅ **Monitoring**: Full request logging and monitoring through Supabase dashboard

## Troubleshooting

### Common Issues

1. **"API key not configured" error**:
   - Ensure environment variables are set correctly in Supabase dashboard
   - Redeploy functions after setting environment variables

2. **CORS errors**:
   - Ensure your domain is added to allowed origins in Supabase settings
   - Check that CORS headers are properly configured in the functions

3. **Function deployment fails**:
   - Ensure Supabase CLI is properly installed and authenticated
   - Check that you're in the correct project directory
   - Verify your project reference is correct

### Logs and Debugging

View function logs in real-time:

```bash
# View logs for chat completion function
supabase functions logs chat-completion

# View logs for image generation function
supabase functions logs generate-image
```

## Local Development

For local development, you can run Supabase locally:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve
```

This will start:
- Local Supabase API on `http://localhost:54321`
- Edge Functions on `http://localhost:54321/functions/v1/`

## Production Deployment

When deploying to production:

1. Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your frontend code
2. Ensure all environment variables are set in production
3. Test all functions thoroughly
4. Monitor function performance and logs

## Support

If you encounter issues:

1. Check the [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions)
2. Review function logs in the Supabase dashboard
3. Ensure all API keys are valid and have proper permissions

---

**Security Note**: The old localStorage API key storage has been completely removed and replaced with secure server-side handling. Your API keys are now safe from client-side attacks.