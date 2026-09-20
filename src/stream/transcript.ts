import type { Message, SystemMessage, Tool } from "@earendil-works/pi-ai";

/**
 * The provider receives normalized transcript messages on newer Pi releases, but
 * older releases still pass the prompt and tools as top-level context fields.
 * Keep this adapter local so loading the provider does not require a newer
 * pi-ai subpath at runtime.
 */
type TranscriptInput = {
	messages: readonly Message[];
	systemPrompt?: string;
	tools?: readonly Tool[];
};

function isSystemMessage(message: Message): message is SystemMessage {
	return message.role === "system";
}

function contentText(content: SystemMessage["content"]): string {
	return typeof content === "string" ? content : content.map((block) => block.text).join("\n");
}

function replayMessages(context: TranscriptInput): readonly Message[] {
	if (context.messages.some(isSystemMessage)) return context.messages;

	const systemPrompt = context.systemPrompt ?? "";
	const tools = context.tools ?? [];
	if (systemPrompt.length === 0 && tools.length === 0) return context.messages;

	return [
		{
			role: "system",
			content: systemPrompt,
			...(tools.length > 0 ? { toolsAdded: [...tools] } : {}),
			timestamp: 0,
		},
		...context.messages,
	];
}

/** Render the current system prompt from either normalized or legacy Pi context. */
export function getCurrentSystemPrompt(context: TranscriptInput): string {
	const content: string[] = [];
	const sections = new Map<string, string>();

	for (const message of replayMessages(context)) {
		if (!isSystemMessage(message)) continue;

		const text = contentText(message.content);
		if (text.length > 0) content.push(text);
		for (const [name, value] of Object.entries(message.sections ?? {})) {
			if (value === null) sections.delete(name);
			else sections.set(name, value);
		}
	}

	return [content.join("\n\n"), ...sections.values()]
		.filter((part) => part.length > 0)
		.join("\n\n");
}

/** Resolve the tools available after applying transcript tool deltas. */
export function getCurrentTools(context: TranscriptInput): Tool[] {
	const tools = new Map<string, Tool>();

	for (const message of replayMessages(context)) {
		if (!isSystemMessage(message)) continue;
		for (const tool of message.toolsRemoved ?? []) tools.delete(tool.name);
		for (const tool of message.toolsAdded ?? []) tools.set(tool.name, tool);
	}

	return [...tools.values()];
}
