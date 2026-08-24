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

const isAuditId = (id: string): id is AuditId =>
	AUDIT_ORDER.some((known) => known === id);

/** The model's id for an audit, narrowed to the one the kit draws. `timeout-3`
 * and `strip-1` carry the per-gate number the model needs; the player sees one
 * Timeout and one Strip, so the suffix comes off. Null rather than a fallback
 * for an id with no entry: a missing icon should be missing, not wrong. */
export const toAuditId = (id: string): AuditId | null => {
	if (isAuditId(id)) return id;
	const collapsed = id.replace(/-\d+$/, "");
	return isAuditId(collapsed) ? collapsed : null;
};
