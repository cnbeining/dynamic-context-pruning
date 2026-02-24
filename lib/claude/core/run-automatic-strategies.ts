import { deduplicate } from "../../strategies/deduplication"
import { supersedeWrites } from "../../strategies/supersede-writes"
import { purgeErrors } from "../../strategies/purge-errors"
import type { StrategyRunnerContext, StrategyRunnerDeps } from "./types"

const DEFAULT_DEPS: StrategyRunnerDeps = {
    deduplicate,
    supersedeWrites,
    purgeErrors,
}

export function runAutomaticStrategies(
    context: StrategyRunnerContext,
    deps: StrategyRunnerDeps = DEFAULT_DEPS,
): void {
    const { state, logger, config, messages } = context

    deps.deduplicate(state, logger, config, messages)
    deps.supersedeWrites(state, logger, config, messages)
    deps.purgeErrors(state, logger, config, messages)
}
