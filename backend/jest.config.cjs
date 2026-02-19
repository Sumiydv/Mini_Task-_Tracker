module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts']
};
