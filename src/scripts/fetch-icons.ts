// fetch-icons.ts - Icon fetching script for iKan design system
// Fetches icons from Iconify API and integrates with existing icon system

import fs from 'fs';
import path from 'path';
import https from 'https';
import { iconMapping } from '../lib/icon-mapping';
import { iconConfig } from '../lib/icon-config';

interface IconFetchResult {
  name: string;
  success: boolean;
  path?: string;
  error?: string;
}

interface FetchSummary {
  total: number;
  successful: number;
  failed: number;
  results: IconFetchResult[];
  errors: string[];
}

/**
 * iKan Icon Fetching System
 * 
 * This script:
 * 1. Fetches icons from Iconify API based on icon-mapping.ts
 * 2. Saves SVGs to /icons/ directory
 * 3. Validates icon availability
 * 4. Updates icon configuration
 */
export class iKanIconFetcher {
  private readonly ICONIFY_API = 'https://api.iconify.design';
  private readonly OUTPUT_DIR = path.resolve('./icons');
  private readonly BACKUP_DIR = path.resolve('./icons/backup');
  
  private results: IconFetchResult[] = [];
  private errors: string[] = [];

  /**
   * Fetch all icons from the mapping
   */
  async fetchAllIcons(): Promise<FetchSummary> {
    console.log('🎨 Starting iKan icon fetch process...');
    
    this.ensureDirectories();
    
    const iconEntries = Object.entries(iconMapping.mapping);
    console.log(`📥 Fetching ${iconEntries.length} icons from Iconify...`);
    
    for (const [name, iconifyId] of iconEntries) {
      await this.fetchIcon(name, iconifyId);
      // Add small delay to avoid rate limiting
      await this.delay(100);
    }
    
    const summary = this.generateSummary();
    this.generateReport(summary);
    
    return summary;
  }

  /**
   * Fetch a single icon
   */
  private async fetchIcon(name: string, iconifyId: string): Promise<void> {
    try {
      console.log(`⬇️ Fetching ${name} (${iconifyId})...`);
      
      const url = `${this.ICONIFY_API}/${iconifyId}.svg`;
      const svg = await this.downloadSvg(url);
      
      if (!svg) {
        throw new Error('Empty SVG response');
      }

      // Validate SVG content
      if (!this.validateSvg(svg)) {
        throw new Error('Invalid SVG content');
      }

      // Save to file
      const filename = `${name}.svg`;
      const filepath = path.join(this.OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, svg, 'utf8');
      
      this.results.push({
        name,
        success: true,
        path: filepath
      });
      
      console.log(`✅ Saved ${name} → ${filepath}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to fetch ${name}: ${errorMessage}`);
      
      this.results.push({
        name,
        success: false,
        error: errorMessage
      });
      
      this.errors.push(`${name}: ${errorMessage}`);
    }
  }

  /**
   * Download SVG from URL
   */
  private downloadSvg(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve(data);
        });
        
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Validate SVG content
   */
  private validateSvg(svg: string): boolean {
    // Basic SVG validation
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      return false;
    }
    
    // Check for common SVG attributes
    if (!svg.includes('viewBox') && !svg.includes('width')) {
      return false;
    }
    
    return true;
  }

  /**
   * Ensure output directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.OUTPUT_DIR)) {
      fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created directory: ${this.OUTPUT_DIR}`);
    }
    
    if (!fs.existsSync(this.BACKUP_DIR)) {
      fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
      console.log(`📁 Created backup directory: ${this.BACKUP_DIR}`);
    }
  }

  /**
   * Generate fetch summary
   */
  private generateSummary(): FetchSummary {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    return {
      total: this.results.length,
      successful,
      failed,
      results: this.results,
      errors: this.errors
    };
  }

  /**
   * Generate and save report
   */
  private generateReport(summary: FetchSummary): void {
    const reportPath = path.join(this.OUTPUT_DIR, 'fetch-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      iconMapping: iconMapping,
      iconConfig: iconConfig
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 Report saved: ${reportPath}`);
  }

  /**
   * Backup existing icons
   */
  async backupExistingIcons(): Promise<void> {
    console.log('💾 Backing up existing icons...');
    
    if (!fs.existsSync(this.OUTPUT_DIR)) {
      console.log('ℹ️ No existing icons to backup');
      return;
    }
    
    const files = fs.readdirSync(this.OUTPUT_DIR)
      .filter(file => file.endsWith('.svg'));
    
    if (files.length === 0) {
      console.log('ℹ️ No SVG files to backup');
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSubDir = path.join(this.BACKUP_DIR, timestamp);
    fs.mkdirSync(backupSubDir, { recursive: true });
    
    for (const file of files) {
      const sourcePath = path.join(this.OUTPUT_DIR, file);
      const backupPath = path.join(backupSubDir, file);
      fs.copyFileSync(sourcePath, backupPath);
    }
    
    console.log(`✅ Backed up ${files.length} icons to ${backupSubDir}`);
  }

  /**
   * Validate existing icons against mapping
   */
  async validateExistingIcons(): Promise<{
    valid: string[];
    missing: string[];
    extra: string[];
  }> {
    console.log('🔍 Validating existing icons...');
    
    const expectedIcons = Object.keys(iconMapping.mapping);
    const existingFiles = fs.existsSync(this.OUTPUT_DIR) 
      ? fs.readdirSync(this.OUTPUT_DIR)
          .filter(file => file.endsWith('.svg'))
          .map(file => file.replace('.svg', ''))
      : [];
    
    const valid = expectedIcons.filter(name => existingFiles.includes(name));
    const missing = expectedIcons.filter(name => !existingFiles.includes(name));
    const extra = existingFiles.filter(name => !expectedIcons.includes(name));
    
    console.log(`✅ Valid icons: ${valid.length}`);
    console.log(`❌ Missing icons: ${missing.length}`);
    console.log(`⚠️ Extra icons: ${extra.length}`);
    
    if (missing.length > 0) {
      console.log('Missing icons:', missing.join(', '));
    }
    
    if (extra.length > 0) {
      console.log('Extra icons:', extra.join(', '));
    }
    
    return { valid, missing, extra };
  }

  /**
   * Clean up unused icons
   */
  async cleanupIcons(): Promise<void> {
    console.log('🧹 Cleaning up unused icons...');
    
    const validation = await this.validateExistingIcons();
    
    if (validation.extra.length === 0) {
      console.log('ℹ️ No unused icons to clean up');
      return;
    }
    
    for (const iconName of validation.extra) {
      const filepath = path.join(this.OUTPUT_DIR, `${iconName}.svg`);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`🗑️ Removed unused icon: ${iconName}`);
      }
    }
    
    console.log(`✅ Cleaned up ${validation.extra.length} unused icons`);
  }

  /**
   * Utility: Add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Command line interface
 */
export async function runIconFetchCLI(): Promise<void> {
  const fetcher = new iKanIconFetcher();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'fetch';
  
  try {
    switch (command) {
      case 'fetch':
        console.log('🎨 Fetching all icons...');
        const summary = await fetcher.fetchAllIcons();
        console.log('\n📊 Fetch Summary:');
        console.log(`Total: ${summary.total}`);
        console.log(`Successful: ${summary.successful}`);
        console.log(`Failed: ${summary.failed}`);
        
        if (summary.errors.length > 0) {
          console.log('\n❌ Errors:');
          summary.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        process.exit(summary.failed > 0 ? 1 : 0);
        
      case 'validate':
        console.log('🔍 Validating existing icons...');
        await fetcher.validateExistingIcons();
        process.exit(0);
        
      case 'backup':
        console.log('💾 Backing up existing icons...');
        await fetcher.backupExistingIcons();
        process.exit(0);
        
      case 'cleanup':
        console.log('🧹 Cleaning up unused icons...');
        await fetcher.cleanupIcons();
        process.exit(0);
        
      case 'full':
        console.log('🚀 Running full icon management process...');
        await fetcher.backupExistingIcons();
        const fullSummary = await fetcher.fetchAllIcons();
        await fetcher.cleanupIcons();
        console.log('✅ Full process completed');
        process.exit(fullSummary.failed > 0 ? 1 : 0);
        
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  fetch    - Fetch all icons from Iconify');
        console.log('  validate - Validate existing icons');
        console.log('  backup   - Backup existing icons');
        console.log('  cleanup  - Remove unused icons');
        console.log('  full     - Run complete process (backup, fetch, cleanup)');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Icon fetch CLI error:', error);
    process.exit(1);
  }
}

// Export singleton instance
export const iconFetcher = new iKanIconFetcher();

// Run CLI if this file is executed directly
if (require.main === module) {
  runIconFetchCLI();
}

/**
 * Usage Examples:
 * 
 * // Run in code
 * import { iconFetcher } from './scripts/fetch-icons';
 * const summary = await iconFetcher.fetchAllIcons();
 * 
 * // Run from command line
 * npx ts-node scripts/fetch-icons.ts fetch
 * npx ts-node scripts/fetch-icons.ts validate
 * npx ts-node scripts/fetch-icons.ts backup
 * npx ts-node scripts/fetch-icons.ts cleanup
 * npx ts-node scripts/fetch-icons.ts full
 */