import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {listComponentSlugs} from "../lib/components";
import {errorResult, textResult} from "../lib/tool-result";

export function registerListComponents(server: McpServer): void {
  server.registerTool(
    "list_components",
    {
      description: `List all HeroUI **v2** components (from v2.heroui.com / heroui-inc/heroui@main).
This MCP only covers HeroUI v2 — it does NOT know about HeroUI v3 (https://heroui.com, "v3" branch).
Always call this first to get the exact slug to pass to get_component_docs / get_component_source_code / get_component_source_styles.
Slugs are the same as the path segment in https://v2.heroui.com/docs/components/<slug>.`,
    },
    async () => {
      try {
        const slugs = await listComponentSlugs();
        const text = `# HeroUI v2 Components (${slugs.length})\n\n${slugs.map((s) => `- ${s}`).join("\n")}`;

        return textResult(text);
      } catch (error) {
        return errorResult(error, "Unable to list HeroUI v2 components.");
      }
    },
  );
}
