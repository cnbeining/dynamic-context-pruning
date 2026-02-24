export interface PruneArgs {
    ids: string[]
}

export interface DistillTarget {
    id: string
    distillation: string
}

export interface DistillArgs {
    targets: DistillTarget[]
}

export interface CompressContent {
    startId: string
    endId: string
    summary: string
}

export interface CompressArgs {
    topic: string
    content: CompressContent
}

export type McpToolName = "prune" | "distill" | "compress"

export interface McpDispatchRequest {
    tool: McpToolName
    args: unknown
}
