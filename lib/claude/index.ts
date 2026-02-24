export { runAutomaticStrategies } from "./core/run-automatic-strategies"

export function getClaudeDcpRuntimeInfo() {
    return {
        runtime: "claude-code" as const,
        mode: "mcp-hooks" as const,
    }
}
