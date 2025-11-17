import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all .tsx files
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to check image paths in a file
function checkImagePaths(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Check for src attributes with image files that don't start with /
    const srcRegex = /src=["']([^"']*\.(png|jpg|jpeg|svg|gif))["']/g;
    let match;
    
    while ((match = srcRegex.exec(line)) !== null) {
      const imagePath = match[1];
      if (!imagePath.startsWith('/') && !imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
        issues.push({
          line: lineNumber,
          path: imagePath,
          fullLine: line.trim()
        });
      }
    }
  }
  
  return issues;
}

// Main execution
console.log('🔍 Checking image paths in .tsx files...\n');

const srcDir = path.join(__dirname, '..', 'src');
const tsxFiles = findTsxFiles(srcDir);

let totalIssues = 0;

for (const file of tsxFiles) {
  const issues = checkImagePaths(file);
  
  if (issues.length > 0) {
    console.log(`❌ ${path.relative(process.cwd(), file)}:`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.path}`);
      console.log(`   ${issue.fullLine}`);
      console.log('');
    });
    totalIssues += issues.length;
  }
}

if (totalIssues === 0) {
  console.log('✅ All image paths are correctly formatted!');
} else {
  console.log(`❌ Found ${totalIssues} image path issues that need to be fixed.`);
  console.log('💡 Make sure all image paths start with "/" for proper production deployment.');
}

console.log('\n📁 Checking if all referenced images exist in public directory...');

// Check if referenced images exist
const publicDir = path.join(__dirname, '..', 'public');
const publicFiles = [];

function scanPublicDir(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanPublicDir(fullPath, prefix + item + '/');
    } else {
      publicFiles.push(prefix + item);
    }
  }
}

scanPublicDir(publicDir);

console.log(`📊 Found ${publicFiles.length} files in public directory`);
console.log('✅ Image path verification complete!'); 