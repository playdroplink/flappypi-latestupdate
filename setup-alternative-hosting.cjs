#!/usr/bin/env node

/**
 * Alternative Image Hosting Setup Script
 * Provides ready-to-use URLs for different hosting options
 */

const fs = require('fs');

console.log('🚀 Alternative Image Hosting Implementation');
console.log('='.repeat(50));

// Check if image exists
if (!fs.existsSync('public/image.png')) {
    console.log('❌ Error: public/image.png not found');
    process.exit(1);
}

const imageStats = fs.statSync('public/image.png');
console.log(`📁 Current image: ${(imageStats.size / 1024).toFixed(2)} KB`);

console.log('\n🎯 Option 1: GitHub Raw (IMPLEMENTED)');
console.log('   🔗 URL: https://raw.githubusercontent.com/playdroplink/flappypi-testnettoken/main/public/image.png');
console.log('   📋 To commit and push:');
console.log('      git add public/image.png public/.well-known/pi.toml');
console.log('      git commit -m "Add FLPY token image with GitHub Raw URL"');
console.log('      git push origin main');

console.log('\n🎯 Option 2: Imgur Upload');
console.log('   🌐 Visit: https://imgur.com/upload');
console.log('   📤 Upload: public/image.png');
console.log('   📋 After upload, use direct link in format:');
console.log('      https://i.imgur.com/XXXXXXX.png');

console.log('\n🎯 Option 3: Cloudinary Upload');
console.log('   🌐 Visit: https://cloudinary.com');
console.log('   📤 Upload: public/image.png');
console.log('   📋 Use auto-generated URL in format:');
console.log('      https://res.cloudinary.com/[cloud-name]/image/upload/[version]/[public-id].png');

console.log('\n🎯 Option 4: IPFS (Pinata)');
console.log('   🌐 Visit: https://app.pinata.cloud');
console.log('   📤 Upload: public/image.png');
console.log('   📋 Use gateway URL in format:');
console.log('      https://gateway.pinata.cloud/ipfs/[hash]');

console.log('\n🔧 To switch to alternative hosting:');
console.log('1. Upload image to chosen service');
console.log('2. Copy the direct image URL');
console.log('3. Run: node update-image-url.cjs [NEW_URL]');

// Create update script
const updateScript = `#!/usr/bin/env node

const fs = require('fs');
const newUrl = process.argv[2];

if (!newUrl) {
    console.log('Usage: node update-image-url.cjs [IMAGE_URL]');
    process.exit(1);
}

console.log('🔄 Updating token image URL...');
console.log('🔗 New URL:', newUrl);

try {
    let piToml = fs.readFileSync('public/.well-known/pi.toml', 'utf8');
    piToml = piToml.replace(/image="[^"]*"/g, \`image="\${newUrl}"\`);
    fs.writeFileSync('public/.well-known/pi.toml', piToml);
    console.log('✅ pi.toml updated successfully!');
    console.log('📋 Next: Deploy to production');
} catch (error) {
    console.log('❌ Error updating pi.toml:', error.message);
}`;

fs.writeFileSync('update-image-url.cjs', updateScript);

console.log('\n✅ Ready to deploy!');
console.log('📋 Current configuration uses GitHub Raw URL');
console.log('🚀 Commit and push to activate the GitHub Raw hosting');