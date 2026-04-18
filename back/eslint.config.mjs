import node from 'eslightning/node'
import jestPlugin from 'eslint-plugin-jest'

export default [
  {
    ignores: ['**/*', '!src/**', '!__tests__/**', '**/*.e2e-spec.ts'],
  },
  ...node,
  {
    files: ['**/*.test.ts'],
    ...jestPlugin.configs['flat/recommended'],
  },
  {
    rules: {
      'lines-between-class-members': 'off',
    },
  },
]
