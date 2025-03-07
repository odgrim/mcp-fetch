import puppeteer from 'puppeteer';
import TurndownService from 'turndown';

/**
 * Options for fetching a URL
 */
export interface FetchOptions {
  /**
   * Timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
  
  /**
   * CSS selector to wait for before extracting content
   */
  waitForSelector?: string;
  
  /**
   * Whether to include image references in the markdown
   * @default false
   */
  includeImages?: boolean;
  
  /**
   * User agent string to use
   * @default 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
   */
  userAgent?: string;
}

/**
 * Result of fetching a URL
 */
export interface FetchResult {
  /**
   * The URL that was fetched
   */
  url: string;
  
  /**
   * The page content as markdown
   */
  markdown: string;
  
  /**
   * The page title
   */
  title: string;
  
  /**
   * Metadata extracted from the page
   */
  metadata: {
    description?: string;
    author?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Configure the Turndown service for HTML to Markdown conversion
 */
function configureTurndown(includeImages: boolean): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  });
  
  // Remove scripts and style elements
  turndownService.remove(['script', 'style', 'noscript', 'iframe']);
  
  // Handle images based on configuration
  if (!includeImages) {
    turndownService.remove(['img']);
  }
  
  return turndownService;
}

/**
 * Extract metadata from the page
 */
async function extractMetadata(page: puppeteer.Page): Promise<Record<string, string>> {
  const metadata: Record<string, string> = {};
  
  // Extract meta tags
  const metaTags = await page.evaluate(() => {
    const metaElements = document.querySelectorAll('meta');
    const data: Record<string, string> = {};
    
    metaElements.forEach((meta) => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        data[name] = content;
      }
    });
    
    return data;
  });
  
  // Process common meta tags
  if (metaTags['description']) metadata.description = metaTags['description'];
  if (metaTags['author']) metadata.author = metaTags['author'];
  if (metaTags['og:description']) metadata.description = metaTags['og:description'];
  if (metaTags['og:title']) metadata.ogTitle = metaTags['og:title'];
  
  return metadata;
}

/**
 * Fetch a URL and convert it to markdown
 * 
 * @param url The URL to fetch
 * @param options Options for fetching
 * @returns The fetch result with markdown content and metadata
 */
export async function fetchUrl(
  url: string, 
  options: FetchOptions = {}
): Promise<FetchResult> {
  const {
    timeout = 30000,
    waitForSelector,
    includeImages = false,
    userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  } = options;
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(userAgent);
    
    // Navigate to the URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout
    });
    
    // Wait for selector if specified
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout });
    }
    
    // Get page title
    const title = await page.title();
    
    // Extract metadata
    const metadata = await extractMetadata(page);
    
    // Get the HTML content
    const html = await page.evaluate(() => {
      // Find the main content - this is a simple heuristic and can be improved
      const mainContent = document.querySelector('main') || 
                        document.querySelector('article') || 
                        document.querySelector('#content') || 
                        document.querySelector('.content') || 
                        document.body;
                        
      return mainContent.innerHTML;
    });
    
    // Configure turndown
    const turndownService = configureTurndown(includeImages);
    
    // Convert HTML to markdown
    const markdown = turndownService.turndown(html);
    
    return {
      url,
      markdown,
      title,
      metadata
    };
  } finally {
    await browser.close();
  }
}

/**
 * Fetch multiple URLs in parallel
 * 
 * @param urls List of URLs to fetch
 * @param options Options for fetching
 * @returns Map of URL to fetch results
 */
export async function fetchMultipleUrls(
  urls: string[], 
  options: FetchOptions = {}
): Promise<Map<string, FetchResult>> {
  const results = new Map<string, FetchResult>();
  
  // Fetch all URLs in parallel
  const fetchPromises = urls.map(async (url) => {
    try {
      const result = await fetchUrl(url, options);
      results.set(url, result);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
  });
  
  await Promise.all(fetchPromises);
  return results;
} 