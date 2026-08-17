export interface ParsedMdx {
  title?: string;
  description?: string;
  body: string;
}

export interface ApiTable {
  heading: string;
  rows: Array<Record<string, string>>;
}

export function parseFrontmatter(content: string): ParsedMdx {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {body: content};
  }

  const frontmatter = match[1] ?? "";
  // Frontmatter values are sometimes quoted ("Button") and sometimes bare YAML (Installation).
  const title = frontmatter.match(/^title:\s*"?([^"\n]+?)"?\s*$/m)?.[1];
  const description = frontmatter.match(/^description:\s*"?([^"\n]+?)"?\s*$/m)?.[1];

  return {title, description, body: content.slice(match[0].length)};
}

/**
 * HeroUI's docs embed prop tables as `<APITable data={[{...}, {...}]} />` JSX
 * expressions. The array is a plain JS object literal (unquoted keys, single
 * or double quoted strings) coming straight from the official repo, so it's
 * evaluated with `Function` rather than hand-rolling a JSON5 parser.
 */
export function extractApiTables(body: string): ApiTable[] {
  const tables: ApiTable[] = [];
  const marker = "<APITable";
  let searchFrom = 0;

  for (;;) {
    const tagStart = body.indexOf(marker, searchFrom);
    if (tagStart === -1) break;

    const dataKeyIndex = body.indexOf("data=", tagStart);
    const braceStart = dataKeyIndex === -1 ? -1 : body.indexOf("{", dataKeyIndex);
    if (braceStart === -1) break;

    let depth = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < body.length; i++) {
      if (body[i] === "{") depth++;
      else if (body[i] === "}") {
        depth--;
        if (depth === 0) {
          braceEnd = i;
          break;
        }
      }
    }
    if (braceEnd === -1) break;

    const arrayLiteral = body.slice(braceStart + 1, braceEnd).trim();
    const heading = [...body.slice(0, tagStart).matchAll(/^#{2,4}\s+(.+)$/gm)].pop()?.[1]?.trim();

    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const rows = new Function(`"use strict"; return (${arrayLiteral});`)() as Array<
        Record<string, string>
      >;
      if (Array.isArray(rows)) {
        tables.push({heading: heading ?? "Props", rows});
      }
    } catch {
      // Malformed/unexpected literal shape — skip rather than fail the whole doc.
    }

    searchFrom = braceEnd + 1;
  }

  return tables;
}

export function extractImportCommands(body: string): {main?: string; individual?: string} {
  const block = body.match(/<ImportTabs\s+commands=\{\{([\s\S]*?)\}\}\s*\/>/)?.[1];
  if (!block) return {};

  // Backreference to the opening quote so a differently-quoted string inside
  // (e.g. main: 'import {X} from "@heroui/react";') doesn't truncate the match.
  const main = block.match(/main:\s*(['"])([\s\S]*?)\1/)?.[2];
  const individual = block.match(/individual:\s*(['"])([\s\S]*?)\1/)?.[2];

  return {main, individual};
}

/** Strips MDX-only noise (imports, already-extracted APITable blocks) for display as plain markdown. */
export function cleanMdxBody(body: string): string {
  return body
    .replace(/^import .+;$/gm, "")
    .replace(/<APITable[\s\S]*?\/>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
