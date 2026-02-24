import assert from "node:assert/strict"
import { test } from "node:test"

import { executeCompress } from "../../../lib/claude/mcp/tools/compress"
import { dispatchMcpTool } from "../../../lib/claude/mcp/server"

test("executeCompress rejects missing content", async () => {
    await assert.rejects(
        () => executeCompress({ topic: "topic", content: undefined as any }),
        /Missing content/,
    )
})

test("executeCompress returns compressed range for valid args", async () => {
    const result = await executeCompress({
        topic: "Auth exploration",
        content: { startId: "m0001", endId: "m0010", summary: "Condensed" },
    })

    assert.deepEqual(result, {
        status: "ok",
        compressed: true,
        topic: "Auth exploration",
        range: { startId: "m0001", endId: "m0010" },
    })
})

test("dispatchMcpTool routes to prune handler", async () => {
    const result = await dispatchMcpTool({
        tool: "prune",
        args: { ids: ["7"] },
    })

    assert.deepEqual(result, { status: "ok", pruned: 1, ids: ["7"] })
})

test("dispatchMcpTool rejects non-object args", async () => {
    await assert.rejects(
        () => dispatchMcpTool({ tool: "compress", args: undefined as any }),
        /Invalid MCP args/,
    )
})
