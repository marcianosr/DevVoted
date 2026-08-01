import { cva } from "class-variance-authority";

import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";

// The dot is a color-only signal, so every variant carries a spoken state name
// for screen readers — the text label the badge had is otherwise lost.
const LABEL: Record<StatusBadgeVariant, string> = {
	pass: "passed",
	part: "partial",
	fail: "failed",
	skip: "skipped",
	run: "running",
	perk: "perk",
};

const dot = cva("inline-block h-2.5 w-2.5 rounded-full", {
	variants: {
		variant: {
			pass: "bg-viridian",
			part: "bg-white",
			fail: "bg-cinnabar",
			skip: "bg-zinc-600",
			run: "bg-saffron",
			// Perks back no check — a hollow ring reads "nothing to report",
			// distinct from skip's gray fill by shape, not only by color.
			perk: "border-2 border-pewter",
		} satisfies Record<StatusBadgeVariant, string>,
	},
});

export const StatusDot = ({ variant }: { variant: StatusBadgeVariant }) => (
	<span role="img" aria-label={LABEL[variant]} className={dot({ variant })} />
);
