import { jest } from '@jest/globals';

// Mock browser objects
const mockEvaluate = jest.fn((fn) => {
  if (typeof fn === 'function' && fn.toString().includes('metaElements')) {
    return Promise.resolve({
      'description': 'This is a test page',
      'author': 'Test Author',
      'og:title': 'Test OG Title'
    });
  }
  return Promise.resolve('<h1>Test Page</h1><p>This is a test paragraph</p>');
});

const mockPage = {
  setViewport: jest.fn().mockResolvedValue(undefined),
  setUserAgent: jest.fn().mockResolvedValue(undefined),
  goto: jest.fn().mockResolvedValue(undefined),
  waitForSelector: jest.fn().mockResolvedValue(undefined),
  title: jest.fn().mockResolvedValue('Test Page'),
  evaluate: mockEvaluate
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined)
};

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue(mockBrowser)
}), { virtual: true });

// Mock turndown
jest.mock('turndown', () => {
  return jest.fn().mockImplementation(() => ({
    remove: jest.fn(),
    turndown: jest.fn().mockReturnValue('# Test Page\n\nThis is a test paragraph')
  }))
}, { virtual: true });

// Store references to the mocks
global.__mocks__ = {
  puppeteer: {
    mockBrowser,
    mockPage,
    mockEvaluate
  }
};

// Clean up all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 