# MCP Fetch

A TypeScript implementation of an MCP server that fetches web content using Puppeteer and converts it to markdown.

## Features

- Uses Puppeteer to fetch and render web pages, including JavaScript-heavy sites
- Extracts text content from web pages
- Converts HTML content to Markdown format
- Provides both stdio and SSE transport for MCP communication
- Exposes a simple API for integration with agentic systems

## Installation

```bash
npm install @odgrim/mcp-fetch
```

Or install globally:

```bash
npm install -g @odgrim/mcp-fetch
```

## Usage

### As an MCP server with stdio transport

```bash
mcp-fetch
```

### As an MCP server with SSE transport

```bash
mcp-fetch --sse
```

You can specify a custom port:

```bash
mcp-fetch --sse --port=3001
```

### Running with npx (without installing)

You can run the package directly using npx without installing it:

```bash
# Run with stdio transport
npx @odgrim/mcp-fetch

# Run with SSE transport
npx @odgrim/mcp-fetch --sse

# Run with SSE transport on a specific port
npx @odgrim/mcp-fetch --sse --port=3001
```

If you're in the project directory during development:

```bash
# Run with stdio transport
npx .

# Run with SSE transport
npx . --sse
```

### As a library

```typescript
import { fetchUrl } from '@odgrim/mcp-fetch';

// Fetch a URL and convert to markdown
const result = await fetchUrl('https://example.com');
console.log(result.markdown);
```

## API

### MCP Tools

#### `fetch-url`

Fetches a URL using Puppeteer and returns the content as markdown.

**Parameters:**
- `url` (string): The URL to fetch
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)
- `waitForSelector` (string, optional): CSS selector to wait for
- `includeImages` (boolean, optional): Whether to include image references in markdown (default: false)

**Returns:**
- Markdown representation of the page content

#### `fetch-resources`

Resource URI pattern: `fetch://{url}`

Fetches a URL and returns the content.

## Development

### Prerequisites

- Node.js 14.16.0 or later

### Setup

```bash
git clone https://github.com/odgrim/mcp-fetch.git
cd mcp-fetch
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

### Run in development mode

```bash
npm run dev
```

## License

MPL-2.0 
