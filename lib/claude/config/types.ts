export type ClaudePrunePermission = "allow" | "ask" | "deny"

export interface ClaudePruneConfig {
    permission: ClaudePrunePermission
}

export interface ClaudeToolsConfig {
    prune: ClaudePruneConfig
    [key: string]: unknown
}

export interface ClaudeConfig {
    tools: ClaudeToolsConfig
    [key: string]: unknown
}

export interface LoadClaudeConfigOptions {
    globalPath?: string
    projectPath?: string
}
