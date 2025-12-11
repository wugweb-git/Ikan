#!/usr/bin/env node

/**
 * Health check for iKan Mental Health PWA backend
 * This script reads Supabase credentials from environment variables
 * Usage: node scripts/health-check.js
 */

const https = require('https');

// Read from environment variables
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_PROJECT_ID || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-cc205da9/health`;

console.log('🏥 Running health check...');
console.log(`📡 Target: ${url}`);

const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
};

const req = https.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed!');
      try {
        const result = JSON.parse(data);
        console.log('📊 Server status:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('📊 Response:', data);
      }
      process.exit(0);
    } else {
      console.error(`❌ Health check failed: Server returned status ${res.statusCode}`);
      console.error('📊 Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Health check failed:', error.message);
  console.error('💡 Make sure your Supabase project is running and accessible');
  process.exit(1);
});

req.end();
