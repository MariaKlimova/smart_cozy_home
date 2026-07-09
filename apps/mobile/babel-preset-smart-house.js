const path = require('path');

const projectRoot = path.dirname(require.resolve('./babel.config.js'));

function requireFromProject(moduleId) {
  return require(require.resolve(moduleId, { paths: [projectRoot] }));
}

/**
 * Обёртка над babel-preset-expo для npm workspaces.
 * Hoisted babel-preset-expo в корне монорепо не видит пакеты из apps/mobile,
 * поэтому вручную добавляем expo-router и worklets plugins.
 */
module.exports = function smartHouseBabelPreset(api, options = {}) {
  const expoConfig = requireFromProject('babel-preset-expo')(api, options);
  const { expoRouterBabelPlugin } = requireFromProject(
    'babel-preset-expo/build/expo-router-plugin'
  );
  const workletsPlugin = requireFromProject('react-native-worklets/plugin');

  const presetPlugins = (expoConfig.plugins ?? []).filter(Boolean);

  return {
    presets: expoConfig.presets,
    plugins: [expoRouterBabelPlugin, ...presetPlugins, workletsPlugin],
  };
};
