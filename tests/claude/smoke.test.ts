import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getClaudeDcpRuntimeInfo, runAutomaticStrategies } from "../../lib/claude/index"

describe("claude runtime metadata", () => {
    it("returns claude-code runtime info", () => {
        assert.deepEqual(getClaudeDcpRuntimeInfo(), {
            runtime: "claude-code",
            mode: "mcp-hooks",
        })
    })

    it("re-exports runAutomaticStrategies", () => {
        assert.equal(typeof runAutomaticStrategies, "function")
    })
})
