import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {registerGetComponentDocs} from "./get-component-docs";
import {registerGetComponentSourceCode} from "./get-component-source-code";
import {registerGetComponentSourceStyles} from "./get-component-source-styles";
import {registerGetDocs} from "./get-docs";
import {registerGetThemeVariables} from "./get-theme-variables";
import {registerListComponents} from "./list-components";

export function registerAllTools(server: McpServer): void {
  registerListComponents(server);
  registerGetComponentDocs(server);
  registerGetComponentSourceCode(server);
  registerGetComponentSourceStyles(server);
  registerGetDocs(server);
  registerGetThemeVariables(server);
}
