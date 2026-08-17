export interface ToolTextResult {
  [key: string]: unknown;
  content: Array<{type: "text"; text: string}>;
  isError?: boolean;
}

export function textResult(text: string): ToolTextResult {
  return {content: [{type: "text", text}]};
}

export function errorResult(error: unknown, context: string): ToolTextResult {
  const message = error instanceof Error ? error.message : String(error);

  return {
    content: [{type: "text", text: `Error: ${context}\n\n${message}`}],
    isError: true,
  };
}
