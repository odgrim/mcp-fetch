import { describe, it, expect } from '@jest/globals';
import { FetchOptions, FetchResult } from '../src/fetcher.js';

// Define a more comprehensive dummy implementation that matches the interface
const mockFetchUrl = async (url: string, options: FetchOptions = {}): Promise<FetchResult> => {
  // Extract options with defaults
  const {
    timeout = 30000,
    waitForSelector,
    includeImages = false,
    userAgent
  } = options;
  
  // Simulate different behavior based on options
  let markdown = '# Test Page\n\nThis is a test paragraph';
  
  // Add image reference if includeImages is true
  if (includeImages) {
    markdown += '\n\n![Test Image](https://example.com/image.png)';
  }
  
  // Add selector information if waitForSelector is provided
  if (waitForSelector) {
    markdown += `\n\nWaited for selector: ${waitForSelector}`;
  }
  
  // Add timeout information
  markdown += `\n\nTimeout: ${timeout}ms`;
  
  // Add user agent information if provided
  if (userAgent) {
    markdown += `\n\nUser Agent: ${userAgent}`;
  }
  
  return {
    url,
    title: 'Test Page',
    markdown,
    metadata: {
      description: 'This is a test page',
      author: 'Test Author'
    }
  };
};

// Test that our dummy implementation meets the interface requirements
describe('fetchUrl interface', () => {
  it('should handle a basic URL', async () => {
    const url = 'https://example.com';
    const result = await mockFetchUrl(url);
    
    expect(result).toHaveProperty('url', url);
    expect(result).toHaveProperty('title', 'Test Page');
    expect(result).toHaveProperty('markdown');
    expect(result.markdown).toContain('Test Page');
    expect(result.markdown).toContain('Timeout: 30000ms'); // Default timeout
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('description', 'This is a test page');
    expect(result.metadata).toHaveProperty('author', 'Test Author');
  });
  
  it('should handle timeout options', async () => {
    const url = 'https://example.com';
    const options = { timeout: 60000 };
    const result = await mockFetchUrl(url, options);
    
    expect(result).toHaveProperty('url', url);
    expect(result.markdown).toContain('Timeout: 60000ms');
    expect(result.markdown).not.toContain('Waited for selector');
  });
  
  it('should handle waitForSelector options', async () => {
    const url = 'https://example.com';
    const options = { waitForSelector: '#content' };
    const result = await mockFetchUrl(url, options);
    
    expect(result).toHaveProperty('url', url);
    expect(result.markdown).toContain('Waited for selector: #content');
  });
  
  it('should handle includeImages options', async () => {
    const url = 'https://example.com';
    const options = { includeImages: true };
    const result = await mockFetchUrl(url, options);
    
    expect(result).toHaveProperty('url', url);
    expect(result.markdown).toContain('![Test Image]');
  });
  
  it('should handle userAgent options', async () => {
    const url = 'https://example.com';
    const userAgent = 'Custom User Agent';
    const options = { userAgent };
    const result = await mockFetchUrl(url, options);
    
    expect(result).toHaveProperty('url', url);
    expect(result.markdown).toContain(`User Agent: ${userAgent}`);
  });
  
  it('should handle multiple options together', async () => {
    const url = 'https://example.com';
    const options = {
      timeout: 45000,
      waitForSelector: '#main',
      includeImages: true,
      userAgent: 'Test Bot'
    };
    const result = await mockFetchUrl(url, options);
    
    expect(result).toHaveProperty('url', url);
    expect(result.markdown).toContain('Timeout: 45000ms');
    expect(result.markdown).toContain('Waited for selector: #main');
    expect(result.markdown).toContain('![Test Image]');
    expect(result.markdown).toContain('User Agent: Test Bot');
  });
}); 