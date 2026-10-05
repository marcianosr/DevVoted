import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { type AnswerState, Keycap } from "./Keycap.ui";
import { Typography } from "./Typography.ui";

const ROW =
	"flex w-full items-center gap-5 border-t border-theme-faint px-4 py-2.5 text-left transition-colors first:rounded-t-lg first:border-t-0 last:rounded-b-lg";
const PICKABLE = "cursor-pointer hover:bg-theme-raised";
const PICKED = "bg-theme-soft";
const RULED_OUT = "cursor-not-allowed opacity-50";
const PICK_AREA = "flex min-w-0 flex-1 items-center gap-5 self-stretch";

const TRAILING = "ml-auto flex shrink-0 items-center gap-2";
const SEAL_BAR = "block h-5 rounded-md bg-theme-raised";
const UNSEAL =
	"cursor-pointer rounded-full border border-theme-faint px-2 py-1 text-xs text-theme-soft enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";

const CROSSED_OUT = "line-through decoration-cinnabar decoration-2";
const READER_ONLY = "sr-only";

const UNSEAL_LABEL = "unseal";
const SEALED_NAME = "sealed answer";
const RULED_OUT_NAME = "ruled out";
const PRICE_COLOR = "viridian";

const SEAL_WIDTHS = ["w-16", "w-28", "w-20", "w-24"] as const;

export type ChoiceState = AnswerState;

type ChoiceVerdict = Exclude<ChoiceState, "idle">;

const VERDICT_COLOR = {
	right: "viridian",
	wrong: "cinnabar",
} satisfies Record<ChoiceVerdict, KantoColor>;

const VERDICT_GLYPH = {
	right: "✓",
	wrong: "✗",
} satisfies Record<ChoiceVerdict, string>;

const VERDICT_NAME = {
	right: "right",
	wrong: "wrong",
} satisfies Record<ChoiceVerdict, string>;

const VERDICT_MARK = "reveal-pop inline-block w-4 text-center text-theme-soft";
const VERDICT_SLOT = "inline-block w-4";
const ANSWERED = "answer-verdict bg-theme-dim";

const VerdictGlyph = ({ verdict }: { verdict: ChoiceVerdict }) => (
	<>
		<span aria-hidden className={VERDICT_MARK}>
			{VERDICT_GLYPH[verdict]}
		</span>
		<span className={READER_ONLY}>{VERDICT_NAME[verdict]}</span>
	</>
);

const VerdictMark = ({ verdict }: { verdict: ChoiceVerdict }) => (
	<span className={TRAILING}>
		<VerdictGlyph verdict={verdict} />
	</span>
);

const isAnswered = (state: ChoiceState): state is ChoiceVerdict =>
	state !== "idle";

const sealWidthFor = (letter: string) =>
	SEAL_WIDTHS[letter.charCodeAt(0) % SEAL_WIDTHS.length] ?? SEAL_WIDTHS[0];

export type ChoiceSeal = {
	price: string;
	onUnseal?: () => void;
};

export type ChoiceProps = {
	letter: string;
	answerType?: AnswerType;
	picked?: boolean;
	state?: ChoiceState;
	onPick?: () => void;
} & (
	| {
			children: ReactNode;
			crossedOut?: boolean;
			aside?: ReactNode;
			seal?: never;
	  }
	| { children?: never; crossedOut?: never; aside?: never; seal: ChoiceSeal }
);

export const Choice = ({
	letter,
	answerType = "single",
	picked = false,
	state = "idle",
	onPick,
	children,
	crossedOut = false,
	aside,
	seal,
}: ChoiceProps) => {
	const answered = isAnswered(state);
	const theme = answered ? VERDICT_COLOR[state] : undefined;
	const cap = (
		<Keycap
			letter={letter}
			answerType={answerType}
			lit={picked}
			state={state}
		/>
	);

	if (seal === undefined) {
		const text = (
			<Typography variant="paragraph" as="span">
				{children}
			</Typography>
		);

		const body = (
			<>
				{cap}
				{crossedOut ? (
					<span className={CROSSED_OUT}>
						{text}
						<span className={READER_ONLY}>{RULED_OUT_NAME}</span>
					</span>
				) : (
					text
				)}
				{aside === undefined ? (
					answered && <VerdictMark verdict={state} />
				) : (
					<span className={TRAILING}>
						{aside}
						{answered ? (
							<VerdictGlyph verdict={state} />
						) : (
							<span aria-hidden className={VERDICT_SLOT} />
						)}
					</span>
				)}
			</>
		);

		if (onPick === undefined) {
			return (
				<div
					data-screen-theme={theme}
					data-answer={state}
					data-picked={picked}
					className={clsx(
						ROW,
						answered ? ANSWERED : picked && PICKED,
						crossedOut && RULED_OUT
					)}
				>
					{body}
				</div>
			);
		}

		return (
			<button
				type="button"
				aria-pressed={picked}
				disabled={crossedOut}
				data-screen-theme={theme}
				onClick={onPick}
				className={clsx(
					ROW,
					picked && PICKED,
					crossedOut ? RULED_OUT : PICKABLE
				)}
			>
				{body}
			</button>
		);
	}

	const sealedBody = (
		<>
			{cap}
			<span aria-hidden className={clsx(SEAL_BAR, sealWidthFor(letter))} />
		</>
	);

	return (
		<div className={clsx(ROW, picked && PICKED)}>
			{onPick === undefined ? (
				<span className={PICK_AREA}>{sealedBody}</span>
			) : (
				<button
					type="button"
					aria-pressed={picked}
					aria-label={`${letter}, ${SEALED_NAME}`}
					onClick={onPick}
					className={clsx(PICK_AREA, "cursor-pointer text-left")}
				>
					{sealedBody}
				</button>
			)}
			<span className={TRAILING}>
				<button
					type="button"
					disabled={seal.onUnseal === undefined}
					onClick={seal.onUnseal}
					className={UNSEAL}
				>
					{UNSEAL_LABEL}
				</button>
				<Badge color={PRICE_COLOR}>{seal.price}</Badge>
			</span>
		</div>
	);
};
