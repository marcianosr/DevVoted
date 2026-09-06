import type { ReactNode } from "react";

import { clsx } from "clsx";

import { IconButton } from "./IconButton.ui";
import { PriceTag } from "./PriceTag.ui";
import { Text } from "./Text.ui";

export type ChoiceState = "idle" | "expected" | "dimmed" | "crossedOut";

export type ChoiceSeal = {
	readonly price: string;
	readonly hint?: string;
	readonly onUnseal?: () => void;
};

const ROW =
	"flex w-full items-center gap-3 rounded-lg py-2 text-left transition-colors";
const PICKABLE = "cursor-pointer hover:bg-zinc-100/[0.03]";
const PICK_AREA = "flex min-w-0 flex-1 items-center gap-3 self-stretch";

const STATE = {
	idle: "",
	expected: "bg-viridian/10",
	dimmed: "opacity-50",
	crossedOut: "opacity-50",
} satisfies Record<ChoiceState, string>;

const SELECTED = "bg-zinc-100/[0.06]";
const CROSSED_OUT = "line-through decoration-cinnabar decoration-2";

// border-b-2 is the cap's front wall: a plain square reads as a checkbox, the
// doubled bottom edge is what makes it read as a key you can press.
const LETTER =
	"flex size-6 shrink-0 items-center justify-center rounded-md border border-b-2 text-[10px] leading-none";
const LETTER_TONE = {
	idle: "border-edge-strong bg-zinc-100/[0.04] text-zinc-400",
	expected: "border-viridian bg-viridian/10 text-viridian",
	selected: "border-theme bg-theme-soft text-theme",
} as const;

type LetterTone = keyof typeof LETTER_TONE;

const TRAILING = "ml-auto flex shrink-0 items-center gap-2";
const NOTE = "text-xs";

const SEAL_BAR = "block h-5 rounded-md bg-zinc-100/10";
const SEAL_WIDTHS = ["w-16", "w-28", "w-20", "w-24"];
const UNSEAL_LABEL = "unseal";
const SEALED_NAME = "sealed answer";

const fillFor = (state: ChoiceState, selected: boolean) => {
	if (state !== "idle") return STATE[state];
	return selected ? SELECTED : STATE.idle;
};

const letterToneOf = (state: ChoiceState, selected: boolean): LetterTone => {
	if (state === "expected") return "expected";
	return selected && state === "idle" ? "selected" : "idle";
};

// The bar's width comes from the letter, never from the answer it covers: the
// client is served ????? and must not be able to reconstruct a length from it.
const sealWidthFor = (letter: string) =>
	SEAL_WIDTHS[letter.charCodeAt(0) % SEAL_WIDTHS.length] ?? SEAL_WIDTHS[0];

export type ChoiceProps = {
	letter: string;
	label: string;
	state?: ChoiceState;
	selected?: boolean;
	note?: ReactNode;
	seal?: ChoiceSeal;
	onPick?: () => void;
};

export const Choice = ({
	letter,
	label,
	state = "idle",
	selected = false,
	note,
	seal,
	onPick,
}: ChoiceProps) => {
	const fill = fillFor(state, selected);
	const body = (
		<>
			<span
				className={clsx(LETTER, LETTER_TONE[letterToneOf(state, selected)])}
			>
				{letter}
			</span>
			{seal === undefined ? (
				<Text
					className={clsx(
						"min-w-0 truncate",
						state === "crossedOut" && CROSSED_OUT
					)}
				>
					{label}
				</Text>
			) : (
				<span aria-hidden className={clsx(SEAL_BAR, sealWidthFor(letter))} />
			)}
		</>
	);
	const trailing =
		note === undefined ? null : <span className={NOTE}>{note}</span>;
	const trailingColumn =
		trailing === null ? null : <span className={TRAILING}>{trailing}</span>;

	if (seal !== undefined) {
		return (
			<div className={clsx(ROW, fill, onPick !== undefined && PICKABLE)}>
				{onPick === undefined ? (
					<span className={PICK_AREA}>{body}</span>
				) : (
					<button
						type="button"
						aria-pressed={selected}
						aria-label={`${letter}, ${SEALED_NAME}`}
						onClick={onPick}
						className={clsx(PICK_AREA, "cursor-pointer text-left")}
					>
						{body}
					</button>
				)}
				<span className={TRAILING}>
					{trailing}
					<IconButton
						label={UNSEAL_LABEL}
						hint={seal.hint}
						disabled={seal.onUnseal === undefined}
						onUse={seal.onUnseal}
					/>
					<PriceTag label={seal.price} />
				</span>
			</div>
		);
	}

	if (onPick === undefined) {
		return (
			<div className={clsx(ROW, fill)}>
				{body}
				{trailingColumn}
			</div>
		);
	}

	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onPick}
			className={clsx(ROW, fill, PICKABLE)}
		>
			{body}
			{trailingColumn}
		</button>
	);
};
