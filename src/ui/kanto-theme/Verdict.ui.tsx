import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

export type VerdictOutcome = "correct" | "partial" | "wrong";

export const VERDICT_COLOR = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
} satisfies Record<VerdictOutcome, KantoColor>;

const VERDICT_WORD = {
	correct: "PASS",
	partial: "PART",
	wrong: "FAIL",
} satisfies Record<VerdictOutcome, string>;

const COLUMN = "flex w-20 shrink-0 justify-start";

export type VerdictProps = { outcome: VerdictOutcome };

export const Verdict = ({ outcome }: VerdictProps) => (
	<span className={COLUMN}>
		<Badge color={VERDICT_COLOR[outcome]}>{VERDICT_WORD[outcome]}</Badge>
	</span>
);
