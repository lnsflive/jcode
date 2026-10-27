import type { ThreadId } from "@lnsflive/contracts";
import * as KeyedLock from "@lnsflive/shared/KeyedLock";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export class ThreadCommandExecutor extends Context.Service<
  ThreadCommandExecutor,
  KeyedLock.KeyedLock<ThreadId>
>()("jcode/orchestration-v2/ThreadCommandExecutor") {}

export const layer = Layer.effect(ThreadCommandExecutor, KeyedLock.make<ThreadId>());
