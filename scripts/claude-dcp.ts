#!/usr/bin/env node
import { homedir } from "node:os"
import { join } from "node:path"

import { runPostResponsePipeline } from "../lib/claude/hooks/post-response"
import { runPreSendPipeline } from "../lib/claude/hooks/pre-send"
import { dispatchMcpTool } from "../lib/claude/mcp/server"
import { installClaudeDcp } from "../lib/claude/install/installer"
import { uninstallClaudeDcp } from "../lib/claude/install/uninstaller"

function detectClaudeSettingsPath(): string {
    return join(homedir(), ".claude", "settings.json")
}

function parseJsonArg(raw: string | undefined, fallback: unknown): any {
    if (!raw) {
        return fallback
    }

    try {
        return JSON.parse(raw)
    } catch {
        throw new Error("Expected valid JSON argument")
    }
}

async function runMcpFromCli(rawTool: string | undefined, rawArgs: string | undefined) {
    if (!rawTool) {
        throw new Error("Usage: tsx scripts/claude-dcp.ts mcp <tool> <json-args>")
    }

    const args = parseJsonArg(rawArgs, {})
    const result = await dispatchMcpTool({
        tool: rawTool as "prune" | "distill" | "compress",
        args,
    })
    process.stdout.write(JSON.stringify(result) + "\n")
}

async function runPreSendFromCli(rawContext: string | undefined) {
    const context = parseJsonArg(rawContext, {
        state: {},
        logger: {},
        config: {},
        messages: [],
    })

    const result = await runPreSendPipeline(context)
    process.stdout.write(JSON.stringify(result) + "\n")
}

async function runPostResponseFromCli(rawContext: string | undefined) {
    const context = parseJsonArg(rawContext, {
        state: {},
        logger: {},
        config: {},
        messages: [],
    })

    const result = await runPostResponsePipeline(context)
    process.stdout.write(JSON.stringify(result) + "\n")
}

async function main() {
    const command = process.argv[2]
    const configPath = detectClaudeSettingsPath()

    if (command === "install") {
        await installClaudeDcp({ configPath })
        return
    }

    if (command === "uninstall") {
        await uninstallClaudeDcp({ configPath })
        return
    }

    if (command === "mcp") {
        await runMcpFromCli(process.argv[3], process.argv[4])
        return
    }

    if (command === "hook-presend") {
        await runPreSendFromCli(process.argv[3])
        return
    }

    if (command === "hook-postresponse") {
        await runPostResponseFromCli(process.argv[3])
        return
    }

    throw new Error(
        "Usage: tsx scripts/claude-dcp.ts <install|uninstall|mcp|hook-presend|hook-postresponse>",
    )
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
})
