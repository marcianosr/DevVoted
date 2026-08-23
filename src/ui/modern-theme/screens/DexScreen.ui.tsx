import type { ReactNode } from "react";

import { Tabs, type TabItem } from "../Tabs.ui";
import { Text } from "../Text.ui";

const SCREEN = "flex flex-col gap-4 px-5 py-4";

export type DexScreenProps = {
	tabs: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	children: ReactNode;
};

// No `theme` prop, unlike every in-run screen: the Dex is not a gate, and :root
// already sets --theme-color to cerulean. Dressing it in a gate's colour would be
// claiming a run is in progress.
export const DexScreen = ({
	tabs,
	activeId,
	onSelect,
	children,
}: DexScreenProps) => (
	<article className={SCREEN}>
		<Text as="h1" size="title">
			Dex
		</Text>
		<Tabs
			items={tabs}
			activeId={activeId}
			onSelect={onSelect}
			label="Collection"
		/>
		<div role="tabpanel">{children}</div>
	</article>
);
