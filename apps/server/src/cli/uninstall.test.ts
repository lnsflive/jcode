import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as HostProcess from "@lnsflive/shared/HostProcess";

import { findOwnedLaunchers } from "./uninstall.ts";

it.layer(NodeServices.layer)("JCode uninstall launchers", (it) => {
  it.effect("claims only a launcher that points into this home's runtime tree", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ prefix: "jcode-uninstall-" });
      const versionsDir = path.join(root, "runtime/versions");
      const exe = path.join(versionsDir, "1.0.0/jcode");
      const otherExe = path.join(root, "other/runtime/versions/1.0.0/jcode");
      const copy = path.join(root, "copy/jcode");
      for (const file of [exe, otherExe, copy]) {
        yield* fs.makeDirectory(path.dirname(file), { recursive: true });
        yield* fs.writeFileString(file, "");
      }
      const ours = path.join(root, "bin/jcode");
      const theirs = path.join(root, "other/bin/jcode");
      yield* fs.makeDirectory(path.dirname(ours), { recursive: true });
      yield* fs.makeDirectory(path.dirname(theirs), { recursive: true });
      yield* fs.symlink(exe, ours);
      yield* fs.symlink(otherExe, theirs);

      assert.deepEqual([...(yield* findOwnedLaunchers({ launchedAs: ours, versionsDir }))].sort(), [
        ours,
      ]);
      assert.deepEqual(yield* findOwnedLaunchers({ launchedAs: theirs, versionsDir }), []);
      assert.deepEqual(yield* findOwnedLaunchers({ launchedAs: copy, versionsDir }), []);
      assert.deepEqual(yield* findOwnedLaunchers({ launchedAs: undefined, versionsDir }), []);
    }).pipe(Effect.scoped, Effect.provideService(HostProcess.Platform, "linux")),
  );
});
