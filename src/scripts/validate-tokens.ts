// validate-tokens.ts - Design token validation script for iKan design system
// Validates token references across JSON/TS files and ensures consistency

import fs from 'fs';
import path from 'path';
import tokens from '../lib/design-tokens';

interface TokenReference {
  file: string;
  line: number;
  column: number;
  token: string;
  context: string;
}

interface ValidationResult {
  file: string;
  valid: TokenReference[];
  invalid: TokenReference[];
  suggestions: Array<{
    invalid: string;
    suggestions: string[];
  }>;
}

interface ValidationSummary {
  totalFiles: number;
  totalReferences: number;
  validReferences: number;
  invalidReferences: number;
  results: ValidationResult[];
  globalSuggestions: string[];
}

/**
 * iKan Design Token Validator
 * 
 * This script:
 * 1. Scans all TypeScript and JSON files for token references
 * 2. Validates references against design-tokens.ts
 * 3. Provides suggestions for invalid tokens
 * 4. Generates comprehensive validation reports
 */
export class iKanTokenValidator {
  private readonly SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  private readonly EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage'];
  private readonly TOKEN_PATTERNS = [
    // CSS variable references: var(--token-name)
    /var\(--([a-zA-Z0-9-_]+)\)/g,
    // Direct token references: {token.name}
    /\{([a-zA-Z0-9._-]+)\}/g,
    // Token object access: tokens.path.to.value
    /tokens\.([a-zA-Z0-9._-]+)/g,
    // CSS custom property: --token-name
    /--([a-zA-Z0-9-_]+)(?:\s*:)/g,
  ];
  
  private flatTokens: Record<string, any> = {};
  private cssVarTokens: Record<string, any> = {};

  constructor() {
    this.flatTokens = this.flattenTokens(tokens);
    this.cssVarTokens = this.generateCssVarMapping();
  }

  /**
   * Validate all token references in the project
   */
  async validateProject(): Promise<ValidationSummary> {
    console.log('🔍 Starting iKan design token validation...');
    
    const files = this.scanForFiles();
    console.log(`📁 Found ${files.length} files to scan`);
    
    const results: ValidationResult[] = [];
    let totalReferences = 0;
    let validReferences = 0;
    let invalidReferences = 0;
    
    for (const file of files) {
      const result = await this.validateFile(file);
      results.push(result);
      
      totalReferences += result.valid.length + result.invalid.length;
      validReferences += result.valid.length;
      invalidReferences += result.invalid.length;
    }
    
    const globalSuggestions = this.generateGlobalSuggestions(results);
    
    const summary: ValidationSummary = {
      totalFiles: files.length,
      totalReferences,
      validReferences,
      invalidReferences,
      results: results.filter(r => r.invalid.length > 0 || r.valid.length > 0),
      globalSuggestions
    };
    
    this.generateReport(summary);
    return summary;
  }

  /**
   * Validate token references in a single file
   */
  private async validateFile(filepath: string): Promise<ValidationResult> {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    const valid: TokenReference[] = [];
    const invalid: TokenReference[] = [];
    const suggestions: Array<{ invalid: string; suggestions: string[] }> = [];
    
    // Scan each line for token references
    lines.forEach((line, lineIndex) => {
      for (const pattern of this.TOKEN_PATTERNS) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const tokenRef = match[1];
          const isValid = this.validateTokenReference(tokenRef);
          
          const reference: TokenReference = {
            file: filepath,
            line: lineIndex + 1,
            column: match.index + 1,
            token: tokenRef,
            context: line.trim()
          };
          
          if (isValid) {
            valid.push(reference);
          } else {
            invalid.push(reference);
            
            // Generate suggestions for invalid tokens
            const tokenSuggestions = this.getSuggestions(tokenRef);
            if (tokenSuggestions.length > 0) {
              suggestions.push({
                invalid: tokenRef,
                suggestions: tokenSuggestions
              });
            }
          }
        }
      }
    });
    
    return {
      file: path.relative(process.cwd(), filepath),
      valid,
      invalid,
      suggestions
    };
  }

  /**
   * Validate a single token reference
   */
  private validateTokenReference(tokenRef: string): boolean {
    // Check direct token path (e.g., colors.primary.default)
    if (this.flatTokens[tokenRef]) {
      return true;
    }
    
    // Check CSS variable format (e.g., color-primary-default)
    if (this.cssVarTokens[tokenRef]) {
      return true;
    }
    
    // Check with 'ikan-' prefix for CSS variables
    if (this.cssVarTokens[`ikan-${tokenRef}`]) {
      return true;
    }
    
    // Check semantic tokens
    if (tokenRef.startsWith('semantic-') && this.flatTokens[tokenRef]) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate suggestions for invalid token references
   */
  private getSuggestions(invalidToken: string): string[] {
    const suggestions: string[] = [];
    const allTokens = [
      ...Object.keys(this.flatTokens),
      ...Object.keys(this.cssVarTokens)
    ];
    
    // Find similar tokens using Levenshtein distance
    const similar = allTokens
      .map(token => ({
        token,
        distance: this.levenshteinDistance(invalidToken, token)
      }))
      .filter(item => item.distance <= 3) // Max 3 character differences
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Top 5 suggestions
      .map(item => item.token);
    
    suggestions.push(...similar);
    
    // Add prefix/suffix suggestions
    if (invalidToken.includes('-')) {
      const parts = invalidToken.split('-');
      const possibleTokens = allTokens.filter(token => 
        parts.some(part => token.includes(part))
      ).slice(0, 3);
      suggestions.push(...possibleTokens);
    }
    
    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Flatten token object into dot notation
   */
  private flattenTokens(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Skip objects with specific properties (like icon objects)
          if (value.hasOwnProperty('char') && value.hasOwnProperty('label')) {
            flattened[newKey] = value;
          } else {
            Object.assign(flattened, this.flattenTokens(value, newKey));
          }
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  }

  /**
   * Generate CSS variable name mappings
   */
  private generateCssVarMapping(): Record<string, any> {
    const cssVars: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(this.flatTokens)) {
      // Convert dot notation to CSS variable format
      const cssVarName = key.replace(/\./g, '-');
      cssVars[cssVarName] = value;
      
      // Also add with ikan- prefix
      cssVars[`ikan-${cssVarName}`] = value;
      
      // Add common variations
      const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/\./g, '-');
      cssVars[kebabCase] = value;
    }
    
    return cssVars;
  }

  /**
   * Scan project for files to validate
   */
  private scanForFiles(): string[] {
    const files: string[] = [];
    
    const scanDirectory = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.EXCLUDE_DIRS.includes(entry.name)) {
            scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.SCAN_EXTENSIONS.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDirectory(process.cwd());
    return files;
  }

  /**
   * Generate global suggestions based on all validation results
   */
  private generateGlobalSuggestions(results: ValidationResult[]): string[] {
    const suggestions: string[] = [];
    
    // Find most common invalid tokens
    const invalidTokenCounts: Record<string, number> = {};
    results.forEach(result => {
      result.invalid.forEach(ref => {
        invalidTokenCounts[ref.token] = (invalidTokenCounts[ref.token] || 0) + 1;
      });
    });
    
    const commonInvalid = Object.entries(invalidTokenCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([token]) => token);
    
    if (commonInvalid.length > 0) {
      suggestions.push(
        'Most common invalid tokens:',
        ...commonInvalid.map(token => `  - ${token}`)
      );
    }
    
    // Check for outdated token patterns
    const outdatedPatterns = [
      'primary-color',
      'background-color',
      'text-color',
      'font-size'
    ];
    
    const foundOutdated = results.some(result =>
      result.invalid.some(ref =>
        outdatedPatterns.some(pattern => ref.token.includes(pattern))
      )
    );
    
    if (foundOutdated) {
      suggestions.push(
        '',
        'Consider updating to iKan token naming:',
        '  - color-primary-default instead of primary-color',
        '  - color-bg-page instead of background-color',
        '  - color-text-primary instead of text-color',
        '  - text-base instead of font-size'
      );
    }
    
    return suggestions;
  }

  /**
   * Generate and save validation report
   */
  private generateReport(summary: ValidationSummary): void {
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Generate JSON report
    const jsonReportPath = path.join(reportDir, 'token-validation.json');
    fs.writeFileSync(
      jsonReportPath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        tokenCounts: {
          total: Object.keys(this.flatTokens).length,
          cssVars: Object.keys(this.cssVarTokens).length
        }
      }, null, 2),
      'utf8'
    );
    
    // Generate human-readable report
    const textReportPath = path.join(reportDir, 'token-validation.txt');
    const textReport = this.generateTextReport(summary);
    fs.writeFileSync(textReportPath, textReport, 'utf8');
    
    console.log(`📄 Reports generated:`);
    console.log(`  - JSON: ${jsonReportPath}`);
    console.log(`  - Text: ${textReportPath}`);
  }

  /**
   * Generate human-readable text report
   */
  private generateTextReport(summary: ValidationSummary): string {
    const lines: string[] = [];
    
    lines.push('iKan Design Token Validation Report');
    lines.push('=' .repeat(40));
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    
    lines.push('Summary:');
    lines.push(`  Files scanned: ${summary.totalFiles}`);
    lines.push(`  Total references: ${summary.totalReferences}`);
    lines.push(`  Valid references: ${summary.validReferences}`);
    lines.push(`  Invalid references: ${summary.invalidReferences}`);
    lines.push(`  Success rate: ${((summary.validReferences / summary.totalReferences) * 100).toFixed(1)}%`);
    lines.push('');
    
    if (summary.invalidReferences > 0) {
      lines.push('Invalid Token References:');
      lines.push('-'.repeat(25));
      
      summary.results.forEach(result => {
        if (result.invalid.length > 0) {
          lines.push(`\n${result.file}:`);
          result.invalid.forEach(ref => {
            lines.push(`  Line ${ref.line}: ${ref.token}`);
            lines.push(`    Context: ${ref.context}`);
          });
          
          if (result.suggestions.length > 0) {
            lines.push('  Suggestions:');
            result.suggestions.forEach(suggestion => {
              lines.push(`    ${suggestion.invalid} → ${suggestion.suggestions.join(', ')}`);
            });
          }
        }
      });
    }
    
    if (summary.globalSuggestions.length > 0) {
      lines.push('\nGlobal Suggestions:');
      lines.push('-'.repeat(18));
      summary.globalSuggestions.forEach(suggestion => {
        lines.push(suggestion);
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

/**
 * Command line interface
 */
export async function runTokenValidationCLI(): Promise<void> {
  const validator = new iKanTokenValidator();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';
  
  try {
    switch (command) {
      case 'validate':
        console.log('🔍 Validating design tokens...');
        const summary = await validator.validateProject();
        
        console.log('\n📊 Validation Summary:');
        console.log(`Files scanned: ${summary.totalFiles}`);
        console.log(`Total references: ${summary.totalReferences}`);
        console.log(`Valid: ${summary.validReferences}`);
        console.log(`Invalid: ${summary.invalidReferences}`);
        console.log(`Success rate: ${((summary.validReferences / summary.totalReferences) * 100).toFixed(1)}%`);
        
        if (summary.invalidReferences === 0) {
          console.log('\n✅ All token references are valid!');
          process.exit(0);
        } else {
          console.log('\n⚠️ Invalid token references found. Check the generated report for details.');
          process.exit(1);
        }
        
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  validate - Validate all design token references');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Token validation CLI error:', error);
    process.exit(1);
  }
}

// Export singleton instance
export const tokenValidator = new iKanTokenValidator();

// Run CLI if this file is executed directly
if (require.main === module) {
  runTokenValidationCLI();
}

/**
 * Usage Examples:
 * 
 * // Run in code
 * import { tokenValidator } from './scripts/validate-tokens';
 * const summary = await tokenValidator.validateProject();
 * 
 * // Run from command line
 * npx ts-node scripts/validate-tokens.ts validate
 */