import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";

import { JProjectFile, J_PROJECT_FILE_SCHEMA_URL } from "@lnsflive/contracts";

import { fromLenientJson } from "./schemaJson.ts";

export const JProjectFileFromJson = fromLenientJson(JProjectFile);

const decodeJProjectFile = Schema.decodeExit(JProjectFileFromJson);

export function parseJProjectFile(contents: string): JProjectFile | null {
  const decoded = decodeJProjectFile(contents);
  return Exit.isSuccess(decoded) ? decoded.value : null;
}

export function buildJProjectFileJsonSchema(): Record<string, unknown> {
  const document = Schema.toJsonSchemaDocument(JProjectFile, { onExcessProperty: "error" });
  const jsonSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: J_PROJECT_FILE_SCHEMA_URL,
    ...document.schema,
  };
  if (document.definitions && Object.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return jsonSchema;
}
