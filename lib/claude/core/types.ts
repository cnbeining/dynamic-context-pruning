import type { PluginConfig } from "../../config"
import type { Logger } from "../../logger"
import type { SessionState, WithParts } from "../../state"

export interface StrategyRunnerContext {
    state: SessionState
    logger: Logger
    config: PluginConfig
    messages: WithParts[]
}

export type StrategyFunction = (
    state: SessionState,
    logger: Logger,
    config: PluginConfig,
    messages: WithParts[],
) => void

export interface StrategyRunnerDeps {
    deduplicate: StrategyFunction
    supersedeWrites: StrategyFunction
    purgeErrors: StrategyFunction
}
