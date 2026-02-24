import assert from "node:assert/strict"
import { test } from "node:test"

import { executeDistill } from "../../../lib/claude/mcp/tools/distill"

test("executeDistill rejects missing targets", async () => {
    await assert.rejects(() => executeDistill({ targets: [] }), /Missing targets/)
})

test("executeDistill returns count for valid targets", async () => {
    const result = await executeDistill({
        targets: [{ id: "3", distillation: "summary" }],
    })

    assert.deepEqual(result, { status: "ok", distilled: 1, ids: ["3"] })
})
