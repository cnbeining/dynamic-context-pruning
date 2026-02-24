import type { PruneArgs } from "../types"

export async function executePrune(args: PruneArgs) {
    if (!Array.isArray(args.ids) || args.ids.length === 0) {
        throw new Error("Missing ids. You must provide at least one ID to prune.")
    }

    if (!args.ids.every((id) => typeof id === "string" && id.trim().length > 0)) {
        throw new Error("Invalid ids. All IDs must be non-empty strings.")
    }

    return {
        status: "ok" as const,
        pruned: args.ids.length,
        ids: args.ids,
    }
}
