import { cva } from "class-variance-authority";

export type StatusBadgeVariant = "pass" | "part" | "fail" | "skip" | "run";

const LABEL: Record<StatusBadgeVariant, string> = {
	pass: "PASS",
	part: "PART",
	fail: "FAIL",
	skip: "SKIP",
	run: "RUN",
};

const badge = cva(
	"inline-flex min-w-14 justify-center rounded px-1.5 py-0.5 text-xs font-bold tracking-widest",
	{
		variants: {
			variant: {
				pass: "bg-viridian text-black",
				part: "bg-white text-black",
				fail: "bg-cinnabar text-black",
				skip: "bg-zinc-600 text-zinc-100",
				run: "bg-saffron text-black",
			} satisfies Record<StatusBadgeVariant, string>,
		},
	}
);

export const StatusBadge = ({ variant }: { variant: StatusBadgeVariant }) => (
	<span className={badge({ variant })}>{LABEL[variant]}</span>
);
