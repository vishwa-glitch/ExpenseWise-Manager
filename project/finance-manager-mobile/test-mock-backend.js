/**
 * Mock Backend Server for Testing App Update Integration
 * This simulates your backend API responses for testing the frontend integration
 */

const http = require('http');
const url = require('url');

// Mock data that matches your backend implementation
const mockVersionData = {
  android: {
    latestVersion: '1.0.1',
    forceUpdate: true,
    releaseNotes: 'Critical security update and bug fixes',
    updateUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.vishwa567.fintech'
    }
  },
  ios: {
    latestVersion: '1.0.1',
    forceUpdate: false,
    releaseNotes: 'Performance improvements and new features',
    updateUrl: {
      ios: 'https://apps.apple.com/app/your-app-id'
    }
  }
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`📡 ${req.method} ${path}`, query);

  // App version endpoint
  if (path === '/api/app/version') {
    const platform = query.platform || 'android';
    const currentVersion = query.current_version || '1.0.0';
    
    const versionInfo = mockVersionData[platform] || mockVersionData.android;
    const needsUpdate = compareVersions(currentVersion, versionInfo.latestVersion) < 0;
    
    const response = {
      success: true,
      data: {
        currentVersion,
        latestVersion: versionInfo.latestVersion,
        needsUpdate,
        forceUpdate: needsUpdate && versionInfo.forceUpdate,
        releaseNotes: versionInfo.releaseNotes,
        updateUrl: versionInfo.updateUrl,
        platform,
        responseType: needsUpdate ? (versionInfo.forceUpdate ? 'force_update' : 'update_available') : 'up_to_date'
      },
      timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Version statistics endpoint
  if (path === '/api/app/version/stats') {
    const response = {
      success: true,
      data: {
        totalChecks: 1250,
        platforms: {
          android: 800,
          ios: 450
        },
        updateTypes: {
          up_to_date: 1000,
          update_available: 200,
          force_update: 50
        },
        lastUpdated: new Date().toISOString()
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Health check
  if (path === '/health') {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Simple version comparison function
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

const PORT = 3001;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  console.log('🚀 Mock Backend Server Started!');
  console.log(`📡 Server running at http://${HOST}:${PORT}`);
  console.log('📱 Available endpoints:');
  console.log(`   GET /api/app/version?platform=android&current_version=1.0.0`);
  console.log(`   GET /api/app/version/stats`);
  console.log(`   GET /health`);
  console.log('');
  console.log('🧪 Test the API:');
  console.log(`   curl "http://${HOST}:${PORT}/api/app/version?platform=android&current_version=1.0.0"`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
