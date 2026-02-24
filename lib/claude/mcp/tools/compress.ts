import type { CompressArgs } from "../types"

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function executeCompress(args: CompressArgs) {
    if (!isRecord(args)) {
        throw new Error("Invalid args. Compression expects an object payload.")
    }

    if (!isRecord(args.content)) {
        throw new Error("Missing content. Compression requires startId, endId, and summary.")
    }

    const { startId, endId, summary } = args.content

    if (typeof args.topic !== "string" || args.topic.trim().length === 0) {
        throw new Error("Missing topic. Compression requires a non-empty topic.")
    }
    if (typeof startId !== "string" || startId.trim().length === 0) {
        throw new Error("Missing content.startId.")
    }
    if (typeof endId !== "string" || endId.trim().length === 0) {
        throw new Error("Missing content.endId.")
    }
    if (typeof summary !== "string" || summary.trim().length === 0) {
        throw new Error("Missing content.summary.")
    }

    return {
        status: "ok" as const,
        compressed: true,
        topic: args.topic,
        range: { startId, endId },
    }
}
