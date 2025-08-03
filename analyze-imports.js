#!/usr/bin/env node

// Simple script to analyze imports and exports in the project
// This complements ESLint by providing additional analysis

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🔍 Analyzing imports and exports in your project...\n');

// Check if shrimpit is installed globally
try {
  execSync('shrimpit --help', { stdio: 'ignore' });
  console.log('✅ Shrimpit found! Running comprehensive analysis...\n');
  
  // Run shrimpit analysis
  console.log('🔍 Shrimpit Analysis (Unused Exports):');
  try {
    const shrimpitOutput = execSync('shrimpit src --json', { encoding: 'utf8' });
    const analysis = JSON.parse(shrimpitOutput);
    
    if (analysis.length === 0) {
      console.log('✅ No unused exports found!');
    } else {
      console.log('⚠️  Found potential unused exports:');
      analysis.forEach(item => {
        console.log(`   - ${item.file}: ${item.exports.join(', ')}`);
      });
    }
  } catch (error) {
    console.log('❌ Error running shrimpit analysis:', error.message);
  }
  
  console.log('\n🌳 File Tree with Dependencies:');
  try {
    execSync('shrimpit src --tree', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Error generating dependency tree:', error.message);
  }
  
} catch (error) {
  console.log('⚠️  Shrimpit not found globally. Install with: npm i -g shrimpit');
  console.log('   For now, using ESLint analysis only.\n');
}

// Run ESLint analysis
console.log('\n🔧 Running ESLint analysis...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
} catch (error) {
  // ESLint will exit with code 1 if there are linting errors, which is expected
  console.log('\n✅ ESLint analysis complete!');
}

console.log('\n📋 Summary:');
console.log('- ESLint checked for unused imports, duplicate imports, and import ordering');
console.log('- Run "npm run lint:fix" to automatically fix many issues');
console.log('- Install shrimpit globally for additional unused export analysis');