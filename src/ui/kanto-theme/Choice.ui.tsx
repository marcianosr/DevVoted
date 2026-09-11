import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import { Badge } from "./Badge.ui";
import { Typography } from "./Typography.ui";

const ROW =
	"flex w-full items-center gap-5 rounded-lg py-2.5 text-left transition-colors";
const PICKABLE = "cursor-pointer hover:bg-theme-raised";
const PICKED = "bg-theme-soft";
const PICK_AREA = "flex min-w-0 flex-1 items-center gap-5 self-stretch";

const CAP =
	"flex size-8 shrink-0 items-center justify-center border border-b-4 text-xs leading-none";
const CAP_SHAPE = {
	single: "rounded-full",
	multiple: "rounded-md",
} satisfies Record<AnswerType, string>;
const CAP_IDLE = "border-edge-strong bg-theme-raised text-pewter";
const CAP_PICKED = "border-theme bg-theme-soft text-theme-soft";

const TRAILING = "ml-auto flex shrink-0 items-center gap-2";
const SEAL_BAR = "block h-5 rounded-md bg-theme-raised";
const UNSEAL =
	"cursor-pointer rounded-full border border-theme-faint px-2 py-1 text-xs text-theme-soft enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";

const UNSEAL_LABEL = "unseal";
const SEALED_NAME = "sealed answer";
const PRICE_COLOR = "viridian";

const SEAL_WIDTHS = ["w-16", "w-28", "w-20", "w-24"] as const;

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
	onPick?: () => void;
} & (
	{ children: ReactNode; seal?: never } | { children?: never; seal: ChoiceSeal }
);

export const Choice = ({
	letter,
	answerType = "single",
	picked = false,
	onPick,
	children,
	seal,
}: ChoiceProps) => {
	const cap = (
		<span
			className={clsx(
				CAP,
				CAP_SHAPE[answerType],
				picked ? CAP_PICKED : CAP_IDLE
			)}
		>
			{letter}
		</span>
	);

	if (seal === undefined) {
		const body = (
			<>
				{cap}
				<Typography variant="paragraph" as="span">
					{children}
				</Typography>
			</>
		);

		if (onPick === undefined) {
			return <div className={clsx(ROW, picked && PICKED)}>{body}</div>;
		}

		return (
			<button
				type="button"
				aria-pressed={picked}
				onClick={onPick}
				className={clsx(ROW, picked && PICKED, PICKABLE)}
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
