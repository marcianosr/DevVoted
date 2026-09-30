import { type CSSProperties, useEffect, useState } from "react";

import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";

const READOUT =
	"balance-readout relative ml-auto flex shrink-0 flex-col items-end gap-0.5";
const READOUT_INLINE =
	"balance-readout badge-theme relative ml-auto flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5";
const FIGURE =
	"balance-figure flex items-baseline gap-1 font-bold text-theme tabular-nums";
const FIGURE_INLINE =
	"balance-figure flex items-baseline gap-1 font-bold text-theme-soft tabular-nums";
const AMOUNT = "text-display leading-none";
const AMOUNT_INLINE = "text-sm leading-none";
const COUNT = "balance-count";
const UNIT = "text-xs text-theme-muted";
const UNIT_INLINE = "text-xs";
const LABEL = "flex items-center gap-1 text-xs font-bold text-theme";
const HIDDEN = "sr-only";
const PREVIEW = "flex items-center gap-1 text-xs text-theme-muted";
const PREVIEW_FIGURE = "font-bold tabular-nums text-theme";
const PILL =
	"callout badge-theme absolute right-0 bottom-full mb-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums";

const TOWARD = "→";

export const BALANCE_PILL_HOLD_MS = 1800;

const GAIN: KantoColor = "viridian";
const LOSS: KantoColor = "cinnabar";
const INLINE_COLOR: KantoColor = "viridian";

export type BalancePreview = {
	label: string;
	figure: string;
	color: KantoColor;
};

export type BalanceLayout = "stacked" | "inline";

export type BalanceProps = {
	label: string;
	kb: number;
	color?: KantoColor;
	preview?: BalancePreview;
	layout?: BalanceLayout;
};

type CountStyle = CSSProperties & Record<"--balance-count", number>;

const countStyle = (whole: number): CountStyle => ({
	"--balance-count": whole,
});

const toneOf = (moved: number | undefined): KantoColor | undefined => {
	if (moved === undefined) return undefined;
	return moved > 0 ? GAIN : LOSS;
};

type Reading = { readonly amount: string; readonly unit: string };

const readingOf = (kb: number): Reading => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit };
};

type Move = {
	readonly id: number;
	readonly kb: number;
	readonly unit: string;
	readonly moved: number;
	readonly counts: boolean;
};

type Landing = {
	readonly settled: { readonly kb: number; readonly unit: string };
	readonly moves: readonly Move[];
	readonly nextId: number;
};

const seededAt = (kb: number): Landing => ({
	settled: { kb, unit: readingOf(kb).unit },
	moves: [],
	nextId: 0,
});

const enqueued = (landed: Landing, kb: number): Landing => {
	const { unit } = readingOf(kb);
	return {
		settled: { kb, unit },
		moves: [
			...landed.moves,
			{
				id: landed.nextId,
				kb,
				unit,
				moved: kb - landed.settled.kb,
				counts: landed.settled.unit === unit,
			},
		],
		nextId: landed.nextId + 1,
	};
};

const retired = (landed: Landing): Landing => ({
	...landed,
	moves: landed.moves.slice(1),
});

export const Balance = ({
	label,
	kb,
	color,
	preview,
	layout = "stacked",
}: BalanceProps) => {
	const [landed, setLanded] = useState<Landing>(() => seededAt(kb));

	if (landed.settled.kb !== kb) setLanded(enqueued(landed, kb));

	const [playing] = landed.moves;

	useEffect(() => {
		if (playing === undefined) return;

		const hold = setTimeout(() => setLanded(retired), BALANCE_PILL_HOLD_MS);
		return () => clearTimeout(hold);
	}, [playing]);

	const { amount, unit } = readingOf(playing?.kb ?? kb);
	const [whole, fraction] = amount.split(".");
	const tone = toneOf(playing?.moved);
	const previewing = playing === undefined ? preview : undefined;

	const inline = layout === "inline";

	const change =
		playing === undefined ? null : (
			<span
				key={playing.id}
				role="status"
				className={PILL}
				data-screen-theme={tone}
			>
				{signedKbLabel(playing.moved)}
			</span>
		);

	const figure = (
		<span
			role="img"
			aria-label={`${amount} ${unit}`}
			className={inline ? FIGURE_INLINE : FIGURE}
			data-screen-theme={tone}
		>
			<span className={inline ? AMOUNT_INLINE : AMOUNT}>
				<span
					className={COUNT}
					data-counts={playing?.counts ?? false}
					style={countStyle(Number(whole))}
				/>
				{fraction === undefined ? null : `.${fraction}`}
			</span>
			<span className={inline ? UNIT_INLINE : UNIT}>{unit}</span>
		</span>
	);

	const previewed =
		previewing === undefined ? null : (
			<span className={PREVIEW}>
				{`${previewing.label} ${TOWARD}`}
				<span className={PREVIEW_FIGURE} data-screen-theme={previewing.color}>
					{previewing.figure}
				</span>
			</span>
		);

	if (inline)
		return (
			<span
				className={READOUT_INLINE}
				data-screen-theme={color ?? INLINE_COLOR}
			>
				{change}
				<Icon name="floppy" />
				<span className={HIDDEN}>{label}</span>
				{figure}
				{previewed}
			</span>
		);

	return (
		<span className={READOUT} data-screen-theme={color}>
			{change}
			{figure}
			<span className={LABEL}>
				<Icon name="floppy" />
				{label}
			</span>
			{previewed}
		</span>
	);
};
