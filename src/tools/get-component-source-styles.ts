import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {z} from "zod";

import {THEME_COMPONENTS_DIR} from "../constants";
import {assertValidComponent, resolvePackageDir} from "../lib/components";
import {fetchRawFile, HttpError} from "../lib/github";
import {errorResult, textResult} from "../lib/tool-result";

export function registerGetComponentSourceStyles(server: McpServer): void {
  server.registerTool(
    "get_component_source_styles",
    {
      description: `Get the default tailwind-variants style definition for a HeroUI v2 component, from
packages/core/theme/src/components on GitHub. HeroUI v2 has no separate CSS files — every component's
slots/variants/compoundVariants are defined as a tailwind-variants ("tv") object in TypeScript.
Use this to see which classes back each variant/color/size, useful when writing custom classNames or a custom theme.
Use list_components first to get a valid slug.`,
      inputSchema: {
        component: z.string().describe('Component slug as returned by list_components, e.g. "button".'),
      },
    },
    async ({component}) => {
      try {
        await assertValidComponent(component);

        const pkgDir = resolvePackageDir(component);
        const path = `${THEME_COMPONENTS_DIR}/${pkgDir}.ts`;

        try {
          const content = await fetchRawFile(path);

          return textResult(
            `# ${component} Styles (tailwind-variants)\n\nFile: \`${path}\`\n\n\`\`\`ts\n${content}\n\`\`\`\n`,
          );
        } catch (error) {
          if (error instanceof HttpError && error.status === 404) {
            return textResult(
              `No dedicated tailwind-variants file found at ${path} for "${component}" (package: @heroui/${pkgDir}). ` +
                `It may reuse another component's variants, or be unstyled/layout-only.`,
            );
          }
          throw error;
        }
      } catch (error) {
        return errorResult(error, `Unable to get styles for component "${component}".`);
      }
    },
  );
}
