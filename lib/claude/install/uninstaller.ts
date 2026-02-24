import { readFile, writeFile } from "node:fs/promises"

interface UninstallOptions {
    configPath: string
}

function normalizeConfig(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return {}
    }
    return { ...(input as Record<string, unknown>) }
}

export async function uninstallClaudeDcp({ configPath }: UninstallOptions): Promise<void> {
    let config: Record<string, unknown>

    try {
        const content = await readFile(configPath, "utf-8")
        config = normalizeConfig(JSON.parse(content))
    } catch {
        return
    }

    const mcpServers =
        config.mcpServers &&
        typeof config.mcpServers === "object" &&
        !Array.isArray(config.mcpServers)
            ? { ...(config.mcpServers as Record<string, any>) }
            : {}

    if (mcpServers.dcp?.managedBy === "dcp") {
        delete mcpServers.dcp
    }

    const hooks =
        config.hooks && typeof config.hooks === "object" && !Array.isArray(config.hooks)
            ? { ...(config.hooks as Record<string, any>) }
            : {}

    if (hooks.dcp?.managedBy === "dcp") {
        delete hooks.dcp
    }

    const nextConfig = {
        ...config,
        mcpServers,
        hooks,
    }

    await writeFile(configPath, JSON.stringify(nextConfig, null, 2) + "\n", "utf-8")
}
