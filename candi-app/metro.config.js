const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @tanstack/react-query v5 usa ESM nos builds .js mas Metro precisa de CJS.
// O campo "exports" do package.json aponta para build/modern/index.js que o Metro
// não resolve corretamente no Windows. Forçamos o .cjs do build/legacy.
const originalResolveRequest = config.resolver.resolveRequest;
const TANSTACK_CJS_MAP = {
  '@tanstack/react-query': 'node_modules/@tanstack/react-query/build/legacy/index.cjs',
  '@tanstack/query-core': 'node_modules/@tanstack/query-core/build/legacy/index.cjs',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (TANSTACK_CJS_MAP[moduleName]) {
    return {
      filePath: path.resolve(__dirname, TANSTACK_CJS_MAP[moduleName]),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
