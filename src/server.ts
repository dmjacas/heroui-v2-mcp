#!/usr/bin/env node
/**
 * HeroUI v2 MCP Server
 *
 * Standalone stdio MCP server that fetches HeroUI v2 (https://v2.heroui.com) component
 * documentation, source code, style definitions and theme tokens directly from
 * heroui-inc/heroui@main on GitHub. No external API, database or deployment required —
 * everything is fetched on demand and cached in-memory for the lifetime of the process.
 */
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

import {registerAllTools} from "./tools/index";

const SERVER_INSTRUCTIONS = `## HeroUI v2 MCP Tools

These tools provide documentation for **HeroUI v2** (https://v2.heroui.com) React components,
sourced live from heroui-inc/heroui@main on GitHub.

### ⚠️ Version scope
This MCP covers HeroUI **v2 ONLY**. It does not know about HeroUI v3 (https://heroui.com), which
uses a different, incompatible component model (compound components, React Aria Components,
Tailwind v4). If you need v3 docs, use a v3-targeted MCP or https://heroui.com instead.

### Essential workflow
1. **list_components** — get the exact component slug (matches the URL on v2.heroui.com/docs/components/<slug>)
2. **get_component_docs** — description, install command, imports, usage guidance and props/API table
3. **get_component_source_code** — React/TypeScript implementation (optional, for learning/debugging)
4. **get_component_source_styles** — the component's tailwind-variants style definition (optional, for theming)
5. **get_docs** — general guides: installation, frameworks, theming, CLI, HeroUIProvider, etc.
6. **get_theme_variables** — default semantic colors and layout tokens

### Key facts about v2
• Requires wrapping the app in \`<HeroUIProvider>\` (see get_docs({ path: "api-references/heroui-provider" }))
• Components ship both bundled (\`@heroui/react\`) and as individual packages (e.g. \`@heroui/button\`)
• Styling is done via tailwind-variants ("tv") definitions, no separate CSS files
• See get_docs({ path: "guide/installation" }) to get started`;

async function createServer(): Promise<McpServer> {
  const server = new McpServer(
    {name: "heroui-v2-mcp", version: "0.1.0"},
    {
      instructions: SERVER_INSTRUCTIONS,
      capabilities: {tools: {listChanged: true}},
    },
  );

  registerAllTools(server);

  return server;
}

async function main() {
  try {
    const server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("HeroUI v2 MCP Server running on STDIO");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
