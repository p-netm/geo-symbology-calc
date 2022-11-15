module.exports = {
  rootDir: './',
  roots: ['packages'],
  testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  setupFiles: ['./setupTests'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  }
};
