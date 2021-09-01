import { jest } from '@jest/globals';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

describe('Svelte parser test', () => {
  it('should pass', () => {
    expect(1).toBe(1);
  })
});
