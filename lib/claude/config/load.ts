import { readFile } from "node:fs/promises"

import { DEFAULT_CLAUDE_CONFIG } from "./defaults"
import type { ClaudeConfig, ClaudePrunePermission, LoadClaudeConfigOptions } from "./types"

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function deepMerge(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...base }

    for (const [key, value] of Object.entries(override)) {
        const existing = merged[key]

        if (isPlainObject(existing) && isPlainObject(value)) {
            merged[key] = deepMerge(existing, value)
            continue
        }

        merged[key] = value
    }

    return merged
}

async function readConfigFile(path?: string): Promise<Record<string, unknown> | null> {
    if (!path) {
        return null
    }

    try {
        const content = await readFile(path, "utf-8")
        const parsed = JSON.parse(content)
        return isPlainObject(parsed) ? parsed : null
    } catch {
        return null
    }
}

function hasValidPrunePermission(permission: unknown): permission is ClaudePrunePermission {
    return permission === "allow" || permission === "ask" || permission === "deny"
}

function normalizePrunePermission(config: ClaudeConfig): ClaudeConfig {
    const permission = config.tools?.prune?.permission

    if (hasValidPrunePermission(permission)) {
        return config
    }

    return deepMerge(config as Record<string, unknown>, {
        tools: {
            prune: {
                permission: DEFAULT_CLAUDE_CONFIG.tools.prune.permission,
            },
        },
    }) as ClaudeConfig
}

export async function loadClaudeConfig(
    options: LoadClaudeConfigOptions = {},
): Promise<ClaudeConfig> {
    const globalConfig = await readConfigFile(options.globalPath)
    const projectConfig = await readConfigFile(options.projectPath)

    const mergedWithGlobal = deepMerge(
        DEFAULT_CLAUDE_CONFIG as Record<string, unknown>,
        globalConfig ?? {},
    )
    const mergedWithProject = deepMerge(mergedWithGlobal, projectConfig ?? {}) as ClaudeConfig

    return normalizePrunePermission(mergedWithProject)
}
