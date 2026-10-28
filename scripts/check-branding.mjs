import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

const root = NodePath.resolve(import.meta.dirname, "..");
const files = NodeChildProcess.execFileSync(
  "git",
  ["ls-files", "-z", "--", ".", ":(exclude).repos/**"],
  { cwd: root, encoding: "utf8" },
).split("\0");
let failures = 0;
for (const file of files) {
  if (
    !/\.(?:[cm]?[jt]sx?|jsonc?|html|astro|css|md|svg|ya?ml|toml|sh|ps1|xml|plist|swift|kt|rs)$/.test(
      file,
    )
  )
    continue;
  if (
    file.startsWith(".repos/") ||
    file === "scripts/check-branding.mjs" ||
    file.endsWith("lock.yaml") ||
    /(?:\/Vendor\/|\/fixtures\/|\/testkit\/)/.test(file)
  )
    continue;
  const lines = NodeFS.readFileSync(NodePath.join(root, file), "utf8").split("\n");
  for (const [index, line] of lines.entries()) {
    // Terminal escape sequences can put the old name immediately after an ASCII letter.
    const text = line
      .replace(/\\(?:[rnt]|x1b\[[0-9;]*[A-Za-z])/g, " ")
      .replace(/data:image\/[^"'\s]+/g, "");
    if (/\bt3(?:[ _-]*code)?\b|pingdotgg|t3\.gg|\.mount_T3/i.test(text)) {
      // Old archive names remain supported, and the launcher test asserts the old prefix is absent.
      if (
        (file === "scripts/install.sh" &&
          /archive="t3-|\$legacy_archive.*staging.*\/t3|ln -s t3/.test(line)) ||
        (file === "scripts/install.test.ts" && /\["t3", (?:false|true)\]/.test(line)) ||
        (file === "scripts/build-npm-launcher.test.ts" &&
          line.trim() === 'assert.notInclude(first.stderr, "t3:");')
      )
        continue;
      console.error(`${file}:${index + 1}: ${line.trim().slice(0, 180)}`);
      failures++;
    }
  }
}
const webIcons = [
  ["jcode-black-web-favicon.ico", "favicon.ico"],
  ["jcode-black-web-favicon-16x16.png", "favicon-16x16.png"],
  ["jcode-black-web-favicon-32x32.png", "favicon-32x32.png"],
  ["jcode-black-web-apple-touch-180.png", "apple-touch-icon.png"],
];
for (const [source, target] of webIcons) {
  const expected = NodeFS.readFileSync(NodePath.join(root, "assets/prod", source));
  for (const directory of ["apps/web/public", "apps/marketing/public"]) {
    const file = `${directory}/${target}`;
    if (!expected.equals(NodeFS.readFileSync(NodePath.join(root, file)))) {
      console.error(`${file}: does not match the JCode brand asset; run icons:export:web.`);
      failures++;
    }
  }
}
if (failures) {
  console.error(`Found ${failures} upstream branding references in JCode repository files.`);
  process.exitCode = 1;
} else {
  console.log("JCode repository branding check passed.");
}
