#!/usr/bin/env ts-node
/**
 * Migrate App.tsx Console Calls to Logger
 * 
 * This script migrates all console.* calls to logger.* calls in App.tsx
 * Also removes the console override code (lines 493-547)
 */

import * as fs from 'fs';
import * as path from 'path';

const filePath = '/App.tsx';
const fullPath = path.join(process.cwd(), filePath);

let content = fs.readFileSync(fullPath, 'utf-8');

// Replace console.log with logger.log
content = content.replace(/console\.log\(/g, 'logger.log(');

// Replace console.warn with logger.warn
content = content.replace(/console\.warn\(/g, 'logger.warn(');

// Replace console.error with logger.error
content = content.replace(/console\.error\(/g, 'logger.error(');

// Replace console.info with logger.info (if any)
content = content.replace(/console\.info\(/g, 'logger.info(');

// Remove the console override section (lines 493-547 approximately)
// This removes the code that overrides console.error and console.warn
const consoleOverridePattern = /\/\/ Console error override to suppress specific error types\s+const originalConsoleError = console\.error;[\s\S]*?originalConsoleWarn\(\.\.\.args\);\s+};/;

content = content.replace(consoleOverridePattern, '// Console override removed - using logger utility');

// Write back
fs.writeFileSync(fullPath, content, 'utf-8');

console.log('✅ App.tsx migrated to logger utility');
console.log('📝 Changes made:');
console.log('   - Replaced all console.log() with logger.log()');
console.log('   - Replaced all console.warn() with logger.warn()');
console.log('   - Replaced all console.error() with logger.error()');
console.log('   - Removed console override code');
