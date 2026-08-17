import {COMPONENT_PACKAGE_ALIASES, DOCS_COMPONENTS_DIR} from "../constants";
import {listDirectory} from "./github";

/** Doc slugs (e.g. "date-range-picker") as they appear on v2.heroui.com/docs/components. */
export async function listComponentSlugs(): Promise<string[]> {
  const entries = await listDirectory(DOCS_COMPONENTS_DIR);

  return entries
    .filter((e) => e.type === "file" && e.name.endsWith(".mdx"))
    .map((e) => e.name.replace(/\.mdx$/, ""))
    .sort();
}

/** Maps a doc slug to its packages/components/* directory name (aliases for bundled sub-components). */
export function resolvePackageDir(slug: string): string {
  return COMPONENT_PACKAGE_ALIASES[slug] ?? slug;
}

export function resolvePackageName(slug: string): string {
  return `@heroui/${resolvePackageDir(slug)}`;
}

function suggestClosest(slug: string, candidates: string[]): string | undefined {
  const lower = slug.toLowerCase();
  const partial = candidates.find((c) => c.includes(lower) || lower.includes(c));

  return partial;
}

/** Throws a helpful error (with a suggestion) if the slug isn't a real v2 component. */
export async function assertValidComponent(slug: string): Promise<void> {
  const slugs = await listComponentSlugs();
  if (slugs.includes(slug)) return;

  const suggestion = suggestClosest(slug, slugs);
  throw new Error(
    `Unknown HeroUI v2 component "${slug}".${suggestion ? ` Did you mean "${suggestion}"?` : ""} Call list_components to see all available components.`,
  );
}
