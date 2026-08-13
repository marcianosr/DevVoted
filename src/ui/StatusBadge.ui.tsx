import { clsx } from "clsx";

export type StatusBadgeVariant = "pass" | "part" | "fail" | "skip" | "run";

/**
 * Solid is the verdict badge: one per screen, shouting the result. Outline is
 * the same badge repeated down a list, where a column of filled blocks reads
 * louder than the answers it labels — it still colour-codes the row without
 * competing with it.
 */
export type StatusBadgeEmphasis = "solid" | "outline";

const LABEL: Record<StatusBadgeVariant, string> = {
	pass: "PASS",
	part: "PART",
	fail: "FAIL",
	skip: "SKIP",
	run: "RUN",
};

const BASE =
	"inline-flex min-w-14 justify-center rounded px-1.5 py-0.5 text-xs font-bold tracking-widest";

const SOLID: Record<StatusBadgeVariant, string> = {
	pass: "bg-viridian text-black",
	part: "bg-white text-black",
	fail: "bg-cinnabar text-black",
	skip: "bg-zinc-600 text-zinc-100",
	run: "bg-saffron text-black",
};

// Outline picks the lighter half of each pair (celadon over viridian,
// vermillion over cinnabar): a 1px stroke of the darker tone disappears into a
// near-black page, where the filled version had the black text to carry it.
const OUTLINE: Record<StatusBadgeVariant, string> = {
	pass: "border border-celadon text-celadon",
	part: "border border-saffron text-saffron",
	fail: "border border-vermillion text-vermillion",
	skip: "border border-edge-strong text-pewter",
	run: "border border-saffron text-saffron",
};

type StatusBadgeProps = {
	variant: StatusBadgeVariant;
	emphasis?: StatusBadgeEmphasis;
};

export const StatusBadge = ({
	variant,
	emphasis = "solid",
}: StatusBadgeProps) => (
	<span
		className={clsx(
			BASE,
			emphasis === "solid" ? SOLID[variant] : OUTLINE[variant]
		)}
	>
		{LABEL[variant]}
	</span>
);
