import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchUrl, FetchOptions } from "./fetcher.js";
import { URL } from "url";

// Define the type for fetch tool arguments
interface FetchUrlArgs {
  url: string;
  timeout?: number;
  waitForSelector?: string;
  includeImages?: boolean;
}

// Variables type from MCP SDK
interface Variables {
  [key: string]: string | string[];
}

// Create an MCP server
export const server = new McpServer({
  name: "mcp-fetch",
  version: "0.1.0"
});

// Add a tool to fetch a URL and convert to markdown
server.tool(
  "fetch-url",
  "Fetch a URL using Puppeteer and return the content as markdown",
  {
    url: z.string().url().describe("The URL to fetch"),
    timeout: z.number().int().positive().optional().describe("Timeout in milliseconds (default: 30000)"),
    waitForSelector: z.string().optional().describe("CSS selector to wait for"),
    includeImages: z.boolean().optional().describe("Whether to include image references in markdown (default: false)")
  },
  async (args: FetchUrlArgs) => {
    try {
      const options: FetchOptions = {
        timeout: args.timeout,
        waitForSelector: args.waitForSelector,
        includeImages: args.includeImages
      };
      
      const result = await fetchUrl(args.url, options);
      
      return {
        content: [{ 
          type: "text", 
          text: `# ${result.title}\n\n${result.markdown}`
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching ${args.url}: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Create a resource template for fetch URIs
const fetchTemplate = new ResourceTemplate("fetch://{url}", {
  list: async () => {
    // We don't provide a list of predefined resources for fetch
    return {
      resources: []
    };
  }
});

// Register the template with the server
server.resource(
  "fetch-template",
  fetchTemplate,
  async (uri: URL, variables: Variables) => {
    try {
      // Decode the URL from the URI
      const encodedUrl = variables.url as string;
      const url = decodeURIComponent(encodedUrl);
      
      if (!url) {
        throw new Error("Invalid URL");
      }
      
      // Fetch the URL
      const result = await fetchUrl(url);
      
      return {
        contents: [{
          uri: decodeURIComponent(uri.href),
          text: `# ${result.title}\n\n${result.markdown}`,
          mimeType: "text/markdown"
        }]
      };
    } catch (error) {
      throw new Error(`Error fetching URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
); 