const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

function resolveFromProject(moduleId) {
  return path.dirname(
    require.resolve(`${moduleId}/package.json`, {
      paths: [projectRoot, workspaceRoot],
    })
  );
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  react: resolveFromProject('react'),
  'react-dom': resolveFromProject('react-dom'),
  semver: resolveFromProject('semver'),
};

module.exports = config;
