const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Network configuration
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return middleware(req, res, next);
    };
  },
};

// Resolver configuration
config.resolver.assetExts.push(
  'ttf', 'otf', 'woff', 'woff2',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
);

config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Clear cache and reset
config.resetCache = true;

module.exports = config;