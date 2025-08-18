const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolver configuration
config.resolver.assetExts.push('svg', 'png', 'jpg', 'jpeg', 'gif', 'webp');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

module.exports = config;