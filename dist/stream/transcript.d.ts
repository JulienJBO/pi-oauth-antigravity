import type { Message, Tool } from "@earendil-works/pi-ai";
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
/** Render the current system prompt from either normalized or legacy Pi context. */
export declare function getCurrentSystemPrompt(context: TranscriptInput): string;
/** Resolve the tools available after applying transcript tool deltas. */
export declare function getCurrentTools(context: TranscriptInput): Tool[];
export {};
