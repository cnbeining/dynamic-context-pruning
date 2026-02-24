import { runAutomaticStrategies } from "../core/run-automatic-strategies"
import type { StrategyRunnerContext } from "../core/types"
import type { HookPipelineResult, PreSendDeps } from "./types"

const DEFAULT_DEPS: PreSendDeps = {
    runAutomaticStrategies,
}

export async function runPreSendPipeline(
    context: StrategyRunnerContext,
    deps: PreSendDeps = DEFAULT_DEPS,
): Promise<HookPipelineResult> {
    try {
        deps.runAutomaticStrategies(context)
        return { mode: "normal" }
    } catch {
        return { mode: "fail-open" }
    }
}
