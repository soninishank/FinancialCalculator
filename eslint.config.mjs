import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^set[A-Z]',
      }],
      'no-undef': 'error',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'out/**',
      'scripts/**',
      'server/**',
      'src/tests/**',
      'src/setupTests.js',
      'test_*.js',
      'jest.config.js',
      'jest.setup.js',
    ],
  },
]

export default config
