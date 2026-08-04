import { clsx } from "clsx";

import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";

/** The dot speaks check states — plus two affordance marks that carry no
 * state: "use" (a usable-but-idle config; yields to the honest dot once the
 * check arms) and "add" (a shop offer waiting to be bought). */
export type StatusDotVariant = StatusBadgeVariant | "use" | "add";

// The indicator is compact, so every variant carries a spoken state name for
// screen readers — the text label the badge had is otherwise lost.
const LABEL: Record<StatusDotVariant, string> = {
	pass: "passed",
	part: "partial",
	fail: "failed",
	skip: "skipped",
	run: "running",
	perk: "perk",
	use: "usable",
	add: "buyable",
};

// Settled verdicts read as glyphs — a ✓/✗ scans faster than two more colored
// dots and survives color-blindness by shape.
const GLYPH: Partial<Record<StatusDotVariant, string>> = {
	pass: "✓",
	fail: "✗",
	use: "▸",
	add: "＋",
};

const DOT = "h-2.5 w-2.5 rounded-full";

const STYLE: Record<StatusDotVariant, string> = {
	pass: "text-sm font-bold leading-none text-viridian",
	fail: "text-sm font-bold leading-none text-cinnabar",
	part: clsx(DOT, "bg-white"),
	skip: clsx(DOT, "bg-zinc-600"),
	run: clsx(DOT, "bg-saffron"),
	// Perks back no check — a hollow ring reads "nothing to report",
	// distinct from skip's gray fill by shape, not only by color.
	perk: clsx(DOT, "border-2 border-pewter"),
	use: "text-xs leading-none text-pewter",
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
