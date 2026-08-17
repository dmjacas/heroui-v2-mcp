import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {z} from "zod";

import {COMPONENTS_PACKAGES_DIR} from "../constants";
import {assertValidComponent, resolvePackageDir} from "../lib/components";
import {fetchRawFile, listDirectory} from "../lib/github";
import {errorResult, textResult} from "../lib/tool-result";

export function registerGetComponentSourceCode(server: McpServer): void {
  server.registerTool(
    "get_component_source_code",
    {
      description: `Get the React/TypeScript source implementation of a HeroUI v2 component from
packages/components/<pkg>/src on GitHub. Useful for understanding internals, hooks and ARIA wiring.
Do NOT copy this directly — import the component from @heroui/react or its individual package instead.
Use list_components first to get a valid slug.`,
      inputSchema: {
        component: z.string().describe('Component slug as returned by list_components, e.g. "button".'),
      },
    },
    async ({component}) => {
      try {
        await assertValidComponent(component);

        const pkgDir = resolvePackageDir(component);
        const srcPath = `${COMPONENTS_PACKAGES_DIR}/${pkgDir}/src`;
        const entries = await listDirectory(srcPath);
        const files = entries.filter((e) => e.type === "file" && /\.tsx?$/.test(e.name));

        if (files.length === 0) {
          return textResult(`No source files found under ${srcPath}.`);
        }

        const contents = await Promise.all(files.map((f) => fetchRawFile(`${srcPath}/${f.name}`)));

        let text = `# ${component} Source Code (@heroui/${pkgDir})\n\n`;
        files.forEach((file, i) => {
          text += `## ${file.name}\n\n\`\`\`tsx\n${contents[i]}\n\`\`\`\n\n`;
        });
        text += `GitHub: https://github.com/heroui-inc/heroui/tree/main/${srcPath}\n`;

        return textResult(text);
      } catch (error) {
        return errorResult(error, `Unable to get source code for component "${component}".`);
      }
    },
  );
}
