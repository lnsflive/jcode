import * as Option from "effect/Option";

export type JoinPath = (first: string, ...segments: string[]) => string;

function normalizeConfiguredBaseDir(jcodeHome: Option.Option<string>): Option.Option<string> {
  if (Option.isNone(jcodeHome)) {
    return Option.none();
  }
  const trimmed = jcodeHome.value.trim();
  return trimmed.length > 0 ? Option.some(trimmed) : Option.none();
}

export function resolveDesktopBaseDir(input: {
  readonly homeDirectory: string;
  readonly joinPath: JoinPath;
  readonly jcodeHome: Option.Option<string>;
}): string {
  return Option.getOrElse(normalizeConfiguredBaseDir(input.jcodeHome), () =>
    input.joinPath(input.homeDirectory, ".jcode"),
  );
}

export function resolveDesktopStateDir(input: {
  readonly baseDir: string;
  readonly isDevelopment: boolean;
  readonly joinPath: JoinPath;
  readonly jcodeHome: Option.Option<string>;
}): string {
  const useDevSubdir =
    input.isDevelopment && Option.isNone(normalizeConfiguredBaseDir(input.jcodeHome));
  return input.joinPath(input.baseDir, useDevSubdir ? "dev" : "userdata");
}
