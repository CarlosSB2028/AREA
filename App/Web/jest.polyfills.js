// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, { TextEncoder, TextDecoder });

const mockCrypto = {
  subtle: {
    generateKey: jest.fn().mockResolvedValue({ type: 'secret' }),
    importKey: jest.fn().mockResolvedValue({ type: 'secret' }),
    exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    encrypt: jest.fn().mockImplementation(() => {
      const result = new ArrayBuffer(48);
      const view = new Uint8Array(result);
      for (let i = 0; i < view.length; i++) {
        view[i] = 65 + (i % 26);
      }
      return Promise.resolve(result);
    }),
    decrypt: jest.fn().mockImplementation(() => {
      const encoder = new TextEncoder();
      return Promise.resolve(encoder.encode('test-token'));
    }),
  },
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});