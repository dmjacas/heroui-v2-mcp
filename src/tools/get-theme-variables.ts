import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {fetchRawFile} from "../lib/github";
import {errorResult, textResult} from "../lib/tool-result";

const SEMANTIC_COLORS_PATH = "packages/core/theme/src/colors/semantic.ts";
const COMMON_COLORS_PATH = "packages/core/theme/src/colors/common.ts";
const LAYOUT_PATH = "packages/core/theme/src/default-layout.ts";

export function registerGetThemeVariables(server: McpServer): void {
  server.registerTool(
    "get_theme_variables",
    {
      description: `Get HeroUI v2's default theme tokens: semantic colors (light/dark) and layout tokens
(radius, border widths, opacity, font sizes, box shadows). Source: heroui-inc/heroui@main, packages/core/theme.
Use get_docs({ path: "customization/theme" }) or get_docs({ path: "customization/colors" }) for the
narrative guide on overriding these via tailwind.config / createTheme.`,
    },
    async () => {
      try {
        const [semantic, common, layout] = await Promise.all([
          fetchRawFile(SEMANTIC_COLORS_PATH),
          fetchRawFile(COMMON_COLORS_PATH),
          fetchRawFile(LAYOUT_PATH),
        ]);

        const text =
          `# HeroUI v2 Default Theme Tokens\n\n` +
          `## Semantic Colors (\`${SEMANTIC_COLORS_PATH}\`)\n\n\`\`\`ts\n${semantic}\n\`\`\`\n\n` +
          `## Common Colors (\`${COMMON_COLORS_PATH}\`)\n\n\`\`\`ts\n${common}\n\`\`\`\n\n` +
          `## Layout Tokens (\`${LAYOUT_PATH}\`)\n\n\`\`\`ts\n${layout}\n\`\`\`\n`;

        return textResult(text);
      } catch (error) {
        return errorResult(error, "Unable to fetch HeroUI v2 theme variables.");
      }
    },
  );
}
