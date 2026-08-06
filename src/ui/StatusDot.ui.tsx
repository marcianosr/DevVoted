import { clsx } from "clsx";

import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";

/** The dot speaks check states — plus one affordance mark that carries no
 * state: "add" (a shop offer waiting to be bought). An idle linter reads
 * plain "skip": its use-button is the affordance, the dot stays honest. */
export type StatusDotVariant = StatusBadgeVariant | "add";

// The indicator is compact, so every variant carries a spoken state name for
// screen readers — the text label the badge had is otherwise lost.
const LABEL: Record<StatusDotVariant, string> = {
	pass: "passed",
	part: "partial",
	fail: "failed",
	skip: "skipped",
	run: "running",
	add: "buyable",
};

// Settled verdicts read as glyphs — a ✓/✗ scans faster than two more colored
// dots and survives color-blindness by shape.
const GLYPH: Partial<Record<StatusDotVariant, string>> = {
	pass: "✓",
	fail: "✗",
	add: "＋",
};

const DOT = "h-2.5 w-2.5 rounded-full";

const STYLE: Record<StatusDotVariant, string> = {
	pass: "text-sm font-bold leading-none text-viridian",
	fail: "text-sm font-bold leading-none text-cinnabar",
	part: clsx(DOT, "bg-white"),
	skip: clsx(DOT, "bg-zinc-600"),
	run: clsx(DOT, "bg-saffron"),
	add: "text-xs leading-none text-pewter",
};

export const StatusDot = ({ variant }: { variant: StatusDotVariant }) => (
	<span
		role="img"
		aria-label={LABEL[variant]}
		className={clsx("inline-block", STYLE[variant])}
	>
		{GLYPH[variant]}
	</span>
);
