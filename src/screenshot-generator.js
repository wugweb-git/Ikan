/**
 * PWA Screenshot Generator
 * 
 * This script automatically generates screenshots for the iKan PWA
 * for app store submissions and enhanced install prompts.
 * 
 * Requirements:
 * - npm install playwright
 * - App running on http://localhost:5173
 * 
 * Usage:
 * node screenshot-generator.js
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'public', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  console.log('✅ Created screenshots directory');
}

// Screenshot configurations
const MOBILE_SCREENS = [
  { 
    url: '/', 
    name: 'home',
    label: 'iKan Homepage - Your partner in mental wellness',
    waitFor: 2000,
    description: 'Shows the hero section with iKan branding and call-to-action'
  },
  { 
    url: '/dashboard', 
    name: 'dashboard',
    label: 'Dashboard - Track your mental health journey',
    waitFor: 3000,
    description: 'Main dashboard with mood tracking, assessments, and programs',
    requiresAuth: true
  },
  { 
    url: '/mood-journal', 
    name: 'mood-journal',
    label: 'Mood Journal - Log your daily emotions',
    waitFor: 2500,
    description: 'Mood tracking interface with emotion selection',
    requiresAuth: true
  },
  { 
    url: '/assessment', 
    name: 'assessments',
    label: 'Mental Health Assessments - Anxiety, Depression, Stress',
    waitFor: 2500,
    description: 'Assessment cards showing various mental health tools',
    requiresAuth: true
  },
  { 
    url: '/equip', 
    name: 'equip-programs',
    label: 'Equip Programs - Structured mental health programs',
    waitFor: 2500,
    description: 'Program cards with progress indicators',
    requiresAuth: true
  },
  { 
    url: '/consultation', 
    name: 'consultation',
    label: 'Professional Consultation - Connect with experts',
    waitFor: 2500,
    description: 'Consultant profiles and booking interface',
    requiresAuth: true
  },
  { 
    url: '/resource', 
    name: 'resources',
    label: 'Resource Library - Articles, videos, and tools',
    waitFor: 2500,
    description: 'Library of mental health resources',
    requiresAuth: true
  },
  { 
    url: '/account', 
    name: 'account',
    label: 'Account Settings - Manage your profile and preferences',
    waitFor: 2000,
    description: 'User profile and settings interface',
    requiresAuth: true
  }
];

const DESKTOP_SCREENS = [
  { 
    url: '/', 
    name: 'home',
    label: 'iKan Desktop - Homepage',
    waitFor: 2000
  },
  { 
    url: '/dashboard', 
    name: 'dashboard',
    label: 'Desktop Dashboard',
    waitFor: 3000,
    requiresAuth: true
  },
  { 
    url: '/assessment', 
    name: 'assessments',
    label: 'Desktop Assessments',
    waitFor: 2500,
    requiresAuth: true
  },
  { 
    url: '/equip', 
    name: 'equip',
    label: 'Desktop Equip Programs',
    waitFor: 2500,
    requiresAuth: true
  },
  { 
    url: '/resource', 
    name: 'resources',
    label: 'Desktop Resources',
    waitFor: 2500,
    requiresAuth: true
  },
  { 
    url: '/consultation', 
    name: 'consultation',
    label: 'Desktop Consultation',
    waitFor: 2500,
    requiresAuth: true
  }
];

/**
 * Mock authentication for screenshot generation
 * In production, you might want to use actual test credentials
 */
async function mockAuthentication(page) {
  try {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Fill in test credentials (adjust selectors as needed)
    await page.fill('input[type="email"]', 'test@ikan.app');
    await page.fill('input[type="password"]', 'testpassword');
    
    // Click sign in button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log('  ✅ Authentication successful');
    
    return true;
  } catch (error) {
    console.log('  ⚠️  Authentication failed:', error.message);
    console.log('  ℹ️  Continuing with public screenshots only');
    return false;
  }
}

/**
 * Generate mobile screenshots
 */
async function generateMobileScreenshots(browser, isAuthenticated) {
  console.log('\n📱 Generating Mobile Screenshots (540x960)...\n');
  
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2 // Retina display for better quality
  });
  const page = await context.newPage();

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < MOBILE_SCREENS.length; i++) {
    const screen = MOBILE_SCREENS[i];
    const filename = `screenshot-mobile-${i + 1}-${screen.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    // Skip screens requiring auth if not authenticated
    if (screen.requiresAuth && !isAuthenticated) {
      console.log(`  ⏭️  Skipping ${screen.name} (requires authentication)`);
      skipCount++;
      continue;
    }

    try {
      console.log(`  📸 Capturing ${screen.name}...`);
      
      // Navigate to the page
      await page.goto(`${BASE_URL}${screen.url}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Wait for content to load
      await page.waitForTimeout(screen.waitFor || 2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      
      // Get file size
      const stats = fs.statSync(filepath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`  ✅ ${filename} (${fileSizeKB} KB)`);
      successCount++;
      
    } catch (error) {
      console.error(`  ❌ Failed to capture ${screen.name}:`, error.message);
    }
  }

  await context.close();
  
  console.log(`\n  📱 Mobile: ${successCount} screenshots generated, ${skipCount} skipped\n`);
  return successCount;
}

/**
 * Generate desktop screenshots
 */
async function generateDesktopScreenshots(browser, isAuthenticated) {
  console.log('\n💻 Generating Desktop Screenshots (1280x800)...\n');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2 // Retina display for better quality
  });
  const page = await context.newPage();

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < DESKTOP_SCREENS.length; i++) {
    const screen = DESKTOP_SCREENS[i];
    const filename = `screenshot-desktop-${i + 1}-${screen.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    // Skip screens requiring auth if not authenticated
    if (screen.requiresAuth && !isAuthenticated) {
      console.log(`  ⏭️  Skipping ${screen.name} (requires authentication)`);
      skipCount++;
      continue;
    }

    try {
      console.log(`  📸 Capturing ${screen.name}...`);
      
      // Navigate to the page
      await page.goto(`${BASE_URL}${screen.url}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Wait for content to load
      await page.waitForTimeout(screen.waitFor || 2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      
      // Get file size
      const stats = fs.statSync(filepath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`  ✅ ${filename} (${fileSizeKB} KB)`);
      successCount++;
      
    } catch (error) {
      console.error(`  ❌ Failed to capture ${screen.name}:`, error.message);
    }
  }

  await context.close();
  
  console.log(`\n  💻 Desktop: ${successCount} screenshots generated, ${skipCount} skipped\n`);
  return successCount;
}

/**
 * Generate manifest JSON configuration
 */
function generateManifestConfig(mobileCount, desktopCount) {
  console.log('\n📝 Generating Manifest Configuration...\n');
  
  const screenshots = [];
  
  // Mobile screenshots
  for (let i = 0; i < mobileCount && i < MOBILE_SCREENS.length; i++) {
    const screen = MOBILE_SCREENS[i];
    screenshots.push({
      src: `/screenshots/screenshot-mobile-${i + 1}-${screen.name}.png`,
      sizes: "1080x1920",
      type: "image/png",
      form_factor: "narrow",
      label: screen.label
    });
  }
  
  // Desktop screenshots
  for (let i = 0; i < desktopCount && i < DESKTOP_SCREENS.length; i++) {
    const screen = DESKTOP_SCREENS[i];
    screenshots.push({
      src: `/screenshots/screenshot-desktop-${i + 1}-${screen.name}.png`,
      sizes: "2560x1600",
      type: "image/png",
      form_factor: "wide",
      label: screen.label
    });
  }
  
  const manifestConfig = {
    screenshots: screenshots
  };
  
  const configPath = path.join(__dirname, 'manifest-screenshots.json');
  fs.writeFileSync(configPath, JSON.stringify(manifestConfig, null, 2));
  
  console.log(`  ✅ Manifest configuration saved to manifest-screenshots.json`);
  console.log(`  ℹ️  Copy this into your /public/manifest.json file\n`);
  
  return manifestConfig;
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 iKan PWA Screenshot Generator\n');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output: ${SCREENSHOT_DIR}\n`);
  
  let browser;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await playwright.chromium.launch({ 
      headless: true,
      args: ['--disable-dev-shm-usage']
    });
    console.log('   ✅ Browser launched\n');
    
    // Check if app is accessible
    const testContext = await browser.newContext();
    const testPage = await testContext.newPage();
    
    try {
      await testPage.goto(BASE_URL, { timeout: 5000 });
      console.log('✅ App is accessible\n');
    } catch (error) {
      console.error('❌ Cannot access app at', BASE_URL);
      console.error('   Make sure the app is running (npm run dev)\n');
      await browser.close();
      process.exit(1);
    }
    
    await testContext.close();
    
    // Attempt authentication
    console.log('🔐 Attempting authentication...');
    const authContext = await browser.newContext({
      viewport: { width: 540, height: 960 }
    });
    const authPage = await authContext.newPage();
    const isAuthenticated = await mockAuthentication(authPage);
    await authContext.close();
    
    // Generate screenshots
    const mobileCount = await generateMobileScreenshots(browser, isAuthenticated);
    const desktopCount = await generateDesktopScreenshots(browser, isAuthenticated);
    
    // Generate manifest configuration
    generateManifestConfig(mobileCount, desktopCount);
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Screenshot generation complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   📱 Mobile:  ${mobileCount}/${MOBILE_SCREENS.length} screenshots`);
    console.log(`   💻 Desktop: ${desktopCount}/${DESKTOP_SCREENS.length} screenshots`);
    console.log(`   📁 Location: ${SCREENSHOT_DIR}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review screenshots in /public/screenshots/');
    console.log('   2. Copy manifest configuration from manifest-screenshots.json');
    console.log('   3. Update /public/manifest.json with screenshot paths');
    console.log('   4. Test with: Chrome DevTools > Application > Manifest');
    console.log('   5. Deploy to production\n');
    
    if (!isAuthenticated) {
      console.log('⚠️  Note: Some screenshots were skipped due to authentication failure');
      console.log('   To capture authenticated screens:');
      console.log('   1. Update mockAuthentication() with valid test credentials');
      console.log('   2. Or manually capture authenticated screenshots\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
