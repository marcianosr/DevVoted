import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
import { Meter } from "./Meter.ui";
import { CodeText } from "./Question.ui";
import { Typography } from "./Typography.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const FOLD = "w-full border-t border-theme-faint px-4 py-3 first:border-t-0";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-3 py-1 select-none [&::-webkit-details-marker]:hidden";
const SEALED_SUMMARY = "flex items-center gap-3 py-1 text-theme-muted";
const SEALED_MARK =
	"size-7 shrink-0 rounded-md border border-dashed border-theme-faint";
const QUESTION = "flex min-w-0 flex-1 flex-col gap-0.5";
const TRAILING = "ml-auto shrink-0";
const BODY = "mt-3 flex w-full flex-col border-t border-theme-faint pt-3";

const COLUMNS = "flex items-center gap-3 pb-2 text-theme-muted";
const COLUMN_HEADS = "ml-auto flex shrink-0 items-center gap-6";
const VOTE_COLUMN = "flex w-20 items-center justify-end";

const ROW =
	"flex items-center gap-3 border-t border-theme-faint py-2 first:border-t-0";
const CAP =
	"flex size-8 shrink-0 items-center justify-center rounded-full border border-b-4 text-xs leading-none";
const CAP_RIGHT = "border-theme bg-theme-soft text-theme-soft";
const CAP_IDLE = "border-edge-strong bg-theme-raised text-pewter";
const OPTION = "flex min-w-0 flex-1 flex-col gap-1.5";
const OPTION_HEAD = "flex flex-wrap items-center gap-x-2 gap-y-1";
const OPTION_LABEL = "min-w-0 flex-1 basis-48 break-words";
const TALLY = "flex shrink-0 items-center gap-6";
const VOTES = "flex w-20 items-center justify-end tabular-nums text-theme-soft";
const YOU_LABEL = "You";
const ANSWER_LABEL = "answer";
const YOU_COLOR: KantoColor = "cerulean";
const RIGHT_COLOR: KantoColor = "viridian";
const METER_MAX = 100;
const VOTER_FACES = 2;

const VOTERS_LABEL = "who picked it";
const VOTES_LABEL = "votes";

const CROWD_EASY = 60;
const CROWD_MIXED = 40;

const shareColorOf = (share: number): KantoColor => {
	if (share >= CROWD_EASY) return "viridian";
	return share >= CROWD_MIXED ? "saffron" : "cinnabar";
};

const factsOf = (category: string, rightShare: number) =>
	`${category} · ${rightShare}% right`;

export type PollResultOption = {
	letter: string;
	label: string;
	percent: number;
	votes: number;
	isRight: boolean;
	yours?: boolean;
	voters?: readonly ClimberProps[];
	voterOverflow?: number;
};

type Sealed = {
	state: "sealed";
	index: number;
	question: string;
};

type Revealed = {
	state: "revealed";
	index: number;
	question: string;
	category: string;
	outcome: VerdictOutcome;
	share?: number;
	rightShare: number;
	options: readonly PollResultOption[];
	open?: boolean;
};

export type PollResultProps = Sealed | Revealed;

const OptionRow = ({ option }: { option: PollResultOption }) => (
	<div data-option="" className={ROW}>
		<span className={clsx(CAP, option.isRight ? CAP_RIGHT : CAP_IDLE)}>
			{option.letter}
		</span>
		<span className={OPTION}>
			<span className={OPTION_HEAD}>
				<span className={OPTION_LABEL}>
					<Typography variant="caption" as="span">
						<CodeText text={option.label} />
					</Typography>
				</span>
				{option.yours === true ? (
					<Badge color={YOU_COLOR}>{YOU_LABEL}</Badge>
				) : null}
				{option.isRight ? (
					<Badge color={RIGHT_COLOR}>{ANSWER_LABEL}</Badge>
				) : null}
			</span>
			<Meter value={option.percent} max={METER_MAX} />
		</span>
		<span className={TALLY}>
			<ClimberStack
				climbers={option.voters ?? []}
				overflow={option.voterOverflow}
				shown={VOTER_FACES}
			/>
			<span className={VOTES}>{option.votes.toLocaleString()}</span>
		</span>
	</div>
);

const SealedPoll = ({ question }: Sealed) => (
	<div className={FOLD}>
		<div className={SEALED_SUMMARY}>
			<span aria-hidden className={SEALED_MARK} />
			<Typography variant="hint" as="span">
				{question}
			</Typography>
		</div>
	</div>
);

export const PollResult = (props: PollResultProps) => {
	if (props.state === "sealed") return <SealedPoll {...props} />;

	const {
		question,
		category,
		outcome,
		rightShare,
		share,
		options,
		open = false,
	} = props;

	return (
		<details open={open} className={FOLD}>
			<summary className={SUMMARY}>
				<Verdict outcome={outcome} share={share} width="fit" />
				<span className={QUESTION}>
					<Typography variant="subtitle" as="span">
						{question}
					</Typography>
					<Typography variant="hint" as="span">
						{factsOf(category, rightShare)}
					</Typography>
				</span>
				<span className={TRAILING}>
					<Badge color={shareColorOf(rightShare)}>{`${rightShare}%`}</Badge>
				</span>
			</summary>
			<div className={BODY}>
				<div className={COLUMNS}>
					<span className={COLUMN_HEADS}>
						<span aria-label={VOTERS_LABEL} role="img">
							<Icon name="community" />
						</span>
						<span className={VOTE_COLUMN}>
							<span aria-label={VOTES_LABEL} role="img">
								<Icon name="votes" />
							</span>
						</span>
					</span>
				</div>
				{options.map((option) => (
					<OptionRow key={option.letter} option={option} />
				))}
			</div>
		</details>
	);
};
