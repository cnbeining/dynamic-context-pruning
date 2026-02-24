import assert from "node:assert/strict"
import { test } from "node:test"

import { parseDcpCommand } from "../../../lib/claude/hooks/command-router"

test("parseDcpCommand parses @dcp stats", () => {
    const parsed = parseDcpCommand("@dcp stats")
    assert.deepEqual(parsed, { command: "stats", args: [] })
})

test("parseDcpCommand returns null for non-command text", () => {
    assert.equal(parseDcpCommand("hello world"), null)
})
