import {CACHE_TTL_MS, GITHUB_API_BASE, GITHUB_BRANCH, GITHUB_RAW_BASE} from "../constants";
import {getOrSet} from "./cache";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export interface DirEntry {
  name: string;
  type: "file" | "dir";
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {Accept: "application/vnd.github+json"};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/** Fetches the raw text content of a file from the heroui-inc/heroui repo. */
export async function fetchRawFile(path: string): Promise<string> {
  return getOrSet(`raw:${path}`, CACHE_TTL_MS, async () => {
    const res = await fetch(`${GITHUB_RAW_BASE}/${path}`);
    if (!res.ok) {
      throw new HttpError(res.status, `File not found in heroui-inc/heroui@${GITHUB_BRANCH}: ${path}`);
    }

    return res.text();
  });
}

/** Lists the entries of a directory in the heroui-inc/heroui repo via the GitHub Contents API. */
export async function listDirectory(path: string): Promise<DirEntry[]> {
  return getOrSet(`dir:${path}`, CACHE_TTL_MS, async () => {
    const res = await fetch(`${GITHUB_API_BASE}/contents/${path}?ref=${GITHUB_BRANCH}`, {
      headers: githubHeaders(),
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new HttpError(
          403,
          `GitHub API rate limit likely exceeded while listing "${path}". Set a GITHUB_TOKEN env var to raise the limit.`,
        );
      }
      throw new HttpError(res.status, `Directory not found in heroui-inc/heroui@${GITHUB_BRANCH}: ${path}`);
    }

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      throw new Error(`Expected a directory listing at "${path}" but got a file`);
    }

    return data.map((entry) => ({
      name: (entry as {name: string}).name,
      type: (entry as {type: "file" | "dir"}).type,
    }));
  });
}
