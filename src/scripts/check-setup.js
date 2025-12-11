#!/usr/bin/env node

/**
 * iKan Setup Checker
 * Verifies that the development environment is properly configured
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const API_BASE_URL = 'https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZnZvZXZ4ZWdua254b3Ftd3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjIyNDIsImV4cCI6MjA3MzY5ODI0Mn0.VGYSE8LqBEggrQcUHJH9NcvursaoNfQK9K8-ESCo-rc';

console.log('🧠 iKan Setup Checker\n');

async function checkCommand(command, name) {
  try {
    await execAsync(`which ${command}`);
    console.log(`✅ ${name} is installed`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} is not installed`);
    return false;
  }
}

async function checkNodeModules() {
  try {
    await execAsync('test -d node_modules');
    console.log('✅ Dependencies are installed');
    return true;
  } catch (error) {
    console.log('❌ Dependencies not installed - run: npm install');
    return false;
  }
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Backend server is deployed and healthy');
      return true;
    } else {
      console.log('❌ Backend server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not deployed yet');
    console.log('   Run: npm run setup:backend');
    return false;
  }
}

async function main() {
  console.log('🔍 Checking development environment...\n');
  
  const checks = [
    ['node', 'Node.js'],
    ['npm', 'npm'],
    ['supabase', 'Supabase CLI (optional)']
  ];
  
  let allGood = true;
  
  // Check required tools
  for (const [command, name] of checks) {
    const result = await checkCommand(command, name);
    if (command !== 'supabase') {
      allGood = allGood && result;
    }
  }
  
  console.log();
  
  // Check dependencies
  const depsOk = await checkNodeModules();
  allGood = allGood && depsOk;
  
  console.log();
  
  // Check server (optional)
  const serverOk = await checkServerHealth();
  
  console.log('\n📋 Summary:');
  
  if (allGood) {
    console.log('✅ Frontend development environment is ready!');
    console.log('   Run: npm run dev');
    
    if (serverOk) {
      console.log('✅ Backend server is deployed and working!');
      console.log('   Full-stack development ready 🚀');
    } else {
      console.log('📦 Backend server not deployed (this is fine for frontend development)');
      console.log('   App works with offline sample data');
      console.log('   To deploy backend: npm run setup:backend');
    }
  } else {
    console.log('❌ Some issues need to be resolved before development');
    if (!depsOk) {
      console.log('   First run: npm install');
    }
  }
  
  console.log('\n🔗 Useful commands:');
  console.log('   npm run dev              - Start frontend development server');
  console.log('   npm run setup:backend    - Deploy backend server');
  console.log('   npm run health:check     - Check backend server status');
  console.log('   npm run build            - Build for production');
  
  process.exit(allGood ? 0 : 1);
}

main().catch(console.error);