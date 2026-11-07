/**
 * Mock for @react-native-cookies/cookies
 * Provides cookie management functionality for tests
 */

export default {
  clearAll: jest.fn(() => Promise.resolve(true)),
  clearByName: jest.fn(() => Promise.resolve(true)),
  flush: jest.fn(() => Promise.resolve(true)),
  get: jest.fn(() => Promise.resolve({})),
  getAll: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve(true)),
  setFromResponse: jest.fn(() => Promise.resolve(true)),
};
