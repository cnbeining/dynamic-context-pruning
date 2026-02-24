import { afterEach, describe, it } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { DEFAULT_CLAUDE_CONFIG } from "../../../lib/claude/config/defaults"
import { loadClaudeConfig } from "../../../lib/claude/config/load"

const tempDirs: string[] = []

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

describe("loadClaudeConfig", () => {
    it("project overrides global for prune permission", async () => {
        const dir = await mkdtemp(join(tmpdir(), "claude-config-"))
        tempDirs.push(dir)

        const globalPath = join(dir, "global.json")
        const projectPath = join(dir, "project.json")

        await writeFile(globalPath, JSON.stringify({ tools: { prune: { permission: "deny" } } }))
        await writeFile(projectPath, JSON.stringify({ tools: { prune: { permission: "ask" } } }))

        const config = await loadClaudeConfig({ globalPath, projectPath })

        assert.equal(config.tools.prune.permission, "ask")
    })

    it("invalid permission falls back to default", async () => {
        const dir = await mkdtemp(join(tmpdir(), "claude-config-"))
        tempDirs.push(dir)

        const projectPath = join(dir, "project.json")
        await writeFile(projectPath, JSON.stringify({ tools: { prune: { permission: "maybe" } } }))

        const config = await loadClaudeConfig({ projectPath })

        assert.equal(config.tools.prune.permission, DEFAULT_CLAUDE_CONFIG.tools.prune.permission)
    })

    it("missing files returns defaults", async () => {
        const dir = await mkdtemp(join(tmpdir(), "claude-config-"))
        tempDirs.push(dir)

        const globalPath = join(dir, "missing-global.json")
        const projectPath = join(dir, "missing-project.json")

        const config = await loadClaudeConfig({ globalPath, projectPath })

        assert.deepEqual(config, DEFAULT_CLAUDE_CONFIG)
    })
})
