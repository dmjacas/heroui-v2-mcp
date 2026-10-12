# heroui-v2-mcp

[![M8ven Score](https://m8ven.ai/badge/mcp/dmjacas-heroui-v2-mcp-1h7p7x)](https://m8ven.ai/mcp/dmjacas-heroui-v2-mcp-1h7p7x?s=readme)

MCP (Model Context Protocol) server for **HeroUI v2** (https://v2.heroui.com) component documentation,
source code, style definitions and theme tokens.

Unlike the official `@heroui/react-mcp` — which targets HeroUI **v3** and needs a
deployed Cloudflare Worker + R2 bucket + PostHog project behind it — this is a **standalone local server**:
it fetches everything on demand directly from `heroui-inc/heroui@main` (the branch that tracks v2.x) and
`raw.githubusercontent.com`, caching results in memory for the life of the process. No cloud account,
API deployment or extraction pipeline required.

## Why a separate project

HeroUI v3 (branch `v3`, site `heroui.com`) and v2 (branch `main`, site `v2.heroui.com`) are different,
incompatible component models — different package layout, no `llms.txt` on the v2 site, different docs
folder structure (`/docs/components/*` vs `/docs/react/*`), different styling approach (tailwind-variants
files under `packages/core/theme/src/components` vs whatever v3 uses). The official MCP explicitly refuses
to serve v2 docs, so this project mirrors its tool surface but points at the v2 data sources.

## Tools

| Tool | Purpose |
| --- | --- |
| `list_components` | List all v2 component slugs (matches `v2.heroui.com/docs/components/<slug>`) |
| `get_component_docs` | Description, install command, imports, usage guidance, props/API table |
| `get_component_source_code` | React/TypeScript source from `packages/components/<pkg>/src` |
| `get_component_source_styles` | tailwind-variants style definition from `packages/core/theme/src/components` |
| `get_docs` | General guides: installation, frameworks, theming, CLI, HeroUIProvider, etc. |
| `get_theme_variables` | Default semantic colors + layout tokens |

## Install & run

The package is published on npm as [`heroui-v2-mcp`](https://www.npmjs.com/package/heroui-v2-mcp), so no
clone or build step is required to use it.

### Use from Claude Code / Claude Desktop / Cursor

Add to your MCP config — `npx` downloads and runs it on demand:

```json
{
  "mcpServers": {
    "heroui-v2": {
      "command": "npx",
      "args": ["-y", "heroui-v2-mcp"]
    }
  }
}
```

Or install it globally and point at the binary directly:

```bash
npm install -g heroui-v2-mcp
```

```json
{
  "mcpServers": {
    "heroui-v2": {
      "command": "heroui-v2-mcp"
    }
  }
}
```

### Local development (from source)

```bash
npm install
npm run dev         # tsx --watch, runs src/server.ts directly (no build step)
npm run inspect      # launches @modelcontextprotocol/inspector against src/server.ts
npm run build        # emits dist/server.js
```

### GitHub rate limits

Directory listings go through the GitHub REST API, which is capped at **60 requests/hour**
unauthenticated. File contents (`raw.githubusercontent.com`) are not subject to that limit. If you hit
403s while browsing many components, set a token:

```bash
export GITHUB_TOKEN=ghp_xxx   # no scopes needed, just raises the rate limit to 5000/hr
```

## How data is resolved

- Component list = files under `apps/docs/content/docs/components/*.mdx` on the `main` branch.
- Most doc slugs map 1:1 to a `packages/components/<slug>` package. A handful of doc pages document
  sub-components bundled into another package (e.g. `textarea` ships inside `@heroui/input`,
  `checkbox-group` inside `@heroui/checkbox`) — see `COMPONENT_PACKAGE_ALIASES` in `src/constants.ts`.
- Props/API tables are parsed out of the `<APITable data={[...]} />` JSX literal embedded in each `.mdx`
  doc page (that array is evaluated as a JS literal — it's static data from the official repo, not
  arbitrary/untrusted input).
- Theme tokens come from `packages/core/theme/src/colors/{semantic,common}.ts` and `default-layout.ts`.

## Caching

Every GitHub response (file content or directory listing) is cached in-memory for 30 minutes
(`CACHE_TTL_MS` in `src/constants.ts`). Restart the process to force a refresh sooner.
