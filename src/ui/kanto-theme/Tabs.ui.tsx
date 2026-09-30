import { clsx } from "clsx";

const FOCUS =
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme";

const IDLE = "text-theme-muted hover:text-theme-soft";

export type TabsLook = "folder" | "pill";

const LOOKS = {
	folder: {
		bar: "flex flex-wrap items-end gap-1",
		tab: `cursor-pointer rounded-t-lg px-4 py-2 text-xs font-bold transition-colors ${FOCUS}`,
		active: "bg-theme-faint text-theme-faint",
		uncounted: undefined,
	},
	pill: {
		bar: "flex w-full flex-nowrap items-center gap-2 overflow-x-auto",
		tab: `inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md py-1 pr-1 pl-3 text-sm font-bold whitespace-nowrap ring-1 ring-inset ring-theme-faint transition-colors ${FOCUS}`,
		active: "segment-theme",
		uncounted: "pr-3",
	},
} satisfies Record<
	TabsLook,
	{ bar: string; tab: string; active: string; uncounted: string | undefined }
>;

const COUNT =
	"badge-theme flex h-full items-center rounded px-1.5 tabular-nums";

export type TabItem = { id: string; label: string; count?: string };

export type TabsProps = {
	items: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	label: string;
	look?: TabsLook;
};

export const Tabs = ({
	items,
	activeId,
	onSelect,
	label,
	look = "folder",
}: TabsProps) => {
	const { bar, tab, active, uncounted } = LOOKS[look];

	return (
		<div role="tablist" aria-label={label} className={bar}>
			{items.map(({ id, label: name, count }) => (
				<button
					key={id}
					type="button"
					role="tab"
					aria-selected={id === activeId}
					aria-label={count === undefined ? undefined : `${name} ${count}`}
					onClick={() => onSelect(id)}
					className={clsx(
						tab,
						count === undefined && uncounted,
						id === activeId ? active : IDLE
					)}
				>
					{name}
					{count === undefined ? null : (
						<span aria-hidden className={COUNT}>
							{count}
						</span>
					)}
				</button>
			))}
		</div>
	);
};
