import { clsx } from "clsx";

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

const JOINED =
	"inline-flex w-fit overflow-hidden rounded-md ring-1 ring-inset ring-theme-faint";
const JOINED_ITEM = "border-l border-theme-faint first:border-l-0";
const LOOSE = "flex flex-wrap gap-2";
const LOOSE_ITEM = "rounded-md ring-1 ring-inset ring-theme-faint";

const SEPARATOR = " · ";

export type SegmentedLook = "joined" | "loose" | "strip";

export type SegmentedItem<Value extends string> = {
	value: Value;
	label: string;
	mark?: string;
	count?: number;
	meter?: MeterProps;
};

export type SegmentedProps<Value extends string> = {
	label: string;
	items: readonly SegmentedItem<Value>[];
	value: Value;
	onSelect: (value: Value) => void;
	look?: SegmentedLook;
};

const spokenPartsOf = ({ mark, label, count }: SegmentedItem<string>) =>
	[mark, label, count?.toString()].filter(
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

export const Segmented = <Value extends string>({
	look = "joined",
	...props
}: SegmentedProps<Value>) =>
	look === "strip" ? <Strip {...props} /> : <Pills look={look} {...props} />;

const Pills = <Value extends string>({
	label,
	items,
	value,
	onSelect,
	look,
}: SegmentedProps<Value> & { look: "joined" | "loose" }) => (
	<div
		role="radiogroup"
		aria-label={label}
		className={look === "joined" ? JOINED : LOOSE}
	>
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
					look === "joined" ? JOINED_ITEM : LOOSE_ITEM,
					item.value === value ? CHECKED : IDLE
				)}
			>
				<ItemFace item={item} />
			</button>
		))}
	</div>
);
