#!/usr/bin/env node

/**
 * Copy Assets Script for Netlify Deployment
 * 
 * This script copies the extracted_assets folder to the public directory
 * before building for Netlify. Netlify doesn't support symlinks, so we
 * need to copy the actual files.
 * 
 * Usage: npm run copy-assets
 */

const fs = require('fs');
const path = require('path');

const ASSETS_SOURCE = path.join(__dirname, '../../extracted_assets');
const ASSETS_DEST = path.join(__dirname, '../public/extracted_assets');

console.log('📦 Copying assets for Netlify deployment...');
console.log(`Source: ${ASSETS_SOURCE}`);
console.log(`Destination: ${ASSETS_DEST}`);

// Check if source exists
if (!fs.existsSync(ASSETS_SOURCE)) {
  console.warn('⚠️  Warning: extracted_assets folder not found!');
  console.warn('   Assets will not be available in the build.');
  console.warn('   If deploying to Netlify, assets must be uploaded separately or hosted on CDN.');
  process.exit(0); // Don't fail the build, just warn
}

// Remove existing destination if it exists
if (fs.existsSync(ASSETS_DEST)) {
  console.log('🗑️  Removing existing assets...');
  fs.rmSync(ASSETS_DEST, { recursive: true, force: true });
}

// Create destination directory
fs.mkdirSync(ASSETS_DEST, { recursive: true });

// Copy files recursively
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    // Create directory
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Copy all files in directory
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('📁 Copying files...');
  copyRecursive(ASSETS_SOURCE, ASSETS_DEST);
  
  // Count files
  let fileCount = 0;
  function countFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        countFiles(filePath);
      } else {
        fileCount++;
      }
    });
  }
  countFiles(ASSETS_DEST);
  
  console.log(`✅ Successfully copied ${fileCount} asset files!`);
  console.log('🚀 Ready for Netlify build.');
} catch (error) {
  console.error('❌ Error copying assets:', error.message);
  console.error('⚠️  Build will continue, but assets may not be available.');
  process.exit(0); // Don't fail the build
}
