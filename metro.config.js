const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json', 'wasm', 'svg');

// Reset cache configuration
config.resetCache = true;

module.exports = config;