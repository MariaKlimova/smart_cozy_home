const { shareUsageDescription } = require('./src/copy/healthPermissions.js');

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Умный дом',
  slug: 'smart-house',
  owner: 'mariakl5227',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F7F3EE',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.klimova.smart-house',
  },
  android: {
    // Android applicationId не допускает дефис — iOS bundleIdentifier: com.klimova.smart-house
    package: 'com.klimova.smarthouse',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F7F3EE',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'resize',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      '@kingstinct/react-native-healthkit',
      {
        NSHealthShareUsageDescription: shareUsageDescription,
        NSHealthUpdateUsageDescription: false,
        background: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '74410c1c-f0a8-4122-bddf-b2ab2de2b55d',
    },
  },
};

module.exports = config;
