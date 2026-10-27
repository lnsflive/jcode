import { describe, expect, it } from "vite-plus/test";

import {
  J_MCP_TOOL_NAMES,
  resolveJMcpSummaryAction,
  resolveJMcpToolDefinition,
  resolveJMcpToolPresentation,
} from "./jMcpToolPresentation.ts";

describe("resolveJMcpToolPresentation", () => {
  it("recognizes every JCode tool across provider prefixes and completion suffixes", () => {
    for (const tool of J_MCP_TOOL_NAMES) {
      const presentation = resolveJMcpToolPresentation(tool);
      for (const prefix of [
        "mcp__jcode__",
        "JCode.",
        "jcode/",
        "jcode:",
        "mcp_jcode_",
        "JCode ",
        "jcode · ",
      ]) {
        expect(resolveJMcpToolPresentation(`${prefix}${tool} completed`), tool).toEqual(
          presentation,
        );
      }
      expect(resolveJMcpToolPresentation(`mcp__another-server__${tool}`), tool).toBeNull();
    }
  });

  it("matches OpenCode 2's per-thread server names, whose thread ids hold underscores", () => {
    expect(
      resolveJMcpToolPresentation("jcode-thread_opencode2-adapter_delegate_task")?.displayName,
    ).toBe("Delegate a child task");
    expect(resolveJMcpToolPresentation("jcode-thread_opencode2-adapter_not_a_tool")).toBeNull();
  });
});

describe("resolveJMcpToolDefinition", () => {
  it("labels an action tool call as the action it ran", () => {
    expect(
      resolveJMcpToolDefinition("mcp__jcode__preview_act", { action: "type" })?.labels,
    ).toEqual(resolveJMcpToolDefinition("preview_type")?.labels);
    expect(
      resolveJMcpToolDefinition("jcode_thread_transfer", { action: "fork" })?.displayName,
    ).toBe(resolveJMcpToolDefinition("jcode_thread_fork")?.displayName);
    expect(resolveJMcpToolDefinition("preview_act", { action: "unknown" })?.labels[2]).toBe("Used");
  });
});

describe("resolveJMcpSummaryAction", () => {
  it("summarizes an action tool by the action each call ran", () => {
    expect(resolveJMcpSummaryAction("mcp__jcode__jcode_queue", { action: "list" })).toBe(
      "queue-list",
    );
    expect(resolveJMcpSummaryAction("jcode_queue", { action: "edit" })).toBe("queue-edit");
    expect(resolveJMcpSummaryAction("jcode_thread_transfer", { action: "status" })).toBe(
      "thread-transfers",
    );
    expect(resolveJMcpSummaryAction("jcode_thread_configure", {})).toBe("thread-configuration");
    expect(resolveJMcpSummaryAction("schedule_task", { scheduledTaskId: "task-1" })).toBe(
      "schedule-update",
    );
    expect(resolveJMcpSummaryAction("delegate_task", { task: "x" })).toBe("delegate");
  });
});
