/**
 * Script to identify potentially unused import files
 * Scans the codebase to find which import files are actually referenced
 * 
 * Run with: npx tsx scripts/cleanup-unused-imports.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const IMPORTS_DIR = './imports';
const SCAN_DIRS = ['./components', './App.tsx', './lib'];

// Get all import files
const importFiles = fs.readdirSync(IMPORTS_DIR)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.basename(f, path.extname(f)));

console.log(`📦 Found ${importFiles.length} import files\n`);

// Track which imports are used
const usedImports = new Set<string>();
const unusedImports = new Set<string>(importFiles);

function scanFileForImports(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for each import file
    for (const importFile of importFiles) {
      // Look for various import patterns
      const patterns = [
        `from './imports/${importFile}'`,
        `from "./imports/${importFile}"`,
        `from '../imports/${importFile}'`,
        `from "../imports/${importFile}"`,
        `from '../../imports/${importFile}'`,
        `from "../../imports/${importFile}"`,
        `import ${importFile}`,
      ];
      
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          usedImports.add(importFile);
          unusedImports.delete(importFile);
          break;
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== 'imports') {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFileForImports(filePath);
    }
  }
}

// Scan all source directories
for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      scanDirectory(dir);
    } else {
      scanFileForImports(dir);
    }
  }
}

// Report results
console.log(`✅ Used imports: ${usedImports.size}`);
console.log(`❌ Potentially unused imports: ${unusedImports.size}\n`);

if (unusedImports.size > 0) {
  console.log('📝 Potentially unused import files:');
  console.log('(Review before deleting - some may be used dynamically)\n');
  
  const sortedUnused = Array.from(unusedImports).sort();
  
  // Group by prefix to identify patterns
  const byPrefix: Record<string, string[]> = {};
  for (const file of sortedUnused) {
    const prefix = file.split('-')[0] || 'other';
    if (!byPrefix[prefix]) {
      byPrefix[prefix] = [];
    }
    byPrefix[prefix].push(file);
  }
  
  for (const [prefix, files] of Object.entries(byPrefix)) {
    console.log(`\n${prefix}* (${files.length} files):`);
    for (const file of files.slice(0, 10)) {
      console.log(`  • ${file}`);
    }
    if (files.length > 10) {
      console.log(`  ... and ${files.length - 10} more`);
    }
  }
  
  console.log('\n💡 Recommendations:');
  console.log('  1. Review the list above carefully');
  console.log('  2. Check if any imports are loaded dynamically');
  console.log('  3. Keep versioned files if they represent design iterations');
  console.log('  4. Move unused files to an archive directory before deleting');
  console.log('  5. Re-run this script after cleanup to verify\n');
  
  // Offer to create a backup list
  const backupPath = './unused-imports-list.txt';
  fs.writeFileSync(backupPath, Array.from(unusedImports).sort().join('\n'));
  console.log(`📄 Full list saved to: ${backupPath}\n`);
}

console.log('✨ Analysis complete!\n');
