#!/usr/bin/env node

/**
 * Figma Asset Analyzer
 * 
 * Analyzes all figma:asset imports and generates:
 * 1. Complete list of all assets with usage locations
 * 2. Migration script template
 * 3. Asset extraction checklist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AssetUsage {
  hash: string;
  fullImport: string;
  variableName: string;
  file: string;
  line: number;
  isUsed: boolean;
}

const assets: Map<string, AssetUsage[]> = new Map();

function scanDirectory(dir: string, baseDir: string = dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Skip node_modules, dist, .git
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'scripts') {
      continue;
    }

    if (stat.isDirectory()) {
      scanDirectory(fullPath, baseDir);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(fullPath, baseDir);
    }
  }
}

function scanFile(filePath: string, baseDir: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(baseDir, filePath);

  // Match: import varName from "figma:asset/hash.png"
  const importRegex = /import\s+(\w+)\s+from\s+["']figma:asset\/([\w\d]+\.png)["']/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = importRegex.exec(line)) !== null) {
      const [fullImport, variableName, hash] = match;

      // Check if variable is actually used in the file
      const varRegex = new RegExp(`\\b${variableName}\\b`, 'g');
      const usageCount = (content.match(varRegex) || []).length;
      const isUsed = usageCount > 1; // More than just the import

      const usage: AssetUsage = {
        hash,
        fullImport,
        variableName,
        file: relativePath,
        line: index + 1,
        isUsed
      };

      if (!assets.has(hash)) {
        assets.set(hash, []);
      }
      assets.get(hash)!.push(usage);
    }
  });
}

function generateReport() {
  const totalAssets = assets.size;
  const totalUsages = Array.from(assets.values()).reduce((sum, usages) => sum + usages.length, 0);
  const usedAssets = Array.from(assets.entries()).filter(([_, usages]) => 
    usages.some(u => u.isUsed)
  ).length;
  const unusedAssets = totalAssets - usedAssets;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         FIGMA ASSET DEPENDENCY ANALYSIS REPORT                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   • Total unique assets: ${totalAssets}`);
  console.log(`   • Total import statements: ${totalUsages}`);
  console.log(`   • Assets actually used: ${usedAssets}`);
  console.log(`   • Unused imports: ${unusedAssets}\n`);

  console.log('═'.repeat(70));
  console.log('\n🚨 CRITICAL: All these imports will FAIL on Vercel!\n');
  console.log('═'.repeat(70));

  // Group by file
  const fileMap: Map<string, AssetUsage[]> = new Map();
  assets.forEach((usages) => {
    usages.forEach((usage) => {
      if (!fileMap.has(usage.file)) {
        fileMap.set(usage.file, []);
      }
      fileMap.get(usage.file)!.push(usage);
    });
  });

  console.log('\n📁 Assets by File:\n');

  const sortedFiles = Array.from(fileMap.entries()).sort((a, b) => b[1].length - a[1].length);

  sortedFiles.forEach(([file, usages], index) => {
    const priority = usages.length >= 10 ? '🔴 CRITICAL' : 
                     usages.length >= 5 ? '🟡 HIGH' : '🟢 LOW';
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Priority: ${priority} (${usages.length} assets)`);
    
    usages.forEach((usage, i) => {
      const status = usage.isUsed ? '✓ Used' : '✗ Unused';
      console.log(`   ${i + 1}. Line ${usage.line}: ${usage.variableName} [${status}]`);
      console.log(`      Hash: ${usage.hash}`);
    });
    console.log('');
  });

  console.log('═'.repeat(70));
  console.log('\n💡 Asset Migration Map:\n');
  console.log('Copy this to create your asset mapping:\n');

  console.log('```typescript');
  console.log('// Asset mapping: hash -> readable filename');
  console.log('const ASSET_MAP: Record<string, string> = {');
  
  let counter = 1;
  const sortedAssets = Array.from(assets.entries()).sort((a, b) => {
    const aUsed = a[1].some(u => u.isUsed);
    const bUsed = b[1].some(u => u.isUsed);
    if (aUsed && !bUsed) return -1;
    if (!aUsed && bUsed) return 1;
    return 0;
  });

  sortedAssets.forEach(([hash, usages]) => {
    const isUsed = usages.some(u => u.isUsed);
    const varName = usages[0].variableName;
    const suggestedName = varName
      .replace(/^img/, '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
      .replace(/\d+/g, '');
    
    const cleanName = suggestedName || `image-${counter}`;
    const comment = isUsed ? '' : ' // UNUSED - can skip';
    
    console.log(`  '${hash}': '${cleanName}.png',${comment}`);
    if (isUsed) counter++;
  });
  
  console.log('};');
  console.log('```\n');

  console.log('═'.repeat(70));
  console.log('\n📋 Next Steps:\n');
  console.log('1. Check if assets exist in Figma Make build output:');
  console.log('   ```bash');
  console.log('   find . -name "48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png"');
  console.log('   ```\n');
  console.log('2. If found, move to /public/images/');
  console.log('3. Run the migration script (we can generate this)\n');
  console.log('4. Test build locally:');
  console.log('   ```bash');
  console.log('   npm run build');
  console.log('   ```\n');

  console.log('═'.repeat(70));
  console.log('\n⚠️  DEPLOYMENT BLOCKED UNTIL ASSETS ARE MIGRATED\n');
  console.log('═'.repeat(70));

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'FIGMA_ASSET_REPORT.json');
  const reportData = {
    summary: {
      totalAssets,
      totalUsages,
      usedAssets,
      unusedAssets,
      analyzedAt: new Date().toISOString()
    },
    assetsByHash: Object.fromEntries(assets),
    assetsByFile: Object.fromEntries(fileMap)
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed JSON report saved to: FIGMA_ASSET_REPORT.json\n`);
}

// Run analysis
const projectRoot = path.join(__dirname, '..');
console.log(`\n🔍 Scanning project for figma:asset imports...\n`);
scanDirectory(projectRoot);
generateReport();
