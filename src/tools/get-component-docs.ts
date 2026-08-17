import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {z} from "zod";

import {DOCS_COMPONENTS_DIR} from "../constants";
import {assertValidComponent, resolvePackageName} from "../lib/components";
import {fetchRawFile} from "../lib/github";
import {cleanMdxBody, extractApiTables, extractImportCommands, parseFrontmatter} from "../lib/mdx";
import {errorResult, textResult} from "../lib/tool-result";

export function registerGetComponentDocs(server: McpServer): void {
  server.registerTool(
    "get_component_docs",
    {
      description: `Get the full HeroUI v2 documentation for a single component: description, install command,
import statements, usage guidance and the props/API reference table.
Use list_components first to get valid slugs (e.g. "button", "date-range-picker").`,
      inputSchema: {
        component: z
          .string()
          .describe('Component slug as returned by list_components, e.g. "button" or "date-picker".'),
      },
    },
    async ({component}) => {
      try {
        await assertValidComponent(component);

        const raw = await fetchRawFile(`${DOCS_COMPONENTS_DIR}/${component}.mdx`);
        const {title, description, body} = parseFrontmatter(raw);
        const apiTables = extractApiTables(body);
        const imports = extractImportCommands(body);
        const packageName = resolvePackageName(component);

        let text = `# ${title ?? component} (HeroUI v2)\n\n`;
        if (description) text += `${description}\n\n`;
        text += `**Package:** \`${packageName}\`\n`;
        text += `**Install:** \`npm install ${packageName}\`\n`;
        if (imports.main) text += `**Import (from @heroui/react):** \`${imports.main}\`\n`;
        if (imports.individual) text += `**Import (standalone package):** \`${imports.individual}\`\n`;
        text += `\n---\n\n${cleanMdxBody(body)}`;

        if (apiTables.length > 0) {
          text += `\n\n---\n\n## Props Reference\n`;
          for (const table of apiTables) {
            text += `\n### ${table.heading}\n\n| Attribute | Type | Default | Description |\n|---|---|---|---|\n`;
            for (const row of table.rows) {
              const attribute = row.attribute ?? "";
              const type = (row.type ?? "").replace(/\|/g, "\\|");
              const def = row.default ?? "-";
              const desc = (row.description ?? "").replace(/\|/g, "\\|");
              text += `| \`${attribute}\` | \`${type}\` | \`${def}\` | ${desc} |\n`;
            }
          }
        }

        return textResult(text);
      } catch (error) {
        return errorResult(error, `Unable to get docs for component "${component}".`);
      }
    },
  );
}
