import assert from "node:assert/strict"
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import { loadClaudeSessionState, saveClaudeSessionState } from "../../../lib/claude/state/store"
import type { ClaudeSessionState } from "../../../lib/claude/state/types"

test("save+load roundtrip", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "claude-state-store-"))

    try {
        const state: ClaudeSessionState = {
            prune: {
                tools: new Map([
                    ["tool-1", 120],
                    ["tool-2", 40],
                ]),
                messages: new Map([
                    ["msg-1", 200],
                    ["msg-2", 80],
                ]),
            },
        }

        await saveClaudeSessionState(baseDir, "session-1", state)
        const loaded = await loadClaudeSessionState(baseDir, "session-1")

        assert.ok(loaded)
        assert.deepEqual(loaded.prune.tools, state.prune.tools)
        assert.deepEqual(loaded.prune.messages, state.prune.messages)

        const sessionFiles = await readdir(join(baseDir, "sessions"))
        assert.deepEqual(sessionFiles, ["session-1.json"])
    } finally {
        await rm(baseDir, { recursive: true, force: true })
    }
})

test("corrupted session file returns null", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "claude-state-store-"))

    try {
        const sessionsDir = join(baseDir, "sessions")
        await mkdir(sessionsDir, { recursive: true })
        await writeFile(join(sessionsDir, "broken-session.json"), "{not valid json", "utf8")

        const loaded = await loadClaudeSessionState(baseDir, "broken-session")
        assert.equal(loaded, null)
    } finally {
        await rm(baseDir, { recursive: true, force: true })
    }
})

test("rejects invalid session IDs", async () => {
    const baseDir = await mkdtemp(join(tmpdir(), "claude-state-store-"))

    try {
        await assert.rejects(
            () =>
                saveClaudeSessionState(baseDir, "../escape", {
                    prune: { tools: new Map(), messages: new Map() },
                }),
            /Invalid sessionId/,
        )
    } finally {
        await rm(baseDir, { recursive: true, force: true })
    }
})
