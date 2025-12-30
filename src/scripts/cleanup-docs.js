const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '..'); // Root directory
const ARCHIVE_DIR = path.join(__dirname, '..', 'docs', 'archive');
const EXCLUDE_FILES = [
  'README.md',
  'Guidelines.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'pull_request_template.md'
];

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  console.log(`Creating archive directory: ${ARCHIVE_DIR}`);
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Get all files in root
fs.readdir(SOURCE_DIR, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  let movedCount = 0;

  files.forEach(file => {
    // Check if it's a markdown file
    if (path.extname(file).toLowerCase() === '.md') {
      // Check if it should be excluded
      if (!EXCLUDE_FILES.includes(file) && !file.startsWith('.')) {
        const sourcePath = path.join(SOURCE_DIR, file);
        const destPath = path.join(ARCHIVE_DIR, file);

        try {
          fs.renameSync(sourcePath, destPath);
          console.log(`Moved: ${file} -> docs/archive/`);
          movedCount++;
        } catch (moveErr) {
          console.error(`Failed to move ${file}:`, moveErr);
        }
      }
    }
  });

  console.log(`\nCleanup complete! Moved ${movedCount} files to docs/archive/`);
});
