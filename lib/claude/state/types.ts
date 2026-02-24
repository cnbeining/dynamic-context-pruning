export interface ClaudePruneState {
    tools: Map<string, number>
    messages: Map<string, number>
}

export interface ClaudeSessionState {
    prune: ClaudePruneState
}
