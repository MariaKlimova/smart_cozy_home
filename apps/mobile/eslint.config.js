// @ts-check
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const domainLayerRule = {
  files: ['src/domain/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            message: 'Domain-слой не должен зависеть от React',
          },
          {
            name: 'react-native',
            message: 'Domain-слой не должен зависеть от React Native',
          },
        ],
        patterns: [
          {
            group: ['@/features/*', '@/features/**'],
            message: 'Domain не импортирует features — используй config или domain',
          },
          {
            group: ['@/app/*', '@/app/**'],
            message: 'Domain не импортирует app',
          },
          {
            group: ['@/ui/*', '@/ui/**'],
            message: 'Domain не импортирует UI',
          },
          {
            group: ['@/copy/*', '@/copy/**'],
            message: 'Domain не импортирует copy — форматирование в config',
          },
        ],
      },
    ],
  },
};

const haLayerRule = {
  files: ['src/ha/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*', '@/features/**'],
            message: 'HA-слой не импортирует features — используй config или domain',
          },
          {
            group: ['@/app/*', '@/app/**'],
            message: 'HA-слой не импортирует app',
          },
          {
            group: ['@/ui/*', '@/ui/**'],
            message: 'HA-слой не импортирует UI',
          },
        ],
      },
    ],
  },
};

const uiLayerRule = {
  files: [
    'src/features/**/ui/**/*.{ts,tsx}',
    'src/ui/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'home-assistant-js-websocket',
            message: 'HA-логика — в src/ha/ или features/lib, не в UI',
          },
        ],
        patterns: [
          {
            group: ['@/ha/*', '@/ha/**'],
            message: 'UI не импортирует src/ha напрямую — используй hooks в features/lib',
          },
        ],
      },
    ],
  },
};

/** use*.ts — только hooks, утилиты в отдельный lib/*.ts */
const hookFileExportsRule = {
  files: ['src/features/**/lib/use*.ts', 'src/hooks/use*.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ExportNamedDeclaration > FunctionDeclaration[id.name!=/^use/]',
        message: 'Из use*.ts экспортируй только hooks (useXxx) — утилиты в отдельный lib/*.ts',
      },
    ],
  },
};

module.exports = defineConfig([
  expoConfig,
  domainLayerRule,
  haLayerRule,
  uiLayerRule,
  hookFileExportsRule,
  {
    rules: {
      'no-nested-ternary': 'error',
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
