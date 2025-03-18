/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
      '^.+\.tsx?$': 'ts-jest', // Add TypeScript transformation
      '^.+\.jsx?$': 'babel-jest', // Add Babel transformation for ES6 modules
  },
};