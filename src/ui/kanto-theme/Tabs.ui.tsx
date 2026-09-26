import { clsx } from "clsx";

const TABS = "flex flex-wrap items-end gap-1";

const TAB =
	"cursor-pointer rounded-t-lg px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme";

const IDLE = "text-theme-muted hover:text-theme-soft";

const ACTIVE = "bg-theme-faint text-theme-faint";

export type TabItem = { id: string; label: string };

export type TabsProps = {
	items: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	label: string;
};

export const Tabs = ({ items, activeId, onSelect, label }: TabsProps) => (
	<div role="tablist" aria-label={label} className={TABS}>
		{items.map(({ id, label: name }) => (
			<button
				key={id}
				type="button"
				role="tab"
				aria-selected={id === activeId}
				onClick={() => onSelect(id)}
				className={clsx(TAB, id === activeId ? ACTIVE : IDLE)}
			>
				{name}
			</button>
		))}
	</div>
);
