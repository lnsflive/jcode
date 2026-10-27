import {
  J_PROJECT_FILE_NAME,
  type EnvironmentId,
  type JProjectFile,
  type JProjectFileScript,
} from "@lnsflive/contracts";
import { parseJProjectFile } from "@lnsflive/shared/jProjectFile";

import { useProjectFileQuery } from "~/components/files/projectFilesQueryState";

const NO_SCRIPTS: ReadonlyArray<JProjectFileScript> = [];

export interface JProjectFileState {
  status: "loading" | "missing" | "invalid" | "valid";
  file: JProjectFile | null;
  scripts: ReadonlyArray<JProjectFileScript>;
}

export function useJProjectFileState(
  environmentId: EnvironmentId,
  cwd: string | null,
): JProjectFileState {
  const query = useProjectFileQuery(environmentId, cwd ?? "", J_PROJECT_FILE_NAME, cwd !== null);
  const contents = query.data && !query.data.truncated ? query.data.contents : null;
  const isPending = query.isPending;
  if (contents === null) {
    return {
      status: isPending ? "loading" : "missing",
      file: null,
      scripts: NO_SCRIPTS,
    } as const;
  }
  const file = parseJProjectFile(contents);
  if (file === null) {
    return { status: "invalid", file: null, scripts: NO_SCRIPTS } as const;
  }
  return { status: "valid", file, scripts: file.scripts ?? NO_SCRIPTS } as const;
}

export function useJProjectFileScripts(
  environmentId: EnvironmentId,
  cwd: string | null,
): ReadonlyArray<JProjectFileScript> {
  return useJProjectFileState(environmentId, cwd).scripts;
}
