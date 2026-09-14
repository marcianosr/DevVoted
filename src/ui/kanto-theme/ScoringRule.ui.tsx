import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full items-center gap-2";
const CASE = "min-w-0 flex-1";
const PAYS = "ml-auto shrink-0";

const SINGLE_LEAD = "Single choice is worth";
const MULTIPLE_LEAD = "Multiple choice, answered exactly";
const PARTIAL_LEAD = "Catch part of a multiple-choice key and it pays a share:";
const PAYS_COLOR: KantoColor = "viridian";

const SINGLE_PAYS = "1";
const MULTIPLE_PAYS = "2";

/**
 * The share is quantised to quarters and can never reach a whole one (ADR-079),
 * so these three rungs are the ladder itself, not samples off it.
 */
const PARTIAL_RUNGS = [
	{ share: "a quarter of it", pays: "0.5" },
	{ share: "half of it", pays: "1" },
	{ share: "three quarters", pays: "1.5" },
] as const;

const CANCELLED_NOTE =
	"As many wrong picks as right is a miss, not a part: it pays nothing and breaks the streak.";
const TALLY_NOTE =
	"A part pays coverage only. It never counts toward the correct tally beside this, which is what the gate's swatch reads.";

export const SCORING_RULE_LABEL = "How a correct answer is counted";

export const ScoringRule = () => (
	<>
		<span className={ROW}>
			<Typography variant="hint" as="span">
				{SINGLE_LEAD}
			</Typography>
			<span className={PAYS}>
				<Badge color={PAYS_COLOR}>{SINGLE_PAYS}</Badge>
			</span>
		</span>

		<span className={ROW}>
			<Typography variant="hint" as="span">
				{MULTIPLE_LEAD}
			</Typography>
			<span className={PAYS}>
				<Badge color={PAYS_COLOR}>{MULTIPLE_PAYS}</Badge>
			</span>
		</span>

		<Typography variant="hint" as="span">
			{PARTIAL_LEAD}
		</Typography>

		{PARTIAL_RUNGS.map((rung) => (
			<span key={rung.share} className={ROW}>
				<span className={CASE}>
					<Typography variant="hint" as="span">
						{rung.share}
					</Typography>
				</span>
				<span className={PAYS}>
					<Badge color={PAYS_COLOR}>{rung.pays}</Badge>
				</span>
			</span>
		))}

		<Typography variant="hint" as="span">
			{CANCELLED_NOTE}
		</Typography>

		<Typography variant="hint" as="span">
			{TALLY_NOTE}
		</Typography>
	</>
);
