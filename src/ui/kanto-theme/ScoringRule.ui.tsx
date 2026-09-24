import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const HEAD = "flex w-full border-b border-theme-faint pb-2";
/**
 * One column until there is room for a row. The panel is only 288px wide on a
 * phone, where a case, its ladder and its note side by side left each of them
 * one word per line.
 */
const ROW =
	"flex w-full flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3";
const CASE = "shrink-0 sm:w-28";
const LADDER = "flex flex-wrap items-center gap-1";
const NOTE = "shrink-0 sm:ml-auto";

const MISS_COLOR: KantoColor = "cinnabar";
const PART_COLOR: KantoColor = "saffron";
const FULL_COLOR: KantoColor = "viridian";

const MISS_PAYS = "0";
const SINGLE_PAYS = "1";
const MULTIPLE_PAYS = "2";
const PARTIAL_PAYS = ["0.5", "1", "1.5"] as const;

const TITLE_WORDS = "Score info";

type Rung = { pays: string; color: KantoColor };

const miss: Rung = { pays: MISS_PAYS, color: MISS_COLOR };

const CASES = [
	{
		lead: "single answer",
		note: "right or not",
		ladder: [miss, { pays: SINGLE_PAYS, color: FULL_COLOR }],
	},
	{
		lead: "multiple answers",
		note: `all of them pays ${MULTIPLE_PAYS}`,
		ladder: [
			miss,
			...PARTIAL_PAYS.map((pays) => ({ pays, color: PART_COLOR })),
			{ pays: MULTIPLE_PAYS, color: FULL_COLOR },
		],
	},
] as const satisfies readonly {
	lead: string;
	note: string;
	ladder: readonly Rung[];
}[];

export const SCORING_RULE_LABEL = "How a correct answer is counted";

export const ScoringRule = () => (
	<>
		<span className={HEAD}>
			<Typography variant="label" as="span">
				{TITLE_WORDS}
			</Typography>
		</span>

		{CASES.map((entry) => (
			<span key={entry.lead} className={ROW}>
				<span className={CASE}>
					<Typography variant="label" as="span">
						{entry.lead}
					</Typography>
				</span>
				<span className={LADDER}>
					{entry.ladder.map((rung) => (
						<Badge key={rung.pays} color={rung.color}>
							{rung.pays}
						</Badge>
					))}
				</span>
				<span className={NOTE}>
					<Typography variant="hint" as="span">
						{entry.note}
					</Typography>
				</span>
			</span>
		))}
	</>
);
