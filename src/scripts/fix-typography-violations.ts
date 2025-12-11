#!/usr/bin/env ts-node
/**
 * Fix Typography Guidelines Violations
 * 
 * This script fixes:
 * 1. Removes font-bold and font-semibold classes
 * 2. Changes fontWeight: 'var(--font-weight-bold)' to 'var(--font-weight-medium)'
 * 3. Changes fontWeight: 'var(--font-weight-semibold)' to 'var(--font-weight-medium)'
 * 4. Removes text-* Tailwind classes (keeping only inline fontSize)
 */

import * as fs from 'fs';
import * as path from 'path';

const filesToFix = [
  '/components/screens/homepage/AssessmentSection.tsx',
  '/components/screens/homepage/FAQSection.tsx',
  '/components/screens/homepage/AssessmentProgramsSection.tsx',
  '/components/screens/homepage/BenefitsSection.tsx',
  '/components/screens/homepage/TestimonialSection.tsx',
  '/components/screens/homepage/BlogSection.tsx',
  '/components/screens/homepage/EquipProgramsSection.tsx',
  '/components/screens/homepage/MissionSection.tsx',
  '/components/screens/homepage/HeroSection.tsx',
  '/components/screens/homepage/NewsletterSection.tsx',
  '/components/screens/ResourceDetail.tsx'
];

function fixFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Fix 1: Remove font-bold and font-semibold from className
  content = content.replace(/className="([^"]*)font-bold([^"]*)"/g, 'className="$1$2"');
  content = content.replace(/className="([^"]*)font-semibold([^"]*)"/g, 'className="$1$2"');
  
  // Fix 2: Change inline font-weight-bold to font-weight-medium
  content = content.replace(/fontWeight:\s*['"]var\(--font-weight-bold\)['"]/g, "fontWeight: 'var(--font-weight-medium)'");
  content = content.replace(/fontWeight:\s*['"]var\(--font-weight-semibold\)['"]/g, "fontWeight: 'var(--font-weight-medium)'");
  
  // Fix 3: Remove text-* classes from className (but keep other classes)
  content = content.replace(/className="([^"]*)text-(xs|sm|base|lg|xl|2xl|3xl|4xl)([^"]*)"/g, 'className="$1$3"');
  
  // Fix 4: Remove font-medium from className when inline fontWeight exists
  content = content.replace(/className="([^"]*)font-medium([^"]*)"/g, 'className="$1$2"');
  
  // Fix 5: Clean up double spaces in className
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/className="([^"]*)\s\s+([^"]*)"/g, 'className="$1 $2"');
  content = content.replace(/className="([^"]*)\s+"/g, 'className="$1"');
  content = content.replace(/className="\s+([^"]*)"/g, 'className="$1"');
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Fixed: ${filePath}`);
}

console.log('🔧 Fixing typography violations...\n');

filesToFix.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error);
  }
});

console.log('\n✅ All files fixed!');
