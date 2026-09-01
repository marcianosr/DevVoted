import { clsx } from "clsx";

import { Text } from "./Text.ui";

export type TabItem = {
	id: string;
	label: string;
	count?: string;
	redacted?: boolean;
};

/** `underline` names a collection, `pill` reorders the one already on screen.
 * Both are a tablist — mutually exclusive views of the same panel — so they
 * share the roles and differ only in paint. */
export type TabsVariant = "underline" | "pill";

const BAR = {
	underline: "flex flex-wrap items-center gap-6 border-b border-edge",
	pill: "flex flex-wrap items-center gap-2",
} satisfies Record<TabsVariant, string>;

const TAB = {
	underline: "flex items-center gap-1.5 border-b-2 pb-2 transition-colors",
	pill: "rounded-lg border px-3 py-1.5 text-sm transition-colors",
} satisfies Record<TabsVariant, string>;

const ACTIVE = {
	underline: "border-celadon",
	pill: "border-zinc-300 bg-zinc-100/5 font-bold text-zinc-100",
} satisfies Record<TabsVariant, string>;

const IDLE = {
	underline: "border-transparent",
	pill: "border-zinc-800 text-zinc-500 hover:text-zinc-300",
} satisfies Record<TabsVariant, string>;

export type TabsProps = {
	items: readonly TabItem[];
	activeId: string;
	label: string;
	variant?: TabsVariant;
	onSelect?: (id: string) => void;
};

const RedactedTab = ({ item }: { item: TabItem }) => (
	<>
		<span className="rounded bg-cinnabar/30 px-1 text-sm text-zinc-300">
			{item.label}
		</span>
		<span
			aria-hidden
			className="rounded bg-cinnabar/40 px-1 text-sm text-transparent select-none"
		>
			{item.count ?? "??"}
		</span>
	</>
);

const UnderlineTab = ({ item, active }: { item: TabItem; active: boolean }) => {
	if (item.redacted) return <RedactedTab item={item} />;

	return (
		<>
			<Text
				tone={active ? "default" : "muted"}
				className={active ? "font-bold" : undefined}
			>
				{item.label}
			</Text>
			{item.count === undefined ? null : <Text tone="faint">{item.count}</Text>}
		</>
	);
};

export const Tabs = ({
	items,
	activeId,
	label,
	variant = "underline",
	onSelect,
}: TabsProps) => (
	<nav role="tablist" aria-label={label} className={BAR[variant]}>
		{items.map((item) => {
			const active = item.id === activeId;
			return (
				<button
					key={item.id}
					type="button"
					role="tab"
					aria-selected={active}
					onClick={onSelect === undefined ? undefined : () => onSelect(item.id)}
					className={clsx(
						TAB[variant],
						active ? ACTIVE[variant] : IDLE[variant]
					)}
				>
					{variant === "pill" ? (
						item.label
					) : (
						<UnderlineTab item={item} active={active} />
					)}
				</button>
			);
		})}
	</nav>
);
