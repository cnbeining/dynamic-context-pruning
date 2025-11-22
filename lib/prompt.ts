/**
 * Minimize message structure for AI analysis - keep only what's needed
 * to determine if tool calls are obsolete
 */
function minimizeMessages(messages: any[]): any[] {
    return messages.map(msg => {
        const minimized: any = {
            role: msg.info?.role
        }

        // Keep essential parts only
        if (msg.parts) {
            minimized.parts = msg.parts
                .filter((part: any) => {
                    // Completely remove step markers - they add no value for janitor
                    if (part.type === 'step-start' || part.type === 'step-finish') {
                        return false
                    }
                    return true
                })
                .map((part: any) => {
                    // For text parts, keep the text content (needed for user intent & retention requests)
                    if (part.type === 'text') {
                        return {
                            type: 'text',
                            text: part.text
                        }
                    }

                    // For tool parts, keep what's needed for pruning decisions
                    if (part.type === 'tool') {
                        const toolPart: any = {
                            type: 'tool',
                            callID: part.callID,
                            tool: part.tool
                        }

                        // Keep the actual output - janitor needs to see what was returned
                        if (part.state?.output) {
                            toolPart.output = part.state.output
                        }

                        // Include minimal input for deduplication context
                        // Only keep resource identifiers, not full nested structures
                        if (part.state?.input) {
                            const input = part.state.input

                            // For file operations, just keep the file path
                            if (input.filePath) {
                                toolPart.input = { filePath: input.filePath }
                            }
                            // For batch operations, summarize instead of full array
                            else if (input.tool_calls && Array.isArray(input.tool_calls)) {
                                toolPart.input = {
                                    batch_summary: `${input.tool_calls.length} tool calls`,
                                    tools: input.tool_calls.map((tc: any) => tc.tool)
                                }
                            }
                            // For other operations, keep minimal input
                            else {
                                toolPart.input = input
                            }
                        }

                        return toolPart
                    }

                    // Skip all other part types (they're not relevant to pruning)
                    return null
                })
                .filter(Boolean) // Remove nulls
        }

        return minimized
    })
}

export function buildAnalysisPrompt(unprunedToolCallIds: string[], messages: any[], protectedTools: string[]): string {
    const protectedToolsText = protectedTools.length > 0
        ? `- NEVER prune tool calls from these protected tools: ${protectedTools.join(", ")}\n`
        : '';

    // Minimize messages to reduce token usage
    const minimizedMessages = minimizeMessages(messages)

    return `You are a conversation analyzer that identifies obsolete tool outputs in a coding session.

Your task: Analyze the session history and identify tool call IDs whose outputs are NO LONGER RELEVANT to the current conversation context.

Guidelines for identifying obsolete tool calls:
1. Tool outputs that were superseded by newer reads of the same file/resource
2. Exploratory reads that didn't lead to actual edits or meaningful discussion AND were not explicitly requested to be retained
3. Tool calls from >10 turns ago that are no longer referenced and have served their purpose
4. Error outputs that were subsequently fixed
5. Tool calls whose information has been replaced by more recent operations

DO NOT prune:
${protectedToolsText}
- Tool calls that modified state (edits, writes, etc.)
- Tool calls whose outputs are actively being discussed
- Tool calls that produced errors still being debugged
- Tool calls where the user explicitly indicated they want to retain the information (e.g., "save this", "remember this", "keep this for later", "don't output anything else but save this")
- Tool calls that are the MOST RECENT activity in the conversation (these may be intended for future use)

IMPORTANT: Available tool call IDs for analysis: ${unprunedToolCallIds.join(", ")}

You may see additional tool call IDs in the session history below, but those have already been pruned (either by automatic deduplication or previous analysis runs) and their outputs replaced with placeholders. ONLY return IDs from the available list above.

Session history:
${JSON.stringify(minimizedMessages, null, 2)}

You MUST respond with valid JSON matching this exact schema:
{
  "pruned_tool_call_ids": ["id1", "id2", ...],
  "reasoning": "explanation of why these IDs were selected"
}

Return ONLY the tool call IDs from the available list above that should be pruned.`
}
