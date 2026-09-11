import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Fold } from "./Fold.ui";
import { OptionChip } from "./OptionChip.ui";
import { Typography } from "./Typography.ui";
import { VERDICT_COLOR, type VerdictOutcome } from "./Verdict.ui";

const DIFF = "flex w-full flex-col gap-3";
const SIDE = "flex w-full gap-4";
const SIDE_LABEL = "w-20 shrink-0 pt-1";
const CHIPS = "flex min-w-0 flex-1 flex-wrap items-center gap-2";

const EXPECTED_LABEL = "Expected";
const RECEIVED_LABEL = "Received";

const EXPECTED_COLOR: KantoColor = "celadon";
const TALLY_COLOR: KantoColor = "saffron";

export type DiffOption = { letter: string; label: string };

export type AnswerDiffProps = {
	outcome: VerdictOutcome;
	answerType?: AnswerType;
	expected: readonly DiffOption[];
	received: readonly DiffOption[];
	others?: readonly DiffOption[];
	tally?: string;
	othersLabel?: string;
	othersOpen?: boolean;
};

const Side = ({
	label,
	options,
	answerType,
	color,
	filled,
	tally,
}: {
	label: string;
	options: readonly DiffOption[];
	answerType?: AnswerType;
	color: KantoColor;
	filled: boolean;
	tally?: string;
}) => (
	<div className={SIDE}>
		<span className={SIDE_LABEL}>
			<Typography variant="label" as="span">
				{label}
			</Typography>
		</span>
		<span className={CHIPS}>
			{options.map((option) => (
				<OptionChip
					key={option.label}
					letter={option.letter}
					label={option.label}
					answerType={answerType}
					color={color}
					filled={filled}
				/>
			))}
			{tally === undefined ? null : <Badge color={TALLY_COLOR}>{tally}</Badge>}
		</span>
	</div>
);

export const AnswerDiff = ({
	outcome,
	answerType,
	expected,
	received,
	others = [],
	tally,
	othersLabel,
	othersOpen,
}: AnswerDiffProps) => (
	<div className={DIFF}>
		<Side
			label={EXPECTED_LABEL}
			options={expected}
			answerType={answerType}
			color={EXPECTED_COLOR}
			filled={false}
		/>
		<Side
			label={RECEIVED_LABEL}
			options={received}
			answerType={answerType}
			color={VERDICT_COLOR[outcome]}
			filled
			tally={tally}
		/>
		{others.length === 0 || othersLabel === undefined ? null : (
			<Fold title={othersLabel} heading="row" open={othersOpen}>
				<span className={CHIPS}>
					{others.map((option) => (
						<OptionChip
							key={option.label}
							letter={option.letter}
							label={option.label}
							answerType={answerType}
						/>
					))}
				</span>
			</Fold>
		)}
	</div>
);
