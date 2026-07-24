import { cva } from "class-variance-authority";

/**
 * The one test-runner status badge used across the run's reporters — the answer
 * review (correct/partial/wrong) and the gate report (passed/skipped/failed) both
 * map their states onto these four variants so the badge reads identically
 * everywhere. Solid fill, uppercase, four-letter labels so a column stays aligned.
 */
export type StatusBadgeVariant = "pass" | "part" | "fail" | "skip";

const LABEL: Record<StatusBadgeVariant, string> = {
	pass: "PASS",
	part: "PART",
	fail: "FAIL",
	skip: "SKIP",
};

const badge = cva(
	"inline-flex justify-center rounded px-1.5 py-0.5 text-xs font-bold tracking-widest",
	{
		variants: {
			variant: {
				pass: "bg-viridian text-black",
				part: "bg-saffron text-black",
				fail: "bg-cinnabar text-black",
				skip: "bg-zinc-600 text-zinc-100",
			} satisfies Record<StatusBadgeVariant, string>,
		},
	}
);

export const StatusBadge = ({ variant }: { variant: StatusBadgeVariant }) => (
	<span className={badge({ variant })}>{LABEL[variant]}</span>
);
