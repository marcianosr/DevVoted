import type { GlyphName } from "./Glyph.ui";

/** Ids match audit.model.ts one for one. The kit keeps its own copy because a
 * runtime src/ui file may not import a module's domain layer
 * (dependency-cruiser). */
export type AuditId =
	| "cost-overrun"
	| "dependency-outage"
	| "read-only"
	| "feature-freeze"
	| "legal-hold"
	| "mirrored"
	| "timeout"
	| "flaky-build"
	| "memory-leak"
	| "rolling-outage"
	| "breaking-change"
	| "strip"
	| "not-found"
	| "too-many-requests"
	| "upgrade-required"
	| "payload-too-large";

/** The one place an audit's name and icon are paired. Three screens read it —
 * the Dex tab, the prep fold and the gate header — so a config that shows one
 * icon on the poll page and another in the Dex is not expressible. */
export const AUDIT = {
	"cost-overrun": { label: "402 Payment Required", glyph: "overrun" },
	"dependency-outage": { label: "424 Failed Dependency", glyph: "outage" },
	"read-only": { label: "405 Method Not Allowed", glyph: "readonly" },
	"feature-freeze": { label: "403 Forbidden", glyph: "freeze" },
	"legal-hold": {
		label: "451 Unavailable For Legal Reasons",
		glyph: "redact",
	},
	mirrored: { label: "300 Multiple Choices", glyph: "mirror" },
	timeout: { label: "408 Request Timeout", glyph: "timeout" },
	"flaky-build": { label: "502 Bad Gateway", glyph: "flake" },
	"memory-leak": { label: "507 Insufficient Storage", glyph: "leak" },
	"rolling-outage": { label: "503 Service Unavailable", glyph: "rolling" },
	"breaking-change": { label: "409 Conflict", glyph: "breaking" },
	strip: { label: "410 Gone", glyph: "strip" },
	"not-found": { label: "404 Not Found", glyph: "notfound" },
	"too-many-requests": { label: "429 Too Many Requests", glyph: "ratelimit" },
	"upgrade-required": { label: "426 Upgrade Required", glyph: "upgrade" },
	"payload-too-large": { label: "413 Payload Too Large", glyph: "payload" },
} as const satisfies Record<AuditId, { label: string; glyph: GlyphName }>;

/** Roster order: the earliest gate each audit can be drawn at. */
export const AUDIT_ORDER = [
	"cost-overrun",
	"dependency-outage",
	"not-found",
	"read-only",
	"mirrored",
	"timeout",
	"flaky-build",
	"rolling-outage",
	"memory-leak",
	"breaking-change",
	"too-many-requests",
	"strip",
	"upgrade-required",
	"feature-freeze",
	"legal-hold",
	"payload-too-large",
] as const satisfies readonly AuditId[];

const isAuditId = (id: string): id is AuditId =>
	AUDIT_ORDER.some((known) => known === id);

/** The model's id for an audit, narrowed to the one the kit draws. Null rather
 * than a fallback for an id with no entry: a missing icon should be missing,
 * not wrong. */
export const toAuditId = (id: string): AuditId | null =>
	isAuditId(id) ? id : null;
