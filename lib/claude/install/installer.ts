import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

interface InstallOptions {
    configPath: string
}

function normalizeConfig(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return {}
    }
    return { ...(input as Record<string, unknown>) }
}

async function readConfig(configPath: string): Promise<Record<string, unknown>> {
    try {
        const content = await readFile(configPath, "utf-8")
        return normalizeConfig(JSON.parse(content))
    } catch (error) {
        const err = error as NodeJS.ErrnoException
        if (err?.code === "ENOENT") {
            return {}
        }
        throw new Error(`Failed to parse Claude settings at ${configPath}`)
    }
}

export async function installClaudeDcp({ configPath }: InstallOptions): Promise<void> {
    await mkdir(dirname(configPath), { recursive: true })

    const config = await readConfig(configPath)

    const mcpServers =
        config.mcpServers &&
        typeof config.mcpServers === "object" &&
        !Array.isArray(config.mcpServers)
            ? { ...(config.mcpServers as Record<string, unknown>) }
            : {}

    mcpServers.dcp = {
        command: "npm",
        args: ["run", "dcp:mcp"],
        managedBy: "dcp",
    }

    const hooks =
        config.hooks && typeof config.hooks === "object" && !Array.isArray(config.hooks)
            ? { ...(config.hooks as Record<string, unknown>) }
            : {}

    hooks.dcp = {
        preSend: "npm run dcp:hook:presend",
        postResponse: "npm run dcp:hook:postresponse",
        managedBy: "dcp",
    }

    const nextConfig = {
        ...config,
        mcpServers,
        hooks,
    }

    await writeFile(configPath, JSON.stringify(nextConfig, null, 2) + "\n", "utf-8")
}
