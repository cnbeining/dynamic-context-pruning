import { saveClaudeSessionState } from "../state/store"
import type { ClaudeSessionState } from "../state/types"
import type { HookPipelineResult, PostResponseContext } from "./types"

function toClaudeSessionState(state: unknown): ClaudeSessionState {
    const prune = (state as any)?.prune
    const toolMap = prune?.tools
    const messageMap = prune?.messages

    return {
        prune: {
            tools: toolMap instanceof Map ? toolMap : new Map<string, number>(),
            messages: messageMap instanceof Map ? messageMap : new Map<string, number>(),
        },
    }
}

export async function runPostResponsePipeline(
    context: PostResponseContext,
): Promise<HookPipelineResult> {
    if (!context.storageDir || !context.sessionId) {
        return { mode: "normal" }
    }

    try {
        await saveClaudeSessionState(
            context.storageDir,
            context.sessionId,
            toClaudeSessionState(context.state),
        )
        return { mode: "normal" }
    } catch {
        return { mode: "fail-open" }
    }
}
