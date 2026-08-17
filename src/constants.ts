export const GITHUB_OWNER = "heroui-inc";
export const GITHUB_REPO = "heroui";

// The "main" branch of heroui-inc/heroui tracks HeroUI v2.x (package.json version 2.0.0).
// HeroUI v3 lives on the "v3" branch and is a different, incompatible component model.
export const GITHUB_BRANCH = "main";

export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}`;
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

export const DOCS_COMPONENTS_DIR = "apps/docs/content/docs/components";
export const DOCS_DIR = "apps/docs/content/docs";
export const COMPONENTS_PACKAGES_DIR = "packages/components";
export const THEME_COMPONENTS_DIR = "packages/core/theme/src/components";

// Slugs used in apps/docs/content/docs/components/*.mdx that don't have a 1:1
// matching directory under packages/components — they ship as part of another
// package's bundle. Discovered by diffing the two directory listings.
export const COMPONENT_PACKAGE_ALIASES: Record<string, string> = {
  "checkbox-group": "checkbox",
  "circular-progress": "progress",
  "date-range-picker": "date-picker",
  "range-calendar": "calendar",
  "radio-group": "radio",
  "textarea": "input",
  "time-input": "date-input",
};

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
