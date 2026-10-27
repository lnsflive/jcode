// @effect-diagnostics nodeBuiltinImport:off - Drives the real shell installer against a local GitHub fixture.
import * as HostProcess from "@lnsflive/shared/HostProcess";
import * as NodeChildProcess from "node:child_process";
import * as NodeFSP from "node:fs/promises";
import * as NodeHttp from "node:http";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import { describe, expect, it } from "vite-plus/test";

const nightlies = Array.from({ length: 100 }, (_, index) => ({
  tag_name: `v1.2.4-nightly.20261020.${200 - index}`,
}));

// regression: #22490
describe.skipIf(HostProcess.Platform.defaultValue() !== "linux")("installer channel lookup", () => {
  it.each([
    ["stable", "1.2.3"],
    ["preview", "1.2.4-preview.20261019.50"],
  ])("finds the newest %s release behind a full page of nightlies", async (channel, version) => {
    const root = await NodeFSP.mkdtemp(NodePath.join(NodeOS.tmpdir(), "jcode-install-index-"));
    const target = NodePath.join(root, "home/runtime/versions", version);
    const server = NodeHttp.createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://fixture");
      const body =
        url.pathname === "/repos/lnsflive/jcode/releases/latest" &&
        request.headers.accept === "application/vnd.github+json"
          ? { tag_name: "v1.2.3" }
          : url.pathname === "/repos/lnsflive/jcode/releases"
            ? { "1": nightlies, "2": [{ tag_name: `v${version}` }, { tag_name: "v1.2.3" }] }[
                url.searchParams.get("page") ?? ""
              ]
            : undefined;
      if (body === undefined) response.statusCode = 404;
      // The API pretty-prints and the installer reads it line by line.
      response.end(JSON.stringify(body ?? [], null, 2));
    });
    try {
      // An existing completed install isolates release resolution from archive downloads.
      await NodeFSP.mkdir(target, { recursive: true });
      await NodeFSP.writeFile(NodePath.join(target, ".install-complete"), `${version}\n`);
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Expected a TCP listener");
      const origin = `http://127.0.0.1:${address.port}`;
      const source = await NodeFSP.readFile(
        NodePath.resolve(import.meta.dirname, "install.sh"),
        "utf8",
      );
      const installer = NodePath.join(root, "install.sh");
      await NodeFSP.writeFile(installer, source.replace(/https:\/\/(api\.)?github\.com/g, origin));
      const { code, output } = await new Promise<{ code: number | null; output: string }>(
        (resolve, reject) => {
          const child = NodeChildProcess.spawn("sh", [installer], {
            env: {
              ...process.env,
              JCODE_VERSION: "",
              JCODE_CHANNEL: channel,
              JCODE_HOME: NodePath.join(root, "home"),
              JCODE_INSTALL_BIN_DIR: NodePath.join(root, "bin"),
              // A wrong version must fail here instead of downloading a real release.
              JCODE_RELEASE_BASE_URL: origin,
            },
            stdio: ["ignore", "pipe", "pipe"],
          });
          let output = "";
          child.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()));
          child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()));
          child.on("error", reject);
          child.on("close", (code) => resolve({ code, output }));
        },
      );
      expect(code, output).toBe(0);
      expect(output).toContain(`Installed JCode ${version}`);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await NodeFSP.rm(root, { recursive: true, force: true });
    }
  });

  it("reuses the data directory of a previous installation", async () => {
    const root = await NodeFSP.mkdtemp(NodePath.join(NodeOS.tmpdir(), "jcode-install-home-"));
    const previousHome = NodePath.join(root, "previous-home");
    const versionDir = NodePath.join(previousHome, "runtime/versions/1.2.3");
    const bin = NodePath.join(root, "bin");
    try {
      await NodeFSP.mkdir(NodePath.join(previousHome, "userdata"), { recursive: true });
      await NodeFSP.mkdir(versionDir, { recursive: true });
      await NodeFSP.mkdir(bin);
      await NodeFSP.writeFile(NodePath.join(previousHome, "userdata/keep"), "existing data");
      await NodeFSP.writeFile(NodePath.join(versionDir, ".install-complete"), "1.2.3\n");
      await NodeFSP.symlink(NodePath.join(versionDir, "jcode"), NodePath.join(bin, "jcode"));

      const result = NodeChildProcess.spawnSync(
        "sh",
        [NodePath.resolve(import.meta.dirname, "install.sh")],
        {
          env: {
            ...process.env,
            HOME: root,
            JCODE_HOME: "",
            JCODE_INSTALL_BIN_DIR: bin,
            JCODE_VERSION: "1.2.3",
          },
          encoding: "utf8",
        },
      );

      expect(result.status, result.stderr).toBe(0);
      expect(await NodeFSP.readlink(NodePath.join(root, ".jcode"))).toBe(previousHome);
      expect(await NodeFSP.readFile(NodePath.join(root, ".jcode/userdata/keep"), "utf8")).toBe(
        "existing data",
      );
    } finally {
      await NodeFSP.rm(root, { recursive: true, force: true });
    }
  });
});
