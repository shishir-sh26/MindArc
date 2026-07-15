const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'svg' to assetExtensions to allow require('./file.svg') to return asset module IDs
config.resolver.assetExts.push('svg');

module.exports = config;
