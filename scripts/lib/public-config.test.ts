// @effect-diagnostics nodeBuiltinImport:off - Tests exercise root env file precedence directly.
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { loadRepoEnv } from "./public-config.ts";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    NodeFS.rmSync(directory, { recursive: true, force: true });
  }
});

describe("loadRepoEnv", () => {
  it("applies process, root local, and root precedence in that order", () => {
    const repoRoot = makeTemporaryDirectory();
    NodeFS.writeFileSync(
      NodePath.join(repoRoot, ".env"),
      "JCODE_CLERK_PUBLISHABLE_KEY=pk_root\nJCODE_CLERK_JWT_TEMPLATE=template_root\nJCODE_CLERK_CLI_OAUTH_CLIENT_ID=oauth_root\nJCODE_RELAY_URL=https://root.example.test\n",
    );
    NodeFS.writeFileSync(
      NodePath.join(repoRoot, ".env.local"),
      "JCODE_CLERK_PUBLISHABLE_KEY=pk_local\nJCODE_CLERK_JWT_TEMPLATE=template_local\nJCODE_CLERK_CLI_OAUTH_CLIENT_ID=oauth_local\nJCODE_RELAY_URL=https://local.example.test\n",
    );

    expect(loadRepoEnv({ baseEnv: {}, repoRoot }).JCODE_RELAY_URL).toBe(
      "https://local.example.test",
    );
    expect(
      loadRepoEnv({
        baseEnv: {
          JCODE_CLERK_PUBLISHABLE_KEY: "pk_ci",
          JCODE_CLERK_JWT_TEMPLATE: "template_ci",
          JCODE_CLERK_CLI_OAUTH_CLIENT_ID: "oauth_ci",
          JCODE_RELAY_URL: "https://ci.example.test",
        },
        repoRoot,
      }),
    ).toMatchObject({
      JCODE_CLERK_PUBLISHABLE_KEY: "pk_ci",
      JCODE_CLERK_CLI_OAUTH_CLIENT_ID: "oauth_ci",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_ci",
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_ci",
      JCODE_CLERK_JWT_TEMPLATE: "template_ci",
      VITE_CLERK_JWT_TEMPLATE: "template_ci",
      EXPO_PUBLIC_CLERK_JWT_TEMPLATE: "template_ci",
      JCODE_RELAY_URL: "https://ci.example.test",
      VITE_JCODE_RELAY_URL: "https://ci.example.test",
    });
  });
});

function makeTemporaryDirectory() {
  const directory = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "jcode-public-config-"));
  temporaryDirectories.push(directory);
  return directory;
}
