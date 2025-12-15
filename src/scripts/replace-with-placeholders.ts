#!/usr/bin/env node

/**
 * Quick Fix: Replace figma:asset with Placeholder Images
 * 
 * This script replaces all figma:asset imports with placeholder images
 * so you can deploy immediately while you source the real images.
 * 
 * Run: npx tsx scripts/replace-with-placeholders.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

interface Replacement {
  file: string;
  oldLine: string;
  newLine: string;
  lineNumber: number;
}

const replacements: Replacement[] = [];

function scanAndReplace(dir: string, baseDir: string = dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Skip directories
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'scripts') {
      continue;
    }

    if (stat.isDirectory()) {
      scanAndReplace(fullPath, baseDir);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let modified = false;
  const newLines = lines.map((line, index) => {
    // Match: import varName from "figma:asset/hash.png"
    const importMatch = line.match(/import\s+(\w+)\s+from\s+["']figma:asset\/([\w\d]+\.png)["']/);
    
    if (importMatch) {
      const [fullMatch, varName, hash] = importMatch;
      
      // Comment out the import
      const newLine = `// ${line} // REPLACED: Use placeholder instead`;
      
      replacements.push({
        file: filePath,
        oldLine: line,
        newLine,
        lineNumber: index + 1
      });
      
      modified = true;
      return newLine;
    }
    
    return line;
  });

  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, newLines.join('\n'));
  }
}

function generatePlaceholderComponent() {
  const componentPath = path.join(__dirname, '..', 'components', 'FigmaAssetPlaceholder.tsx');
  
  const componentCode = `/**
 * Temporary Placeholder for Figma Assets
 * 
 * Replace these with real images once exported from Figma Make
 */

interface FigmaAssetPlaceholderProps {
  width?: number;
  height?: number;
  text?: string;
  className?: string;
  alt?: string;
}

export function FigmaAssetPlaceholder({
  width = 1200,
  height = 600,
  text = 'Image Placeholder',
  className = '',
  alt = 'Placeholder image'
}: FigmaAssetPlaceholderProps) {
  const placeholderUrl = \`https://placehold.co/\${width}x\${height}/E9EBEF/2A2A2A?text=\${encodeURIComponent(text)}\`;
  
  return (
    <img
      src={placeholderUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

// Export common placeholder URLs
export const PLACEHOLDER_IMAGES = {
  hero: 'https://placehold.co/1200x600/E9EBEF/2A2A2A?text=Hero+Image',
  avatar: 'https://placehold.co/100x100/E9EBEF/2A2A2A?text=Avatar',
  thumbnail: 'https://placehold.co/400x300/E9EBEF/2A2A2A?text=Thumbnail',
  certification: 'https://placehold.co/150x150/E9EBEF/2A2A2A?text=Cert',
  background: 'https://placehold.co/1920x1080/F5F5F5/717182?text=Background',
};
`;

  if (!DRY_RUN) {
    fs.writeFileSync(componentPath, componentCode);
  }
  
  return componentPath;
}

function printReport() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║      FIGMA ASSET → PLACEHOLDER REPLACEMENT SCRIPT              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('✏️  LIVE MODE - Files will be modified\n');
  }

  console.log(`📊 Found ${replacements.length} figma:asset imports to replace\n`);

  if (replacements.length === 0) {
    console.log('✅ No figma:asset imports found. You are good to deploy!\n');
    return;
  }

  // Group by file
  const byFile = new Map<string, Replacement[]>();
  replacements.forEach(r => {
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file)!.push(r);
  });

  console.log('📁 Changes by file:\n');
  
  Array.from(byFile.entries()).forEach(([file, reps], index) => {
    const relPath = path.relative(process.cwd(), file);
    console.log(`${index + 1}. ${relPath} (${reps.length} imports)`);
    
    reps.forEach((rep, i) => {
      console.log(`   Line ${rep.lineNumber}:`);
      console.log(`   - ${rep.oldLine}`);
      console.log(`   + ${rep.newLine}\n`);
    });
  });

  console.log('═'.repeat(70));
  console.log('\n📝 MANUAL STEPS REQUIRED:\n');
  console.log('After running this script, you need to manually update each component\n');
  console.log('to use placeholder images instead of the imported variables.\n');
  console.log('Example:\n');
  console.log('  // Before:');
  console.log('  import imgHero from "figma:asset/abc123.png"');
  console.log('  <img src={imgHero} alt="Hero" />\n');
  console.log('  // After:');
  console.log('  import { PLACEHOLDER_IMAGES } from "@components/FigmaAssetPlaceholder"');
  console.log('  <img src={PLACEHOLDER_IMAGES.hero} alt="Hero" />\n');
  
  console.log('OR use ImageWithFallback:\n');
  console.log('  import { ImageWithFallback } from "@components/figma/ImageWithFallback"');
  console.log('  <ImageWithFallback');
  console.log('    src={PLACEHOLDER_IMAGES.hero}');
  console.log('    alt="Hero"');
  console.log('    className="w-full h-auto"');
  console.log('  />\n');

  const componentPath = generatePlaceholderComponent();
  const relComponentPath = path.relative(process.cwd(), componentPath);
  
  if (DRY_RUN) {
    console.log(`Would create: ${relComponentPath}\n`);
  } else {
    console.log(`✅ Created: ${relComponentPath}\n`);
  }

  console.log('═'.repeat(70));
  console.log('\n⚠️  THIS IS A TEMPORARY SOLUTION\n');
  console.log('You should replace placeholders with real images ASAP for production.\n');
  console.log('Steps to get real images:');
  console.log('1. Export assets from Figma Make');
  console.log('2. Place in /public/images/');
  console.log('3. Update PLACEHOLDER_IMAGES with real paths\n');

  if (DRY_RUN) {
    console.log('To apply changes, run:');
    console.log('  npx tsx scripts/replace-with-placeholders.ts\n');
  } else {
    console.log('✅ Import statements commented out!');
    console.log('⚠️  Now manually update component code to use placeholders\n');
    console.log('Then test build:');
    console.log('  npm run build\n');
  }

  console.log('═'.repeat(70));
}

// Run
const projectRoot = path.join(__dirname, '..');
scanAndReplace(projectRoot);
printReport();
