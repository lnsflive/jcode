import { J_PROJECT_FILE_NAME, type EnvironmentId, type JProjectFile } from "@lnsflive/contracts";
import { parseJProjectFile } from "@lnsflive/shared/jProjectFile";
import { executeAtomQuery } from "@lnsflive/client-runtime/state/runtime";

import {
  getProjectFileQueryAtom,
  resolveProjectFileQueryData,
} from "~/components/files/projectFilesQueryState";
import { appAtomRegistry } from "~/rpc/atomRegistry";

export async function readJProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): Promise<JProjectFile | null> {
  const result = await executeAtomQuery(
    appAtomRegistry,
    getProjectFileQueryAtom(environmentId, workspaceRoot, J_PROJECT_FILE_NAME),
    { reportDefect: false, reportFailure: false },
  );
  const data = resolveProjectFileQueryData(
    environmentId,
    workspaceRoot,
    J_PROJECT_FILE_NAME,
    result._tag === "Success" ? result.value : null,
  );
  if (data === null || data.exists === false || data.truncated) return null;
  return parseJProjectFile(data.contents);
}
