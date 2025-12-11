#!/usr/bin/env node

/**
 * Initialize sample data for iKan Mental Health PWA
 * This script reads Supabase credentials from environment variables
 * Usage: node scripts/init-data.js
 */

const https = require('https');

// Read from environment variables
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_PROJECT_ID || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY');
  console.error('   You can set them in a .env file or pass them directly:');
  console.error('   VITE_SUPABASE_PROJECT_ID=xxx VITE_SUPABASE_ANON_KEY=xxx node scripts/init-data.js');
  process.exit(1);
}

const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-cc205da9/init/sample-data`;

console.log('🚀 Initializing sample data...');
console.log(`📡 Target: ${url}`);

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
