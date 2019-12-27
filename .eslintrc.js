module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ['jest'],
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'no-prototype-builtins': 'off',
    'node/no-callback-literal': 'error',
    'node/prefer-global/process': ['error', 'always'],
    'node/exports-style': ['error', 'module.exports']
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'node/prefer-global/process': 'error',
        'node/exports-style': ['error', 'module.exports']
      }
    }
  ]
};
