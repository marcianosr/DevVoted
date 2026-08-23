import type { GlyphName } from "./Glyph.ui";

/** Ids match audit.model.ts, except that Timeout and Strip collapse to one entry
 * each: the model emits timeout-3/4/5 and strip-1/2 because the numbers differ
 * per gate, but they are one audit to a player. */
export type AuditId =
	| "cost-overrun"
	| "dependency-outage"
	| "read-only"
	| "feature-freeze"
	| "mirrored"
	| "timeout"
	| "flaky-build"
	| "memory-leak"
	| "rolling-outage"
	| "breaking-change"
	| "strip";

/** The one place an audit's name and icon are paired. Three screens read it —
 * the Dex tab, the prep fold and the gate header — so a config that shows one
 * icon on the poll page and another in the Dex is not expressible. */
export const AUDIT = {
	"cost-overrun": { label: "Cost Overrun", glyph: "overrun" },
	"dependency-outage": { label: "Dependency Outage", glyph: "outage" },
	"read-only": { label: "Read-only", glyph: "readonly" },
	"feature-freeze": { label: "Feature Freeze", glyph: "freeze" },
	mirrored: { label: "Mirror", glyph: "mirror" },
	timeout: { label: "Timeout", glyph: "timeout" },
	"flaky-build": { label: "Flaky Build", glyph: "flake" },
	"memory-leak": { label: "Memory Leak", glyph: "leak" },
	"rolling-outage": { label: "Rolling Outage", glyph: "rolling" },
	"breaking-change": { label: "Breaking Change", glyph: "breaking" },
	strip: { label: "Strip", glyph: "strip" },
} as const satisfies Record<AuditId, { label: string; glyph: GlyphName }>;

/** Roster order: the gate each first appears at (GATE_AUDITS). */
export const AUDIT_ORDER = [
	"cost-overrun",
	"dependency-outage",
	"read-only",
	"feature-freeze",
	"mirrored",
	"timeout",
	"flaky-build",
	"memory-leak",
	"rolling-outage",
	"breaking-change",
	"strip",
] as const satisfies readonly AuditId[];
