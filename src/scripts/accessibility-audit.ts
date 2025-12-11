/**
 * Accessibility Audit Script for iKan Mental Health PWA
 * Checks for common WCAG 2.1 AA compliance issues
 * 
 * Run with: npx tsx scripts/accessibility-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface AccessibilityIssue {
  file: string;
  line: number;
  type: 'error' | 'warning';
  category: string;
  message: string;
}

const issues: AccessibilityIssue[] = [];

// Patterns to check
const patterns = {
  // Images without alt text
  imgWithoutAlt: /<img(?![^>]*alt=)/g,
  
  // Buttons without aria-label or text content
  buttonWithoutLabel: /<button(?![^>]*aria-label=)(?![^>]*>[\s\S]*?<\/button>)/g,
  
  // Links without text
  emptyLink: /<a[^>]*>[\s]*<\/a>/g,
  
  // Divs with onClick without role/tabIndex
  clickableDivWithoutRole: /<div[^>]*onClick[^>]*(?!role=)(?!tabIndex=)/gi,
  
  // Form inputs without labels
  inputWithoutLabel: /<input(?![^>]*aria-label=)(?![^>]*id=)/g,
  
  // Headings skipping levels (h1 -> h3)
  headingSkip: /<h[1-6]/g,
  
  // Color-only information (needs pattern matching)
  colorOnlyInfo: /color:\s*['"](?:red|green|yellow)['"](?![^}]*(?:text|aria|label))/g,
  
  // Missing lang attribute
  missingLang: /<html(?![^>]*lang=)/g
};

function scanFile(filePath: string, content: string) {
  const lines = content.split('\n');
  
  // Check for images without alt
  let match;
  while ((match = patterns.imgWithoutAlt.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'error',
      category: 'Images',
      message: 'Image element missing alt attribute'
    });
  }
  
  // Check for clickable divs without proper accessibility
  patterns.clickableDivWithoutRole.lastIndex = 0;
  while ((match = patterns.clickableDivWithoutRole.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'error',
      category: 'Interactive Elements',
      message: 'Clickable div missing role and tabIndex for keyboard accessibility'
    });
  }
  
  // Check for inputs without labels
  patterns.inputWithoutLabel.lastIndex = 0;
  while ((match = patterns.inputWithoutLabel.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'warning',
      category: 'Forms',
      message: 'Input element should have associated label or aria-label'
    });
  }
  
  // Check for empty links
  patterns.emptyLink.lastIndex = 0;
  while ((match = patterns.emptyLink.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNumber,
      type: 'error',
      category: 'Links',
      message: 'Empty link element - provide descriptive text or aria-label'
    });
  }
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      scanFile(filePath, content);
    }
  }
}

// Run the audit
console.log('🔍 Starting accessibility audit...\n');
scanDirectory('./components');
scanDirectory('./App.tsx');

// Report results
if (issues.length === 0) {
  console.log('✅ No accessibility issues found!\n');
} else {
  console.log(`❌ Found ${issues.length} accessibility issues:\n`);
  
  // Group by category
  const byCategory: Record<string, AccessibilityIssue[]> = {};
  for (const issue of issues) {
    if (!byCategory[issue.category]) {
      byCategory[issue.category] = [];
    }
    byCategory[issue.category].push(issue);
  }
  
  // Print by category
  for (const [category, categoryIssues] of Object.entries(byCategory)) {
    console.log(`\n📋 ${category} (${categoryIssues.length} issues):`);
    for (const issue of categoryIssues) {
      const icon = issue.type === 'error' ? '🔴' : '⚠️';
      console.log(`  ${icon} ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
    }
  }
  
  console.log('\n');
  console.log('📚 Accessibility Guidelines:');
  console.log('  • All interactive elements must be keyboard accessible');
  console.log('  • Images must have descriptive alt text');
  console.log('  • Color contrast must meet WCAG AA standards (4.5:1)');
  console.log('  • Form inputs must have associated labels');
  console.log('  • Semantic HTML should be used where possible');
  console.log('  • ARIA labels should supplement, not replace, semantic HTML\n');
}

process.exit(issues.filter(i => i.type === 'error').length > 0 ? 1 : 0);
