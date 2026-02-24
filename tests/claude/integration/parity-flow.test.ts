import assert from "node:assert/strict"
import { test } from "node:test"

import { runPreSendPipeline } from "../../../lib/claude/hooks/pre-send"

test("auto strategies invoke the real runner before model turn", async () => {
    const calls: string[] = []

    await runPreSendPipeline(
        {
            state: { prune: { tools: new Map(), messages: new Map() } } as any,
            logger: {} as any,
            config: {
                manualMode: { enabled: false, automaticStrategies: true },
                strategies: {
                    deduplication: { enabled: false, protectedTools: [] },
                    supersedeWrites: { enabled: false },
                    purgeErrors: { enabled: false, turns: 4, protectedTools: [] },
                },
            } as any,
            messages: [],
        },
        {
            runAutomaticStrategies: () => {
                calls.push("ran")
            },
        },
    )

    assert.deepEqual(calls, ["ran"])
})
