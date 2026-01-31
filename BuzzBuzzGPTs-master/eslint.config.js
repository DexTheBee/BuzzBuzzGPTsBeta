// ESLint v9 Flat Config
// https://eslint.org/docs/latest/use/configure/configuration-files

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Recommended rules
  js.configs.recommended,
  
  // Global configuration
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
        electronAPI: 'readonly',
      },
    },
    
    rules: {
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': 'off',
      'no-undef': 'error',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { 
        avoidEscape: true,
        allowTemplateLiterals: true 
      }],
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
    ],
  },
];
