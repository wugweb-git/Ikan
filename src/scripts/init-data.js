#!/usr/bin/env node

/**
 * Initialize sample data for iKan Mental Health PWA
 * This script reads Supabase credentials from environment variables
 * Usage: node scripts/init-data.js
 */

const https = require('https');

// Read from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;

if ((!SUPABASE_PROJECT_ID && !SUPABASE_URL) || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set SUPABASE_URL (or SUPABASE_PROJECT_ID) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

let baseUrl = SUPABASE_URL;
if (!baseUrl && SUPABASE_PROJECT_ID) {
  baseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
}

// Remove trailing slash if present
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

const url = `${baseUrl}/functions/v1/make-server-cc205da9/init/sample-data`;

console.log('🚀 Initializing sample data...');
console.log(`📡 Target: ${url}`);

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Sample data initialized successfully!');
      try {
        const result = JSON.parse(data);
        console.log('📊 Response:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('📊 Response:', data);
      }
      process.exit(0);
    } else {
      console.error(`❌ Error: Server returned status ${res.statusCode}`);
      console.error('📊 Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error initializing data:', error.message);
  console.error('💡 Make sure your Supabase project is running and credentials are correct');
  process.exit(1);
});

req.end();
