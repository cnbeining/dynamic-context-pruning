import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { runAutomaticStrategies } from "../../../lib/claude/core/run-automatic-strategies"

describe("runAutomaticStrategies", () => {
    it("runs strategies in deterministic order", () => {
        const order: string[] = []
        const context = {
            state: { id: "state" } as any,
            logger: { id: "logger" } as any,
            config: { id: "config" } as any,
            messages: [{ id: "message" }] as any,
        }

        runAutomaticStrategies(context, {
            deduplicate: (state, logger, config, messages) => {
                order.push("deduplicate")
                assert.equal(state, context.state)
                assert.equal(logger, context.logger)
                assert.equal(config, context.config)
                assert.equal(messages, context.messages)
            },
            supersedeWrites: (state, logger, config, messages) => {
                order.push("supersedeWrites")
                assert.equal(state, context.state)
                assert.equal(logger, context.logger)
                assert.equal(config, context.config)
                assert.equal(messages, context.messages)
            },
            purgeErrors: (state, logger, config, messages) => {
                order.push("purgeErrors")
                assert.equal(state, context.state)
                assert.equal(logger, context.logger)
                assert.equal(config, context.config)
                assert.equal(messages, context.messages)
            },
        })

        assert.deepEqual(order, ["deduplicate", "supersedeWrites", "purgeErrors"])
    })
})
