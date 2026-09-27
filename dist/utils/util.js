import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { ANTIGRAVITY_MODEL_ENUM } from "../models/models.js";
export function antigravityEnv(name) {
    return process.env[`ANTIGRAVITY_${name}`] || process.env[`NOAGY_${name}`];
}
export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function asString(value) {
    return typeof value === "string" && value ? value : undefined;
}
export function sanitizeText(text) {
    return String(text ?? "").replace(/[\uD800-\uDFFF]/g, "\uFFFD");
}
export function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
export function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const INT63_MASK = (1n << 63n) - 1n;
function formatSignedDecimalSessionId(value) {
    return `-${(value & INT63_MASK).toString()}`;
}
export function deriveSignedDecimalFromHash(text) {
    const digest = createHash("sha256").update(text).digest();
    return formatSignedDecimalSessionId(digest.readBigUInt64BE(0));
}
export function randomSignedDecimalSessionId() {
    return formatSignedDecimalSessionId(randomBytes(8).readBigUInt64BE(0));
}
export function getFirstUserTextForAntigravitySession(context) {
    for (const message of context?.messages ?? []) {
        if (message.role !== "user")
            continue;
        if (typeof message.content === "string")
            return message.content;
        if (Array.isArray(message.content)) {
            for (const item of message.content) {
                if (typeof item === "object" && item !== null && item.type === "text") {
                    return item.text;
                }
            }
        }
    }
    return undefined;
}
export function deriveAntigravitySessionId(context) {
    const text = getFirstUserTextForAntigravitySession(context)?.trim();
    return text ? deriveSignedDecimalFromHash(text) : randomSignedDecimalSessionId();
}
const sessionStates = new Map();
const MAX_SESSIONS = 200;
let sessionsLoaded = false;
function getSessionsFilePath() {
    const envPath = antigravityEnv("SESSIONS_FILE");
    if (envPath)
        return envPath;
    const agentCache = join(homedir(), ".pi", "agent", "cache");
    if (existsSync(join(homedir(), ".pi", "agent"))) {
        return join(agentCache, "antigravity-sessions.json");
    }
    return join(homedir(), ".pi", "cache", "antigravity-sessions.json");
}
function loadPersistedSessions() {
    if (sessionsLoaded)
        return;
    sessionsLoaded = true;
    try {
        const file = getSessionsFilePath();
        if (!existsSync(file))
            return;
        const content = readFileSync(file, "utf8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                if (item && typeof item === "object" && typeof item.sessionId === "string") {
                    sessionStates.set(item.sessionId, item);
                }
            }
        }
    }
    catch {
        // Ignore corrupt or unreadable cache file
    }
}
export function persistAntigravitySessions() {
    try {
        const file = getSessionsFilePath();
        mkdirSync(dirname(file), { recursive: true });
        const data = [...sessionStates.values()];
        writeFileSync(file, JSON.stringify(data), "utf8");
    }
    catch {
        // Ignore write errors
    }
}
/** Reset in-memory cache and load state to simulate a fresh process restart. */
export function resetAntigravitySessionMemory() {
    sessionStates.clear();
    sessionsLoaded = false;
}
export function clearAntigravitySessions() {
    sessionStates.clear();
    sessionsLoaded = true;
    try {
        const file = getSessionsFilePath();
        if (existsSync(file))
            unlinkSync(file);
    }
    catch {
        // Ignore error
    }
}
export function getOrCreateAntigravitySession(sessionId) {
    loadPersistedSessions();
    let state = sessionStates.get(sessionId);
    if (!state) {
        state = {
            agentId: randomUUID(),
            trajectoryId: randomUUID(),
            sessionId,
            stepIndex: 1,
            lastUsedAt: Date.now(),
        };
    }
    else {
        state.stepIndex += 1;
        state.lastUsedAt = Date.now();
        sessionStates.delete(sessionId);
    }
    sessionStates.set(sessionId, state);
    while (sessionStates.size > MAX_SESSIONS) {
        const oldest = sessionStates.keys().next().value;
        if (!oldest)
            break;
        sessionStates.delete(oldest);
    }
    persistAntigravitySessions();
    return state;
}
export function nowRequestId() {
    return antigravityRequestEnvelope("unknown", false).requestId;
}
export function antigravityRequestEnvelope(wireModelId, isClaude, state) {
    const agentId = state?.agentId ?? randomUUID();
    const trajectoryId = state?.trajectoryId ?? randomUUID();
    const step = state?.stepIndex ?? 2;
    const sessionId = state?.sessionId ?? randomSignedDecimalSessionId();
    const usageLabel = isClaude ? "true" : "false";
    const labels = {
        last_step_index: String(step - 1),
        trajectory_id: trajectoryId,
        used_claude: usageLabel,
        used_claude_conservative: usageLabel,
    };
    if (state?.lastExecutionId) {
        labels.last_execution_id = state.lastExecutionId;
    }
    const modelEnum = ANTIGRAVITY_MODEL_ENUM[wireModelId];
    if (modelEnum)
        labels.model_enum = modelEnum;
    return {
        requestId: `agent/${agentId}/${Date.now()}/${trajectoryId}/${step}`,
        sessionId,
        labels,
    };
}
