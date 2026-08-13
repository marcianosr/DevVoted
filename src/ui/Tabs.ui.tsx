import { clsx } from "clsx";

export type Tab = {
	id: string;
	label: string;
	count?: string;
};

type TabsProps = {
	tabs: Tab[];
	activeId: string;
	onSelect: (id: string) => void;
};

/** Underlined tab bar; the active tab glows in the theme color. Generic + reusable. */
export const Tabs = ({ tabs, activeId, onSelect }: TabsProps) => (
	<div role="tablist" className="flex gap-6 border-b border-zinc-800">
		{tabs.map((tab) => {
			const isActive = tab.id === activeId;
			return (
				<button
					key={tab.id}
					type="button"
					role="tab"
					aria-selected={isActive}
					onClick={() => onSelect(tab.id)}
					className={clsx(
						"-mb-px cursor-pointer border-b-2 pb-2 text-sm font-bold transition-colors",
						isActive
							? "border-theme text-theme"
							: "border-transparent text-pewter hover:text-zinc-100"
					)}
				>
					{tab.label}
					{tab.count !== undefined && (
						<span className="ml-1 font-normal">· {tab.count}</span>
					)}
				</button>
			);
		})}
	</div>
);
