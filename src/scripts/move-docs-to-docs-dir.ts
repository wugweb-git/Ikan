/**
 * Script to move documentation files from root to /docs/
 * Keeps only essential files in root
 * 
 * Run with: npx tsx scripts/move-docs-to-docs-dir.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Files to keep in root
const KEEP_IN_ROOT = [
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.gitignore',
  '.env.example',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'index.html',
  'App.tsx',
  'lighthouserc.json',
  'pull_request_template.md',
  'deploy.md',
  'design-tokens.json'
];

// Directories to create
const DOCS_DIRS = {
  audits: '/docs/audits',
  guides: '/docs/guides',
  archive: '/docs/archive'
};

// Categorize files
const FILE_CATEGORIES = {
  audits: ['AUDIT', 'FIXES', 'COMPLIANCE', 'MOBILE_UX', 'DESIGN_TOKEN'],
  guides: ['DEPLOYMENT', 'PRODUCTION', 'SETUP', 'GUIDE'],
  archive: ['CHECKPOINT', 'REFACTOR', 'BUILD_', 'ENVIRONMENT_', 'CLEANUP']
};

function createDirs() {
  for (const dir of Object.values(DOCS_DIRS)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
}

function categorizeFile(filename: string): string | null {
  for (const [category, keywords] of Object.entries(FILE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (filename.includes(keyword)) {
        return DOCS_DIRS[category as keyof typeof DOCS_DIRS];
      }
    }
  }
  return DOCS_DIRS.archive; // Default to archive
}

function moveDocFiles() {
  const files = fs.readdirSync('.');
  const movedFiles: string[] = [];
  
  for (const file of files) {
    // Skip if it's a directory or should be kept in root
    if (fs.statSync(file).isDirectory() || KEEP_IN_ROOT.includes(file)) {
      continue;
    }
    
    // Only move .md files
    if (file.endsWith('.md') && !KEEP_IN_ROOT.includes(file)) {
      const targetDir = categorizeFile(file);
      if (targetDir) {
        const sourcePath = path.join('.', file);
        const targetPath = path.join(targetDir, file);
        
        try {
          fs.renameSync(sourcePath, targetPath);
          movedFiles.push(`${file} → ${targetDir}`);
          console.log(`📝 Moved: ${file} → ${targetDir}`);
        } catch (error) {
          console.error(`❌ Error moving ${file}:`, error);
        }
      }
    }
  }
  
  return movedFiles;
}

// Run the script
console.log('📚 Starting documentation organization...\n');

createDirs();
console.log('');

const moved = moveDocFiles();

console.log(`\n✨ Moved ${moved.length} documentation files`);
console.log('\n📂 Documentation structure:');
console.log('  • /docs/audits     - Audit reports and compliance checks');
console.log('  • /docs/guides     - Deployment and setup guides');
console.log('  • /docs/archive    - Historical checkpoints and old docs\n');

console.log('✅ Documentation organization complete!\n');
