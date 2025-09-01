# Development Setup Guide

## IP Address Configuration

When developing with Expo Go, you need to ensure your mobile device can reach your development machine's backend server.

### Quick Fix for IP Issues

1. **Check your current IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Update the IP in `src/config/dev-config.ts`:**
   ```typescript
   export const DEV_CONFIG = {
     LOCAL_IP: "YOUR_CURRENT_IP_HERE", // Update this line
     // ... rest of config
   };
   ```

3. **Restart your Expo development server:**
   ```bash
   npm start
   # or
   expo start
   ```

### Common Development Scenarios

#### 1. **Expo Go on Physical Device (Most Common)**
- Use your computer's local network IP (e.g., `192.168.11.131`)
- Both devices must be on the same WiFi network
- Update `LOCAL_IP` in `dev-config.ts`

#### 2. **iOS Simulator**
- Use `localhost` since simulator runs on same machine
- Update `dev-config.ts` to use `ALTERNATIVES.LOCALHOST`

#### 3. **Android Emulator**
- Use `10.0.2.2` (special IP for Android emulator)
- Update `dev-config.ts` to use `ALTERNATIVES.ANDROID_EMULATOR`

#### 4. **Different Network**
- If your phone is on mobile data, you'll need to use your computer's public IP
- Or set up port forwarding on your router

### Troubleshooting

#### "IP address different than current" Error
This usually means:
1. Your computer's IP address changed (common with DHCP)
2. You're on a different network
3. The backend server isn't running

#### "Connection refused" Error
1. Make sure your backend server is running on port 3000
2. Check if your firewall is blocking the connection
3. Verify the port number in `dev-config.ts`

#### "Network request failed" Error
1. Check if both devices are on the same network
2. Try using `localhost` if testing on simulator
3. Verify the IP address is correct

### Best Practices

1. **Use the dev-config file** instead of hardcoding IPs in environment.ts
2. **Check your IP regularly** - it can change when you reconnect to WiFi
3. **Use environment variables** for production builds
4. **Test on different devices** to ensure compatibility

### Alternative Solutions

#### Option 1: Use ngrok (Tunneling)
```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to your local server
ngrok http 3000

# Use the ngrok URL in your dev-config.ts
```

#### Option 2: Use your computer's hostname
```typescript
// In dev-config.ts
HOSTNAME: "your-computer-name.local"
```

#### Option 3: Use environment variables
```bash
# Create .env.local file
REACT_NATIVE_API_URL=http://192.168.11.131:3000
```

### Quick Commands

```bash
# Start development server
npm start

# Start with clear cache
npm run clear

# Check current IP (Windows)
ipconfig | findstr "IPv4"

# Check current IP (Mac/Linux)
ifconfig | grep "inet "
```


