import type { ClaudeConfig } from "./types"

export const DEFAULT_CLAUDE_CONFIG: ClaudeConfig = {
    tools: {
        prune: {
            permission: "allow",
        },
    },
}
