#!/bin/bash

# This script demonstrates different ways to run mcp-fetch with npx

echo "Running mcp-fetch with npx (stdio transport)..."
echo "Press Ctrl+C to stop the server and try the next example"
npx .

echo "Running mcp-fetch with npx (SSE transport)..."
echo "Press Ctrl+C to stop the server and try the next example"
npx . --sse

echo "Running mcp-fetch with npx (SSE transport, custom port)..."
echo "Press Ctrl+C to stop the server"
npx . --sse --port=3001

# When the package is published to npm, you can run it directly:
# npx @odgrim/mcp-fetch
# npx @odgrim/mcp-fetch --sse
# npx @odgrim/mcp-fetch --sse --port=3001 