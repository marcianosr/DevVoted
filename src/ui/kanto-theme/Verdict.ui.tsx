import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

export type VerdictOutcome = "correct" | "partial" | "wrong" | "skipped";

export const VERDICT_COLOR = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
	skipped: "pewter",
} satisfies Record<VerdictOutcome, KantoColor>;

const VERDICT_WORD = {
	correct: "PASS",
	partial: "PART",
	wrong: "FAIL",
	skipped: "SKIP",
} satisfies Record<VerdictOutcome, string>;

const RUNG_FIGURE = new Map([
	[0.25, "¼"],
	[0.5, "½"],
	[0.75, "¾"],
]);

const WIDTH = {
	column: "flex w-24 shrink-0 justify-start",
	fit: "flex shrink-0",
} satisfies Record<VerdictWidth, string>;

const rungFigureFor = (share: number | undefined): string | undefined =>
	share === undefined ? undefined : RUNG_FIGURE.get(share);

export type VerdictWidth = "column" | "fit";

export type VerdictProps = {
	outcome: VerdictOutcome;
	share?: number;
	width?: VerdictWidth;
};

export const Verdict = ({ outcome, share, width = "column" }: VerdictProps) => {
	const rung = outcome === "partial" ? rungFigureFor(share) : undefined;

	return (
		<span className={WIDTH[width]}>
			<Badge color={VERDICT_COLOR[outcome]}>
				{rung === undefined
					? VERDICT_WORD[outcome]
					: `${VERDICT_WORD[outcome]} ${rung}`}
			</Badge>
		</span>
	);
};
