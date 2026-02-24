import type { CompressArgs, DistillArgs, McpDispatchRequest, PruneArgs } from "./types"
import { executeCompress } from "./tools/compress"
import { executeDistill } from "./tools/distill"
import { executePrune } from "./tools/prune"

function asRecord(args: unknown): Record<string, unknown> {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
        throw new Error("Invalid MCP args. Expected a JSON object.")
    }
    return args as Record<string, unknown>
}

export async function dispatchMcpTool(request: McpDispatchRequest) {
    const normalizedArgs = asRecord(request.args)

    switch (request.tool) {
        case "prune":
            return executePrune(normalizedArgs as unknown as PruneArgs)
        case "distill":
            return executeDistill(normalizedArgs as unknown as DistillArgs)
        case "compress":
            return executeCompress(normalizedArgs as unknown as CompressArgs)
        default: {
            const toolName: never = request.tool
            throw new Error(`Unsupported MCP tool: ${toolName}`)
        }
    }
}
