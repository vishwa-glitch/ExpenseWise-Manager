module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      'react-native-reanimated/plugin',
      // Add polyfills for Node.js modules - comprehensive for SDK 53
      ['module-resolver', {
        alias: {
          'crypto': 'react-native-crypto-js',
          'stream': 'readable-stream',
          'buffer': '@craftzdog/react-native-buffer',
          'util': 'util',
          'events': 'events',
          'path': 'path-browserify',
          'fs': false,
          'net': false,
          'tls': false,
          'child_process': false,
        }
      }]
    ]
  };
};
