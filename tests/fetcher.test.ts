import { fetchUrl, FetchResult } from '../src/fetcher.js';
import puppeteer from 'puppeteer';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

// Mock the puppeteer module
jest.mock('puppeteer', () => {
  const mockPage = {
    setViewport: jest.fn().mockResolvedValue(undefined as any),
    setUserAgent: jest.fn().mockResolvedValue(undefined as any),
    goto: jest.fn().mockResolvedValue(undefined as any),
    waitForSelector: jest.fn().mockResolvedValue(undefined as any),
    title: jest.fn().mockResolvedValue('Test Page' as any),
    evaluate: jest.fn().mockImplementation((fn: Function) => {
      // Mock the evaluate function to return different values based on what is evaluated
      if (fn.toString().includes('metaElements')) {
        return {
          'description': 'This is a test page',
          'author': 'Test Author',
          'og:title': 'Test OG Title'
        };
      } else {
        return '<h1>Test Page</h1><p>This is a test paragraph</p>';
      }
    }),
  };
  
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage as any),
    close: jest.fn().mockResolvedValue(undefined as any),
  };
  
  return {
    launch: jest.fn().mockResolvedValue(mockBrowser as any),
  };
});

// Mock the turndown module
jest.mock('turndown', () => {
  return function() {
    return {
      remove: jest.fn(),
      turndown: jest.fn().mockReturnValue('# Test Page\n\nThis is a test paragraph'),
    };
  };
});

describe('fetchUrl', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a URL and convert to markdown', async () => {
    const url = 'https://example.com';
    const result = await fetchUrl(url);
    
    // Assert the result
    expect(result).toBeDefined();
    expect(result.url).toBe(url);
    expect(result.title).toBe('Test Page');
    expect(result.markdown).toBe('# Test Page\n\nThis is a test paragraph');
    expect(result.metadata).toHaveProperty('description', 'This is a test page');
    expect(result.metadata).toHaveProperty('author', 'Test Author');
    
    // Assert puppeteer was called correctly
    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const mockBrowser = await puppeteer.launch();
    expect(mockBrowser.newPage).toHaveBeenCalled();
    
    const mockPage = await mockBrowser.newPage();
    expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1280, height: 800 });
    expect(mockPage.goto).toHaveBeenCalledWith(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    expect(mockPage.evaluate).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should respect the timeout option', async () => {
    const url = 'https://example.com';
    const timeout = 60000;
    await fetchUrl(url, { timeout });
    
    // Get the mock calls
    const mockBrowser = await puppeteer.launch();
    const mockPage = await mockBrowser.newPage();
    
    // Check that timeout was passed to goto
    expect(mockPage.goto).toHaveBeenCalledWith(url, {
      waitUntil: 'networkidle2',
      timeout
    });
  });

  it('should wait for a selector if specified', async () => {
    const url = 'https://example.com';
    const waitForSelector = '#content';
    await fetchUrl(url, { waitForSelector });
    
    // Get the mock calls
    const mockBrowser = await puppeteer.launch();
    const mockPage = await mockBrowser.newPage();
    
    // Check that waitForSelector was called
    expect(mockPage.waitForSelector).toHaveBeenCalledWith(waitForSelector, { timeout: 30000 });
  });
}); 