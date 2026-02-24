import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { constants } from "node:fs"
import { dirname, join } from "node:path"

import type { ClaudeSessionState } from "./types"

interface PersistedClaudeSessionState {
    prune: {
        tools: Record<string, number>
        messages: Record<string, number>
    }
}

function sanitizeSessionId(sessionId: string): string {
    if (!/^[A-Za-z0-9._-]+$/.test(sessionId)) {
        throw new Error("Invalid sessionId. Use only letters, numbers, dot, underscore, and dash.")
    }
    return sessionId
}

function getSessionPath(baseDir: string, sessionId: string): string {
    const safeSessionId = sanitizeSessionId(sessionId)
    return join(baseDir, "sessions", `${safeSessionId}.json`)
}

function toPersistedState(state: ClaudeSessionState): PersistedClaudeSessionState {
    return {
        prune: {
            tools: Object.fromEntries(state.prune.tools),
            messages: Object.fromEntries(state.prune.messages),
        },
    }
}

function fromPersistedState(state: PersistedClaudeSessionState): ClaudeSessionState | null {
    if (!state || typeof state !== "object") {
        return null
    }

    const prune = state.prune
    if (!prune || typeof prune !== "object") {
        return null
    }

    const tools = prune.tools
    const messages = prune.messages
    if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
        return null
    }
    if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
        return null
    }

    return {
        prune: {
            tools: new Map(Object.entries(tools)),
            messages: new Map(Object.entries(messages)),
        },
    }
}

export async function saveClaudeSessionState(
    baseDir: string,
    sessionId: string,
    state: ClaudeSessionState,
): Promise<void> {
    const sessionPath = getSessionPath(baseDir, sessionId)
    const sessionsDir = dirname(sessionPath)
    await mkdir(sessionsDir, { recursive: true })

    const tempPath = `${sessionPath}.tmp-${process.pid}-${Date.now()}`
    const data = JSON.stringify(toPersistedState(state), null, 2)

    await writeFile(tempPath, data, "utf8")
    await rename(tempPath, sessionPath)
}

export async function loadClaudeSessionState(
    baseDir: string,
    sessionId: string,
): Promise<ClaudeSessionState | null> {
    const sessionPath = getSessionPath(baseDir, sessionId)

    try {
        await access(sessionPath, constants.F_OK)
    } catch {
        return null
    }

    try {
        const raw = await readFile(sessionPath, "utf8")
        const parsed = JSON.parse(raw) as PersistedClaudeSessionState
        return fromPersistedState(parsed)
    } catch {
        return null
    }
}
