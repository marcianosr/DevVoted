import { cva } from "class-variance-authority";

/**
 * The one test-runner status badge used across the run's reporters — the answer
 * review (correct/partial/wrong), the gate report (passed/skipped/failed), and the
 * forward-looking pipeline lists (a running requirement, an always-on perk) all map
 * their states onto these variants so the badge reads identically everywhere. Solid
 * fill, uppercase; a shared min-width keeps the column aligned even when a label is
 * shorter (RUN) than the others.
 */
export type StatusBadgeVariant =
	"pass" | "part" | "fail" | "skip" | "run" | "perk";

const LABEL: Record<StatusBadgeVariant, string> = {
	pass: "PASS",
	part: "PART",
	fail: "FAIL",
	skip: "SKIP",
	run: "RUN",
	perk: "PERK",
};

const badge = cva(
	"inline-flex min-w-14 justify-center rounded px-1.5 py-0.5 text-xs font-bold tracking-widest",
	{
		variants: {
			variant: {
				pass: "bg-viridian text-black",
				part: "bg-saffron text-black",
				fail: "bg-cinnabar text-black",
				skip: "bg-zinc-600 text-zinc-100",
				run: "bg-cerulean text-black",
				perk: "bg-lavender text-black",
			} satisfies Record<StatusBadgeVariant, string>,
		},
	}
);

export const StatusBadge = ({ variant }: { variant: StatusBadgeVariant }) => (
	<span className={badge({ variant })}>{LABEL[variant]}</span>
);
