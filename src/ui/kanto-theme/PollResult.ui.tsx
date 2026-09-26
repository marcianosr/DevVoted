import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
import { Meter } from "./Meter.ui";
import { PANEL_SURFACE } from "./Panel.ui";
import { Typography } from "./Typography.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const FOLD = "group/poll w-full px-4 py-4";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-3 py-1 select-none [&::-webkit-details-marker]:hidden";
const SEALED_SUMMARY = "flex items-center gap-3 py-1";
const CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/poll:rotate-90";
const QUESTION = "min-w-0 flex-1 truncate";
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
const OPTION_HEAD = "flex items-center gap-2";
const OPTION_LABEL = "min-w-0 flex-1 truncate";
const TALLY = "flex shrink-0 items-center gap-6";
const VOTES = "flex w-20 items-center justify-end tabular-nums text-theme-soft";
const SEALED_BAR = "block h-2 rounded-sm bg-theme-raised";

const CARET_GLYPH = "›";
const YOU_LABEL = "You";
const YOU_COLOR: KantoColor = "cerulean";
const RIGHT_COLOR: KantoColor = "viridian";
const METER_MAX = 100;

const VOTERS_LABEL = "who picked it";
const VOTES_LABEL = "votes";

const CROWD_EASY = 60;
const CROWD_MIXED = 40;

const shareColorOf = (share: number): KantoColor => {
	if (share >= CROWD_EASY) return "viridian";
	return share >= CROWD_MIXED ? "saffron" : "cinnabar";
};

const SEALED_WIDTHS = ["w-14", "w-10", "w-12", "w-9"] as const;

const sealedWidthFor = (index: number) =>
	SEALED_WIDTHS[index % SEALED_WIDTHS.length];

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
	categoryColor?: KantoColor;
	outcome: VerdictOutcome;
	share?: number;
	rightShare: number;
	options: readonly PollResultOption[];
	open?: boolean;
};

export type PollResultProps = Sealed | Revealed;

const OptionRow = ({ option }: { option: PollResultOption }) => (
	<div className={ROW}>
		<span className={clsx(CAP, option.isRight ? CAP_RIGHT : CAP_IDLE)}>
			{option.letter}
		</span>
		<span className={OPTION}>
			<span className={OPTION_HEAD}>
				<span className={OPTION_LABEL}>
					<Typography variant="paragraph" as="span">
						{option.label}
					</Typography>
				</span>
				{option.yours === true ? (
					<Badge color={YOU_COLOR}>{YOU_LABEL}</Badge>
				) : null}
				<Badge color={option.isRight ? RIGHT_COLOR : undefined}>
					{`${option.percent}%`}
				</Badge>
			</span>
			<Meter value={option.percent} max={METER_MAX} />
		</span>
		<span className={TALLY}>
			<ClimberStack
				climbers={option.voters ?? []}
				overflow={option.voterOverflow}
			/>
			<span className={VOTES}>{option.votes.toLocaleString()}</span>
		</span>
	</div>
);

const SealedPoll = ({ index, question }: Sealed) => (
	<div className={clsx(PANEL_SURFACE, FOLD)}>
		<div className={SEALED_SUMMARY}>
			<span className={QUESTION}>
				<Typography variant="paragraph" as="span">
					{question}
				</Typography>
			</span>
			<span
				aria-hidden
				className={clsx(TRAILING, SEALED_BAR, sealedWidthFor(index))}
			/>
		</div>
	</div>
);

export const PollResult = (props: PollResultProps) => {
	if (props.state === "sealed") return <SealedPoll {...props} />;

	const {
		question,
		category,
		categoryColor,
		outcome,
		rightShare,
		share,
		options,
		open = false,
	} = props;

	return (
		<details open={open} className={clsx(PANEL_SURFACE, FOLD)}>
			<summary className={SUMMARY}>
				<span aria-hidden className={CARET}>
					{CARET_GLYPH}
				</span>
				<Verdict outcome={outcome} share={share} />
				<Badge color={categoryColor}>{category}</Badge>
				<span className={QUESTION}>
					<Typography variant="paragraph" as="span">
						{question}
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
