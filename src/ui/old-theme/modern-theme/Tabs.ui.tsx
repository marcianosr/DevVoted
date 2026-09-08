import { clsx } from "clsx";

import { Text } from "./Text.ui";

const TABS = "flex flex-wrap gap-6 border-b border-edge";

// -mb-px lands the tab's own border on top of the bar's, so the active underline
// replaces that segment instead of sitting a pixel above it.
const TAB =
	"-mb-px inline-flex cursor-pointer items-baseline gap-1.5 border-b-2 pb-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const IDLE = "border-transparent text-zinc-400 hover:text-zinc-100";
const ACTIVE = "border-theme text-theme";

export type TabItem = { id: string; label: string; count?: string };

export type TabsProps = {
	items: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	/** Names the bar, since several can share a page and "tablist" alone says
	 * nothing about which collection you are moving through. */
	label: string;
};

export const Tabs = ({ items, activeId, onSelect, label }: TabsProps) => (
	// No aria-controls: the panel is a sibling this bar cannot name, and a
	// dangling reference reads worse to a screen reader than none at all.
	<div role="tablist" aria-label={label} className={TABS}>
		{items.map(({ id, label: name, count }) => (
			<button
				key={id}
				type="button"
				role="tab"
				aria-selected={id === activeId}
				onClick={() => onSelect(id)}
				className={clsx(TAB, id === activeId ? ACTIVE : IDLE)}
			>
				<Text size="body" tone="inherit">
					{name}
				</Text>
				{/* A real space, or the name computes as "Polls23/418". Flex drops
				    whitespace-only nodes, so the gap stays the gap. */}
				{count === undefined ? null : (
					<>
						{" "}
						<Text size="meta" tone="inherit">
							{count}
						</Text>
					</>
				)}
			</button>
		))}
	</div>
);
