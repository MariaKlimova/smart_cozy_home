import type { ExpoConfig } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { shareUsageDescription } = require('./src/copy/healthPermissions.js');

const config: ExpoConfig = {
  name: 'Умный дом',
  slug: 'smart-house',
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
};

export default config;
