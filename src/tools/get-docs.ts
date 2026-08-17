import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {z} from "zod";

import {DOCS_DIR} from "../constants";
import {fetchRawFile, HttpError} from "../lib/github";
import {cleanMdxBody, parseFrontmatter} from "../lib/mdx";
import {errorResult, textResult} from "../lib/tool-result";

const EXAMPLE_PATHS = [
  "guide/introduction",
  "guide/installation",
  "guide/cli",
  "guide/tailwind-v4",
  "guide/nextui-to-heroui",
  "customization/theme",
  "customization/colors",
  "customization/dark-mode",
  "customization/create-theme",
  "frameworks/nextjs",
  "frameworks/vite",
  "api-references/heroui-provider",
  "api-references/cli-api",
];

function normalizeDocPath(input: string): string {
  return input
    .trim()
    .replace(/^\/?docs\//, "")
    .replace(/^\//, "")
    .replace(/\.mdx$/, "");
}

export function registerGetDocs(server: McpServer): void {
  server.registerTool(
    "get_docs",
    {
      description: `Get general HeroUI v2 documentation (guides, customization, frameworks, API references) — NOT component docs.
Fetches MDX content from heroui-inc/heroui@main (apps/docs/content/docs).
For component documentation use get_component_docs instead.
Example paths: ${EXAMPLE_PATHS.slice(0, 5).join(", ")}.`,
      inputSchema: {
        path: z
          .string()
          .describe(
            `Doc path under apps/docs/content/docs, e.g. "guide/installation" or "customization/theme". Examples: ${EXAMPLE_PATHS.join(", ")}`,
          ),
      },
    },
    async ({path}) => {
      const normalized = normalizeDocPath(path);

      if (normalized.startsWith("components/")) {
        const slug = normalized.split("/")[1];

        return textResult(
          `Component documentation should be fetched with get_component_docs instead.\nTry: get_component_docs({ component: "${slug}" })`,
        );
      }

      try {
        const raw = await fetchRawFile(`${DOCS_DIR}/${normalized}.mdx`);
        const {title, description, body} = parseFrontmatter(raw);

        let text = `# ${title ?? normalized}\n\n`;
        if (description) text += `${description}\n\n`;
        text += `---\n\n${cleanMdxBody(body)}`;

        return textResult(text);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return errorResult(
            new Error(`No doc found at "${normalized}". Example valid paths:\n${EXAMPLE_PATHS.map((p) => `- ${p}`).join("\n")}`),
            `Documentation not found at path: ${path}`,
          );
        }

        return errorResult(error, `Unable to fetch documentation at path: ${path}`);
      }
    },
  );
}
