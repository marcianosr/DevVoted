import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";
import { Meter, type MeterProps } from "./Meter.ui";

const FOCUS =
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme";

const ITEM = `inline-flex cursor-pointer px-2 text-xs font-bold tabular-nums whitespace-nowrap transition-colors ${FOCUS}`;
const COUNTED_ITEM = "p-0.5 pl-2.5";
const MARKED_ITEM = "p-0.5 pr-2.5";
const IDLE = "text-theme-muted hover:text-theme-soft";
const CHECKED = "segment-theme";
const SLOT = "badge-theme flex h-full items-center rounded px-1.5";
const ROW_ITEM = "h-7 items-center gap-2";

const STRIP =
	"flex w-full flex-nowrap gap-1 overflow-x-auto border-b border-theme-faint p-3";
const STRIP_ITEM = `flex min-w-28 shrink-0 cursor-pointer flex-col items-stretch gap-1.5 rounded-xl px-4 py-3 text-left transition-colors ${FOCUS}`;
const STRIP_IDLE = "hover:bg-theme-raised";
const STRIP_CHECKED = "bg-theme-raised";
const STRIP_MARK = "text-sm font-bold whitespace-nowrap text-theme-soft";
const STRIP_LABEL = "text-xs tabular-nums text-theme-muted";
const STRIP_EMPTY = "opacity-50";

const LOOSE = "flex flex-wrap gap-2";
const LOOSE_ITEM = "rounded-md ring-1 ring-inset ring-theme-faint";

const TABS = "flex w-full flex-wrap";
const TAB = `inline-flex shrink-0 cursor-pointer items-baseline gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${FOCUS}`;
const TAB_CHECKED = "border-theme text-theme-soft";
const TAB_IDLE = "border-transparent text-theme-faint hover:text-theme-soft";
const TAB_COUNT = "text-xs font-normal tabular-nums text-theme-muted";

const SWITCH =
	"inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-edge-strong bg-black/40 p-1";
const SWITCH_ITEM = `inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap transition ${FOCUS}`;
const SWITCH_CHECKED = "segment-theme press-raised active:press-sunk";
const SWITCH_IDLE = "text-pewter hover:text-pallet";
const SWITCH_NOTE = "text-xs font-normal tabular-nums";

const SEPARATOR = " · ";

export type SegmentedLook = "joined" | "loose" | "strip" | "tabs" | "switch";

export type SegmentedItem<Value extends string> = {
	value: Value;
	label: string;
	mark?: string;
	count?: number;
	meter?: MeterProps;
	icon?: IconName;
	note?: string;
};

export type SegmentedProps<Value extends string> = {
	label: string;
	items: readonly SegmentedItem<Value>[];
	value: Value;
	onSelect: (value: Value) => void;
	look?: SegmentedLook;
	color?: KantoColor;
};

const spokenPartsOf = ({ mark, label, count, note }: SegmentedItem<string>) =>
	[mark, label, count?.toString(), note].filter(
		(part): part is string => part !== undefined
	);

const nameOf = (item: SegmentedItem<string>) => {
	const parts = spokenPartsOf(item);
	return parts.length < 2 ? undefined : parts.join(SEPARATOR);
};

const ItemFace = ({ item }: { item: SegmentedItem<string> }) => (
	<>
		{item.mark === undefined ? null : (
			<span aria-hidden className={SLOT}>
				{item.mark}
			</span>
		)}
		{item.label}
		{item.count === undefined ? null : (
			<span aria-hidden className={SLOT}>
				{item.count}
			</span>
		)}
	</>
);

const isEmptyMeter = (item: SegmentedItem<string>) => item.meter?.value === 0;

const Strip = <Value extends string>({
	label,
	items,
	value,
	onSelect,
}: Omit<SegmentedProps<Value>, "look">) => (
	<div role="radiogroup" aria-label={label} className={STRIP}>
		{items.map((item) => (
			<button
				key={item.value}
				type="button"
				role="radio"
				aria-checked={item.value === value}
				aria-label={nameOf(item)}
				onClick={() => onSelect(item.value)}
				className={clsx(
					STRIP_ITEM,
					item.value === value ? STRIP_CHECKED : STRIP_IDLE,
					item.value !== value && isEmptyMeter(item) && STRIP_EMPTY
				)}
			>
				<span aria-hidden className={STRIP_MARK}>
					{item.mark ?? item.label}
				</span>
				{item.mark === undefined ? null : (
					<span aria-hidden className={STRIP_LABEL}>
						{item.label}
					</span>
				)}
				{item.meter === undefined ? null : <Meter {...item.meter} />}
			</button>
		))}
	</div>
);

const TabRow = <Value extends string>({
	label,
	items,
	value,
	onSelect,
}: Omit<SegmentedProps<Value>, "look">) => (
	<div role="radiogroup" aria-label={label} className={TABS}>
		{items.map((item) => (
			<button
				key={item.value}
				type="button"
				role="radio"
				aria-checked={item.value === value}
				aria-label={nameOf(item)}
				onClick={() => onSelect(item.value)}
				className={clsx(TAB, item.value === value ? TAB_CHECKED : TAB_IDLE)}
			>
				{item.label}
				{item.count === undefined ? null : (
					<span aria-hidden className={TAB_COUNT}>
						{item.count}
					</span>
				)}
			</button>
		))}
	</div>
);

export const Segmented = <Value extends string>({
	look = "joined",
	...props
}: SegmentedProps<Value>) => {
	if (look === "strip") return <Strip {...props} />;
	if (look === "tabs") return <TabRow {...props} />;
	if (look === "loose") return <Pills {...props} />;
	return <Switch {...props} />;
};

const Switch = <Value extends string>({
	label,
	items,
	value,
	onSelect,
	color,
}: Omit<SegmentedProps<Value>, "look">) => (
	<div role="radiogroup" aria-label={label} className={SWITCH}>
		{items.map((item) => (
			<button
				key={item.value}
				type="button"
				role="radio"
				aria-checked={item.value === value}
				aria-label={nameOf(item)}
				data-screen-theme={item.value === value ? color : undefined}
				onClick={() => onSelect(item.value)}
				className={clsx(
					SWITCH_ITEM,
					item.value === value ? SWITCH_CHECKED : SWITCH_IDLE
				)}
			>
				{item.icon === undefined ? null : <Icon name={item.icon} />}
				<ItemFace item={item} />
				{item.note === undefined ? null : (
					<span aria-hidden className={SWITCH_NOTE}>
						{item.note}
					</span>
				)}
			</button>
		))}
	</div>
);

const Pills = <Value extends string>({
	label,
	items,
	value,
	onSelect,
}: Omit<SegmentedProps<Value>, "look">) => (
	<div role="radiogroup" aria-label={label} className={LOOSE}>
		{items.map((item) => (
			<button
				key={item.value}
				type="button"
				role="radio"
				aria-checked={item.value === value}
				aria-label={nameOf(item)}
				onClick={() => onSelect(item.value)}
				className={clsx(
					ITEM,
					ROW_ITEM,
					item.count !== undefined && COUNTED_ITEM,
					item.mark !== undefined && MARKED_ITEM,
					LOOSE_ITEM,
					item.value === value ? CHECKED : IDLE
				)}
			>
				<ItemFace item={item} />
			</button>
		))}
	</div>
);
