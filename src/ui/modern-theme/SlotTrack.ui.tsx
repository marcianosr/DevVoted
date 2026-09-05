import { clsx } from "clsx";

import { sizeTint } from "~/ui/sizes";

import { plural } from "./format";
import { occupancyOf, type Occupancy } from "./slots";
import { Text } from "./Text.ui";
import type { ModernTone } from "./tones";
import { Tooltip } from "./Tooltip.ui";

const TRACK = "flex h-7 w-full items-stretch gap-1";

const SEGMENT =
	"flex min-w-0 items-center justify-center overflow-hidden rounded border px-1";
const INSTALLED = "border-current";
const MINIFIED = "border-dotted border-current";
const NEUTRAL = "text-zinc-400";
const FREE = "border-dashed border-zinc-700";
const FREE_ARMED = "border-dashed border-celadon";
const UNBOUGHT = "border-edge bg-hatched";
const UNBOUGHT_ARMED = "border-celadon bg-hatched";
const IDLE = "transition-colors hover:border-edge-strong";
const PRESSABLE =
	"cursor-pointer transition-colors hover:border-theme hover:bg-theme-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:opacity-40";
const OVERFLOW = "border-cinnabar bg-cinnabar/15 text-cinnabar";

const BUY_HINT = "Buy a slot in the shop for more room";
const INSTALL = "Install a new slot";
const CASH = "Cash an empty slot";
const CONFIRM = "press again";
const STUB = "flex min-w-0";
const FILL = "size-full";

const NAME = "truncate text-xxs";
const TRUNCATE = "truncate";

export type SlotTrackConfig = {
	readonly id: string;
	readonly label: string;
	readonly slots: number;
	readonly minified?: boolean;
};

export type SlotDeal = {
	readonly costKb?: number;
	readonly makes?: number;
	readonly refusal?: string;
	readonly verb?: string;
	readonly armed?: boolean;
	readonly onUse: () => void;
	readonly onDismiss?: () => void;
};

export type SlotTrackProps = {
	configs: readonly SlotTrackConfig[];
	slots: number;
	maxSlots?: number;
	fits?: number | null;
	buy?: SlotDeal;
	cash?: SlotDeal;
};

const captionFor = (
	fits: number | null | undefined,
	{ free, overflow }: Occupancy
): string => {
	if (overflow > 0)
		return `over capacity by ${overflow} · minify, uninstall, or buy a slot`;
	if (free === 0) return "full · minify or uninstall to make room";

	const room = `${plural(free, "slot")} free`;
	if (fits === undefined) return room;
	return fits === null
		? `${room} · nothing fits`
		: `${room} · fits up to ${fits}`;
};

type Press = {
	readonly cost: string;
	readonly quote: string;
	readonly tone: ModernTone;
	readonly hint: string;
	readonly name: string;
	readonly armed: boolean;
	readonly disabled: boolean;
	readonly onUse: () => void;
	readonly onDismiss?: () => void;
};

type Cell = {
	readonly key: string;
	readonly slots: number;
	readonly tone: string;
	readonly label?: string;
	readonly hint?: string;
	readonly press?: Press;
};

// Size owns the fill, install state owns the border and the text: a minified
// config keeps its dotted edge while dropping a rung in colour, which is the
// same demotion its width just took.
const barTone = (config: SlotTrackConfig, isExcess: boolean): string => {
	if (isExcess) return OVERFLOW;

	return clsx(
		config.minified === true ? MINIFIED : INSTALLED,
		sizeTint(config.slots),
		NEUTRAL
	);
};

const pressFor = (fallback: string, deal: SlotDeal, cost: string): Press => {
	const quote = [
		deal.verb ?? fallback,
		deal.makes === undefined ? undefined : `makes ${deal.makes}`,
		cost,
	]
		.filter(Boolean)
		.join(" · ");

	const armed = deal.armed === true;

	return {
		cost,
		quote,
		armed,
		tone: deal.refusal === undefined ? "celadon" : "muted",
		hint: deal.refusal ?? quote,
		name: [quote, armed ? `${CONFIRM} to confirm` : undefined, deal.refusal]
			.filter(Boolean)
			.join(", "),
		disabled: deal.refusal !== undefined,
		onUse: deal.onUse,
		onDismiss: deal.onDismiss,
	};
};

const buyPress = (buy: SlotDeal): Press =>
	pressFor(
		INSTALL,
		buy,
		buy.costKb === undefined ? "sold out" : `${buy.costKb} KB`
	);

const freeCells = (free: number, cash?: SlotDeal): readonly Cell[] =>
	Array.from({ length: free }, (_, index) => {
		const key = `free-${index}`;
		if (cash === undefined || cash.costKb === undefined || index < free - 1)
			return { key, slots: 1, tone: FREE };

		return {
			key,
			slots: 1,
			tone: cash.armed === true ? FREE_ARMED : FREE,
			press: pressFor(CASH, cash, `+${cash.costKb} KB`),
		};
	});

const stubCell = (buy?: SlotDeal): Cell => {
	if (buy === undefined)
		return {
			key: "unbought",
			slots: 1,
			tone: clsx(UNBOUGHT, IDLE),
			hint: BUY_HINT,
		};

	return {
		key: "unbought",
		slots: 1,
		tone: buy.armed === true ? UNBOUGHT_ARMED : UNBOUGHT,
		press: buyPress(buy),
	};
};

const armedPress = (cells: readonly Cell[]): Press | undefined =>
	cells.find((cell) => cell.press?.armed === true)?.press;

type Caption = { readonly text: string; readonly tone: ModernTone };

const captionOf = (
	cells: readonly Cell[],
	fits: number | null | undefined,
	occupancy: Occupancy
): Caption => {
	const armed = armedPress(cells);
	if (armed !== undefined)
		return { text: `${armed.quote} · ${CONFIRM}`, tone: "celadon" };

	return {
		text: captionFor(fits, occupancy),
		tone: occupancy.overflow > 0 ? "cinnabar" : "muted",
	};
};

const cellsFor = (
	configs: readonly SlotTrackConfig[],
	{ free, overflow, unbought }: Occupancy,
	deals: Pick<SlotTrackProps, "buy" | "cash">
): readonly Cell[] => [
	...configs.map((config, index) => ({
		key: config.id,
		slots: config.slots,
		tone: barTone(config, overflow > 0 && index === configs.length - 1),
		label: config.label,
	})),
	...freeCells(free, deals.cash),
	...(unbought > 0 ? [stubCell(deals.buy)] : []),
];

const Segment = ({ cell, width }: { cell: Cell; width: number }) => {
	const style = { width: `${(cell.slots / width) * 100}%` };
	const { press } = cell;

	if (press !== undefined)
		return (
			<span style={style} className={STUB}>
				<Tooltip hint={press.hint} className={FILL} align="right">
					<button
						type="button"
						disabled={press.disabled}
						aria-label={press.name}
						onClick={(event) => {
							event.stopPropagation();
							press.onUse();
						}}
						onBlur={press.onDismiss}
						onKeyDown={(event) => {
							if (event.key === "Escape") press.onDismiss?.();
						}}
						className={clsx(SEGMENT, cell.tone, PRESSABLE, FILL)}
					>
						<Text size="xxs" tone={press.tone} className={TRUNCATE}>
							{press.cost}
						</Text>
					</button>
				</Tooltip>
			</span>
		);

	if (cell.hint === undefined)
		return (
			<span style={style} className={clsx(SEGMENT, cell.tone)}>
				{cell.label ? <span className={NAME}>{cell.label}</span> : null}
			</span>
		);

	return (
		<span style={style} className={STUB}>
			<Tooltip hint={cell.hint} className={FILL} align="right">
				<span aria-hidden className={clsx(SEGMENT, cell.tone, FILL)} />
				<span className="sr-only">{cell.hint}</span>
			</Tooltip>
		</span>
	);
};

export const SlotTrack = ({
	configs,
	slots,
	maxSlots = slots,
	fits,
	buy,
	cash,
}: SlotTrackProps) => {
	const occupancy = occupancyOf(configs, slots, maxSlots);
	const cells = cellsFor(configs, occupancy, { buy, cash });
	const width = cells.reduce((total, cell) => total + cell.slots, 0) || 1;
	const caption = captionOf(cells, fits, occupancy);

	return (
		<div className="flex flex-col gap-1">
			<div
				className={TRACK}
				role="meter"
				aria-label={`${occupancy.used} of ${slots} slots used`}
				aria-valuenow={occupancy.used}
				aria-valuemin={0}
				aria-valuemax={slots}
			>
				{cells.map((cell) => (
					<Segment key={cell.key} cell={cell} width={width} />
				))}
			</div>
			<Text size="xxs" tone={caption.tone}>
				{caption.text}
			</Text>
		</div>
	);
};
