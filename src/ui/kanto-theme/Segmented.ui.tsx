import { clsx } from "clsx";

const FOCUS =
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme";

const ITEM = `inline-flex h-7 cursor-pointer items-center gap-2 px-2 text-xs font-bold tabular-nums whitespace-nowrap transition-colors ${FOCUS}`;
const COUNTED_ITEM = "p-0.5 pl-2.5";
const MARKED_ITEM = "p-0.5 pr-2.5";
const IDLE = "text-theme-muted hover:text-theme-soft";
const CHECKED = "segment-theme";
const SLOT = "badge-theme flex h-full items-center rounded px-1.5";

const JOINED =
	"inline-flex w-fit overflow-hidden rounded-md ring-1 ring-inset ring-theme-faint";
const JOINED_ITEM = "border-l border-theme-faint first:border-l-0";
const LOOSE = "flex flex-wrap gap-2";
const LOOSE_ITEM = "rounded-md ring-1 ring-inset ring-theme-faint";

const SEPARATOR = " · ";

export type SegmentedLook = "joined" | "loose";

export type SegmentedItem<Value extends string> = {
	value: Value;
	label: string;
	mark?: string;
	count?: number;
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

export const Segmented = <Value extends string>({
	label,
	items,
	value,
	onSelect,
	look = "joined",
}: SegmentedProps<Value>) => (
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
					item.count !== undefined && COUNTED_ITEM,
					item.mark !== undefined && MARKED_ITEM,
					look === "joined" ? JOINED_ITEM : LOOSE_ITEM,
					item.value === value ? CHECKED : IDLE
				)}
			>
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
			</button>
		))}
	</div>
);
