import type { APIRoute } from "astro";

import { buildJProjectFileJsonSchema } from "@t3tools/shared/jProjectFile";

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(buildJProjectFileJsonSchema(), null, 2)}\n`, {
    headers: { "Content-Type": "application/json" },
  });
