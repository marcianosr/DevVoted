import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { CURSOR_BLOCKED, CURSOR_PICKABLE } from "./cursors";

export type TabState = "default" | "active" | "disabled";

// Not a Row: the active tab's underline has to land on the strip's own bottom
// edge, which means the tab owns the full height rather than sitting inside a
// padded row.
const STRIP = "flex items-stretch gap-4 border-b border-edge px-2";

const TAB = "border-b-2 px-1 py-2 text-xs tracking-tight transition-colors";

const STATE = {
	default: "border-transparent text-zinc-300 hover:text-zinc-100",
	active: "border-theme text-theme",
	disabled: "border-transparent text-pewter",
} satisfies Record<TabState, string>;

const tabVariants = cva(TAB, { variants: { state: STATE } });

export type Tab = {
	id: string;
	label: ReactNode;
	state?: TabState;
};

export type TabsProps = {
	tabs: readonly Tab[];
	onSelect?: (id: string) => void;
	label: string;
};

export const Tabs = ({ tabs, onSelect, label }: TabsProps) => (
	<div role="tablist" aria-label={label} className={STRIP}>
		{tabs.map(({ id, label: tabLabel, state = "default" }) => {
			const blocked = state === "disabled";

			return (
				<button
					key={id}
					type="button"
					role="tab"
					aria-selected={state === "active"}
					disabled={blocked}
					onClick={() => onSelect?.(id)}
					className={clsx(
						tabVariants({ state }),
						blocked ? CURSOR_BLOCKED : CURSOR_PICKABLE
					)}
				>
					{tabLabel}
				</button>
			);
		})}
	</div>
);
