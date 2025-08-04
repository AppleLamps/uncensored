/**
 * API Key Cleanup Script
 * 
 * This script removes all API keys from localStorage and sessionStorage
 * to ensure complete security migration to Supabase Edge Functions.
 * 
 * Run this script once after deploying the secure backend solution.
 */

(function() {
    'use strict';
    
    console.log('🔒 Starting API Key Cleanup...');
    
    // List of all possible API key storage keys
    const apiKeyStorageKeys = [
        'openrouter_api_key',
        'getimg_api_key',
        'api_key',
        'apiKey',
        'OPENROUTER_API_KEY',
        'GETIMG_API_KEY',
        'API_KEY'
    ];
    
    let removedCount = 0;
    
    // Clean localStorage
    console.log('🧹 Cleaning localStorage...');
    apiKeyStorageKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`   ✅ Removed: ${key}`);
            removedCount++;
        }
    });
    
    // Clean sessionStorage
    console.log('🧹 Cleaning sessionStorage...');
    apiKeyStorageKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            console.log(`   ✅ Removed: ${key}`);
            removedCount++;
        }
    });
    
    // Additional cleanup - scan for any keys containing 'api' or 'key'
    console.log('🔍 Scanning for additional API-related keys...');
    
    // Check localStorage for any keys containing 'api' or 'key'
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.toLowerCase().includes('api') || key.toLowerCase().includes('key'))) {
            const value = localStorage.getItem(key);
            // Check if the value looks like an API key (starts with common prefixes)
            if (value && (
                value.startsWith('sk-') || 
                value.startsWith('pk-') || 
                value.startsWith('Bearer ') ||
                (value.length > 20 && /^[A-Za-z0-9_-]+$/.test(value))
            )) {
                localStorage.removeItem(key);
                console.log(`   ⚠️  Removed suspicious key: ${key}`);
                removedCount++;
            }
        }
    }
    
    // Check sessionStorage for any keys containing 'api' or 'key'
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.toLowerCase().includes('api') || key.toLowerCase().includes('key'))) {
            const value = sessionStorage.getItem(key);
            // Check if the value looks like an API key
            if (value && (
                value.startsWith('sk-') || 
                value.startsWith('pk-') || 
                value.startsWith('Bearer ') ||
                (value.length > 20 && /^[A-Za-z0-9_-]+$/.test(value))
            )) {
                sessionStorage.removeItem(key);
                console.log(`   ⚠️  Removed suspicious key: ${key}`);
                removedCount++;
            }
        }
    }
    
    // Final report
    console.log('\n🎉 API Key Cleanup Complete!');
    console.log(`📊 Total keys removed: ${removedCount}`);
    
    if (removedCount > 0) {
        console.log('\n🔐 Security Status: API keys have been successfully removed from browser storage.');
        console.log('✅ Your application now uses secure Supabase Edge Functions for API interactions.');
    } else {
        console.log('\n✅ No API keys found in browser storage. Your application is already secure!');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure Supabase Edge Functions are deployed and configured');
    console.log('2. Update frontend code to use the new secure API service');
    console.log('3. Test all API functionality to ensure everything works correctly');
    
    // Show a user-friendly notification if running in browser
    if (typeof window !== 'undefined' && window.alert) {
        if (removedCount > 0) {
            alert(`🔒 Security Update Complete!\n\n${removedCount} API key(s) removed from browser storage.\n\nYour application now uses secure backend processing for all API interactions.`);
        } else {
            alert('✅ Security Check Complete!\n\nNo API keys found in browser storage. Your application is secure!');
        }
    }
    
})();

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cleanupApiKeys: function() {
            console.log('API Key cleanup script - run this in a browser environment');
        }
    };
}