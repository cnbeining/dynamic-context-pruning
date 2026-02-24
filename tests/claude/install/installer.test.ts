import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"

import { installClaudeDcp } from "../../../lib/claude/install/installer"
import { uninstallClaudeDcp } from "../../../lib/claude/install/uninstaller"

test("installer writes managed MCP and hook entries", async () => {
    const root = await mkdtemp(join(tmpdir(), "claude-dcp-install-"))
    const configPath = join(root, "settings.json")

    try {
        await installClaudeDcp({ configPath })
        const text = await readFile(configPath, "utf-8")

        assert.match(text, /"managedBy"\s*:\s*"dcp"/)
        assert.match(text, /"mcpServers"/)
        assert.match(text, /"hooks"/)
    } finally {
        await rm(root, { recursive: true, force: true })
    }
})

test("installer fails on invalid existing settings content", async () => {
    const root = await mkdtemp(join(tmpdir(), "claude-dcp-install-"))
    const configPath = join(root, "settings.json")

    try {
        await writeFile(configPath, "{invalid json", "utf-8")
        await assert.rejects(
            () => installClaudeDcp({ configPath }),
            /Failed to parse Claude settings/,
        )
    } finally {
        await rm(root, { recursive: true, force: true })
    }
})

test("installer is idempotent and uninstaller removes managed entries", async () => {
    const root = await mkdtemp(join(tmpdir(), "claude-dcp-install-"))
    const configPath = join(root, "settings.json")

    try {
        await installClaudeDcp({ configPath })
        await installClaudeDcp({ configPath })

        const afterInstall = await readFile(configPath, "utf-8")
        const parsed = JSON.parse(afterInstall) as {
            mcpServers?: Record<string, unknown>
            hooks?: Record<string, unknown>
        }

        assert.ok(parsed.mcpServers && typeof parsed.mcpServers === "object")
        assert.ok(parsed.hooks && typeof parsed.hooks === "object")

        const dcpServer = (parsed.mcpServers as Record<string, any>).dcp
        const dcpHooks = (parsed.hooks as Record<string, any>).dcp
        assert.equal(dcpServer?.managedBy, "dcp")
        assert.equal(dcpHooks?.managedBy, "dcp")

        await uninstallClaudeDcp({ configPath })
        const afterUninstall = await readFile(configPath, "utf-8")
        assert.doesNotMatch(afterUninstall, /"managedBy"\s*:\s*"dcp"/)
    } finally {
        await rm(root, { recursive: true, force: true })
    }
})

test("installer preserves unrelated settings", async () => {
    const root = await mkdtemp(join(tmpdir(), "claude-dcp-install-"))
    const configPath = join(root, "settings.json")

    try {
        await writeFile(
            configPath,
            JSON.stringify({
                theme: "light",
                hooks: { external: { preSend: "echo hi" } },
                mcpServers: { external: { command: "node", args: ["server.js"] } },
            }),
            "utf-8",
        )

        await installClaudeDcp({ configPath })
        const installed = JSON.parse(await readFile(configPath, "utf-8")) as any
        assert.equal(installed.theme, "light")
        assert.ok(installed.hooks.external)
        assert.ok(installed.mcpServers.external)

        await uninstallClaudeDcp({ configPath })
        const uninstalled = JSON.parse(await readFile(configPath, "utf-8")) as any
        assert.equal(uninstalled.theme, "light")
        assert.ok(uninstalled.hooks.external)
        assert.ok(uninstalled.mcpServers.external)
        assert.equal(uninstalled.hooks.dcp, undefined)
        assert.equal(uninstalled.mcpServers.dcp, undefined)
    } finally {
        await rm(root, { recursive: true, force: true })
    }
})
