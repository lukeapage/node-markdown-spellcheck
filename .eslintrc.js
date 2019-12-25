module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ['mocha'],
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'no-prototype-builtins': ['off'],
    'node/no-callback-literal': 'error',
    'node/prefer-global/process': ['error', 'always'],
    'node/exports-style': ['error', 'module.exports']
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      extends: ['plugin:mocha/recommended'],
      rules: {
        'node/no-unpublished-require': ['off'],
        'mocha/no-mocha-arrows': ['off']
      }
    }
  ]
};
