import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";

import { J_PROJECT_FILE_NAME, type JProjectFile } from "@lnsflive/contracts";
import { JProjectFileFromJson } from "@lnsflive/shared/jProjectFile";

const decodeJProjectFileJson = Schema.decodeEffect(JProjectFileFromJson);

export class JProjectFileLoadError extends Schema.TaggedError<JProjectFileLoadError>()(
  "JProjectFileLoadError",
  {
    operation: Schema.Literals(["read", "decode"]),
    workspaceRoot: Schema.String,
    filePath: Schema.String,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to ${this.operation} ${J_PROJECT_FILE_NAME} at ${this.filePath}.`;
  }
}

export class JProjectFileLoader extends Context.Service<
  JProjectFileLoader,
  {
    /** Never fails; missing/unreadable/invalid files return none, with warnings for invalid files. */
    readonly load: (workspaceRoot: string) => Effect.Effect<Option.Option<JProjectFile>>;
  }
>()("jcode/project/JProjectFileLoader") {}

const logJProjectFileLoadError = (error: JProjectFileLoadError) =>
  Effect.logWarning(error).pipe(
    Effect.annotateLogs({
      operation: error.operation,
      workspaceRoot: error.workspaceRoot,
      filePath: error.filePath,
      errorTag: error._tag,
    }),
  );

/** @public */
export const make = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const load: JProjectFileLoader["Service"]["load"] = Effect.fn("JProjectFileLoader.load")(
    function* (workspaceRoot) {
      const filePath = path.join(workspaceRoot, J_PROJECT_FILE_NAME);
      const raw = yield* fileSystem.readFileString(filePath).pipe(
        Effect.asSome,
        Effect.catchTags({
          PlatformError: (error) =>
            error.reason._tag === "NotFound"
              ? Effect.succeed(Option.none<string>())
              : logJProjectFileLoadError(
                  new JProjectFileLoadError({
                    operation: "read",
                    workspaceRoot,
                    filePath,
                    cause: error,
                  }),
                ).pipe(Effect.as(Option.none<string>())),
        }),
      );
      if (Option.isNone(raw)) {
        return Option.none<JProjectFile>();
      }
      return yield* decodeJProjectFileJson(raw.value).pipe(
        Effect.asSome,
        Effect.catchTags({
          SchemaError: (error) =>
            logJProjectFileLoadError(
              new JProjectFileLoadError({
                operation: "decode",
                workspaceRoot,
                filePath,
                cause: error,
              }),
            ).pipe(Effect.as(Option.none<JProjectFile>())),
        }),
      );
    },
  );

  return JProjectFileLoader.of({ load });
});

export const layer = Layer.effect(JProjectFileLoader, make);
