import type { DistillArgs } from "../types"

export async function executeDistill(args: DistillArgs) {
    if (!Array.isArray(args.targets) || args.targets.length === 0) {
        throw new Error("Missing targets. Provide at least one { id, distillation } entry.")
    }

    for (const target of args.targets) {
        if (!target || typeof target.id !== "string" || target.id.trim().length === 0) {
            throw new Error("Each target must have a non-empty string id.")
        }
        if (typeof target.distillation !== "string" || target.distillation.trim().length === 0) {
            throw new Error("Each target must have a non-empty distillation string.")
        }
    }

    return {
        status: "ok" as const,
        distilled: args.targets.length,
        ids: args.targets.map((target) => target.id),
    }
}
