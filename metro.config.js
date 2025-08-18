const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push(
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg'
);

// Add support for additional source extensions
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Clear watchman and metro cache
config.resetCache = true;

module.exports = config;