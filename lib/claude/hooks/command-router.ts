import type { ParsedDcpCommand } from "./types"

export function parseDcpCommand(text: string): ParsedDcpCommand | null {
    const trimmed = text.trim()
    if (!trimmed.startsWith("@dcp")) {
        return null
    }

    const parts = trimmed.split(/\s+/)
    const command = parts[1] ?? "help"
    const args = parts.slice(2)

    return {
        command,
        args,
    }
}
