import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"

import { loadClaudeSessionState } from "../../../lib/claude/state/store"
import { runPostResponsePipeline } from "../../../lib/claude/hooks/post-response"
import { runPreSendPipeline } from "../../../lib/claude/hooks/pre-send"

test("runPreSendPipeline executes strategy runner and returns normal mode", async () => {
    const calls: string[] = []

    const result = await runPreSendPipeline(
        {
            state: {} as any,
            logger: {} as any,
            config: {} as any,
            messages: [] as any,
        },
        {
            runAutomaticStrategies: () => {
                calls.push("run")
            },
        },
    )

    assert.deepEqual(calls, ["run"])
    assert.deepEqual(result, { mode: "normal" })
})

test("runPreSendPipeline fails open when strategy runner throws", async () => {
    const result = await runPreSendPipeline(
        {
            state: {} as any,
            logger: {} as any,
            config: {} as any,
            messages: [] as any,
        },
        {
            runAutomaticStrategies: () => {
                throw new Error("boom")
            },
        },
    )

    assert.deepEqual(result, { mode: "fail-open" })
})

test("runPostResponsePipeline persists session state when context provided", async () => {
    const storageDir = await mkdtemp(join(tmpdir(), "claude-hooks-store-"))

    try {
        const state = {
            prune: {
                tools: new Map<string, number>([["id-1", 1]]),
                messages: new Map<string, number>(),
            },
        } as any

        const result = await runPostResponsePipeline({
            state,
            logger: {} as any,
            config: {} as any,
            messages: [] as any,
            storageDir,
            sessionId: "session-hooks-1",
        })

        assert.equal(result.mode, "normal")

        const saved = await loadClaudeSessionState(storageDir, "session-hooks-1")
        assert.ok(saved)
        assert.equal(saved?.prune.tools.get("id-1"), 1)
    } finally {
        await rm(storageDir, { recursive: true, force: true })
    }
})
