# Environment Setup Guide

## How It Works

Your app now reads environment variables from `.env` files through `app.config.js` and `expo-constants`.

## Setup Steps

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your local IP:**
   ```
   API_BASE_URL=http://192.168.1.2:3000
   ```
   
   To find your IP:
   - Windows: Run `ipconfig` and look for IPv4 Address
   - Mac/Linux: Run `ifconfig` or `ip addr`

3. **Restart Expo:**
   ```bash
   npm start -- --clear
   ```
   
   **IMPORTANT:** You must restart Expo after changing `.env` files!

## Environment Files

- `.env` - Development (local testing)
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Template (commit this to git)

## Switching Environments

Change the `ENVIRONMENT` value in your `.env` file:
- `development` - Uses your local backend
- `staging` - Uses staging server
- `production` - Uses production API

## Troubleshooting

### Still not connecting?

1. **Restart Expo completely** - Environment variables are loaded at startup
2. **Check your IP** - Make sure `192.168.1.2` is your actual local IP
3. **Check backend** - Ensure your backend is running on port 3000
4. **Check firewall** - Allow connections on port 3000
5. **Same network** - Phone and computer must be on the same WiFi

### Quick test:
Open browser on your phone and visit: `http://192.168.1.2:3000/api/health`
If this doesn't work, it's a network issue, not an app issue.
