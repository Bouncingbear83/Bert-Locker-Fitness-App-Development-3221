module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.js', 'vite.config.js', 'postcss.config.js', 'tailwind.config.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react-refresh',
    '@typescript-eslint'
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off'
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};