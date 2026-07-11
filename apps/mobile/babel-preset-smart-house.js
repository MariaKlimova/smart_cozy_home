const path = require('path');

const projectRoot = path.dirname(require.resolve('./babel.config.js'));

function requireFromProject(moduleId) {
  return require(require.resolve(moduleId, { paths: [projectRoot] }));
}

/**
 * Обёртка над babel-preset-expo для npm workspaces.
 * Резолвит preset из apps/mobile, чтобы hoisted-зависимости в корне монорепо
 * корректно находили expo-router и react-native-worklets.
 */
module.exports = function smartHouseBabelPreset(api, options = {}) {
  return requireFromProject('babel-preset-expo')(api, options);
};
