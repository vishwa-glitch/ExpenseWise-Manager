const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Add TypeScript support
config.resolver.sourceExts.push('ts', 'tsx');

// Configure transformer to handle TypeScript files and fix expo-sharing issue
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Updated transformIgnorePatterns to properly handle expo packages
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
};

// Handle .ts files in node_modules by treating them as source files
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver configuration to handle TypeScript files in dependencies
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure Metro to transform TypeScript files in node_modules
config.transformer.unstable_allowRequireContext = true;

// Add watchman ignore patterns to avoid watching unnecessary files
config.watchFolders = [];

module.exports = config;