import type { StrategyRunnerContext } from "../core/types"

export interface HookPipelineResult {
    mode: "normal" | "fail-open"
}

export interface PreSendDeps {
    runAutomaticStrategies: (context: StrategyRunnerContext) => void
}

export interface ParsedDcpCommand {
    command: string
    args: string[]
}

export type PostResponseContext = StrategyRunnerContext & {
    storageDir?: string
    sessionId?: string
}
