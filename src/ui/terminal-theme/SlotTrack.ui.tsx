import { clsx } from "clsx";

import { sizeFill } from "~/ui/sizes";

import { PriceTag, type PriceTagVariant } from "./PriceTag.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const ROW = "flex flex-wrap items-center gap-x-3 gap-y-1";
// Bounded, not fluid: the segments only ever say how the width is *divided*,
// so letting them span a wide panel spends a screenful on a ratio.
const TRACK = "flex min-w-40 max-w-sm flex-1 items-center gap-1";
const SEGMENT = "h-3.5 basis-0 rounded-sm";
const EMPTY = "border border-dashed border-zinc-500 bg-hatched";

const STEP =
	"inline-flex shrink-0 items-center gap-1.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40";
const STEP_BOX =
	"inline-flex h-3.5 w-7 items-center justify-center rounded-sm border border-dashed text-xs leading-none transition-colors";

const BUY = "border-viridian text-viridian";
const BUY_HOVER = "group-hover:bg-viridian/15";
const CASH = "border-cinnabar bg-hatched text-cinnabar";
const CASH_HOVER = "group-hover:bg-cinnabar/15";

const BUY_ICON = "+";
const CASH_ICON = "−";

export type SlotSegment = {
	slots: number;
	/** Slots a config holds without running, drawn as the dashed gap a free slot
	 * gets: the width is spent, the colour is not earned. */
	open?: boolean;
};

export type SlotTrackDeal = {
	label: string;
	price: string;
	refusal?: string;
	onUse?: () => void;
};

export type SlotTrackProps = {
	segments: readonly SlotSegment[];
	slots: number;
	reading?: string;
	buy?: SlotTrackDeal;
	cash?: SlotTrackDeal;
};

const fillOf = (segment: SlotSegment) =>
	segment.open === true ? EMPTY : sizeFill(segment.slots);

const freeSlots = (segments: readonly SlotSegment[], slots: number) =>
	Math.max(
		0,
		slots - segments.reduce((total, segment) => total + segment.slots, 0)
	);

const hintFor = (deal: SlotTrackDeal) =>
	[deal.label, deal.price, deal.refusal]
		.filter((part) => part !== undefined)
		.join(" · ");

const priceVariantFor = (
	kind: "buy" | "cash",
	disabled: boolean
): PriceTagVariant => {
	if (kind === "cash") return "receive";
	return disabled ? "short" : "pay";
};

const SlotStep = ({
	deal,
	kind,
}: {
	deal: SlotTrackDeal;
	kind: "buy" | "cash";
}) => {
	const disabled = deal.onUse === undefined;
	const hint = hintFor(deal);
	const price = (
		<PriceTag label={deal.price} variant={priceVariantFor(kind, disabled)} />
	);
	const box = (
		<span
			aria-hidden
			className={clsx(
				STEP_BOX,
				kind === "buy" ? BUY : CASH,
				!disabled && (kind === "buy" ? BUY_HOVER : CASH_HOVER)
			)}
		>
			{kind === "buy" ? BUY_ICON : CASH_ICON}
		</span>
	);

	return (
		<Tooltip hint={hint}>
			<button
				type="button"
				aria-label={hint}
				disabled={disabled}
				onClick={deal.onUse}
				className={clsx(STEP, "group")}
			>
				{kind === "buy" ? (
					<>
						{box}
						{price}
					</>
				) : (
					<>
						{price}
						{box}
					</>
				)}
			</button>
		</Tooltip>
	);
};

export const SlotTrack = ({
	segments,
	slots,
	reading,
	buy,
	cash,
}: SlotTrackProps) => (
	<div className="flex flex-col gap-1">
		<div className={ROW}>
			<div aria-hidden className={TRACK}>
				{segments.map((segment, index) => (
					<span
						key={index}
						style={{ flexGrow: segment.slots }}
						className={clsx(SEGMENT, fillOf(segment))}
					/>
				))}
				{Array.from({ length: freeSlots(segments, slots) }, (_, index) => (
					<span
						key={`free-${index}`}
						style={{ flexGrow: 1 }}
						className={clsx(SEGMENT, EMPTY)}
					/>
				))}
			</div>
			{cash === undefined ? null : <SlotStep deal={cash} kind="cash" />}
			{buy === undefined ? null : <SlotStep deal={buy} kind="buy" />}
		</div>
		{reading === undefined ? null : (
			<Text tone="muted" size="caption">
				{reading}
			</Text>
		)}
	</div>
);
