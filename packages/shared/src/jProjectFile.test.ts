import * as Schema from "effect/Schema";
import { describe, expect, it } from "vite-plus/test";

import { parseJProjectFile, JProjectFileFromJson } from "./jProjectFile.ts";

const decodeJson = Schema.decodeUnknownSync(JProjectFileFromJson);

describe("JProjectFileFromJson", () => {
  it("decodes lenient JSONC with comments and trailing commas", () => {
    const decoded = decodeJson(`{
      // team scripts
      "iconPath": "assets/logo.svg",
      "scripts": [
        { "name": "Dev", "command": "pnpm dev", },
      ],
    }`);

    expect(decoded.iconPath).toBe("assets/logo.svg");
    expect(decoded.scripts?.[0]).toEqual({ name: "Dev", command: "pnpm dev" });
  });
});

describe("parseJProjectFile", () => {
  it("reads project defaults from JSONC with a URL in a block comment", () => {
    expect(
      parseJProjectFile(`{
        /* See https://jaimegonzalezjr.com/schema/t3.json */
        "defaultThreadEnvMode": "worktree"
      }`),
    ).toEqual({ defaultThreadEnvMode: "worktree" });
  });
});
