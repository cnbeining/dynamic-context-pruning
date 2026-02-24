import assert from "node:assert/strict"
import { test } from "node:test"

import { executePrune } from "../../../lib/claude/mcp/tools/prune"

test("executePrune rejects missing ids", async () => {
    await assert.rejects(() => executePrune({ ids: [] }), /Missing ids/)
})

test("executePrune returns count for valid ids", async () => {
    const result = await executePrune({ ids: ["1", "2"] })
    assert.deepEqual(result, { status: "ok", pruned: 2, ids: ["1", "2"] })
})
