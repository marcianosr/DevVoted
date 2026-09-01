import type { ReactNode } from "react";

import { Panel } from "../Panel.ui";
import { Tabs, type TabItem } from "../Tabs.ui";
import { Text } from "../Text.ui";

const TITLE = "Dex";

// No `theme`, unlike every in-run screen: the Dex is not a gate, and dressing
// it in one's colour would claim a run is in progress.
export type DexScreenProps = {
	tabs: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	children: ReactNode;
};

export const DexScreen = ({
	tabs,
	activeId,
	onSelect,
	children,
}: DexScreenProps) => (
	<Panel>
		<Text size="title" className="font-bold">
			{TITLE}
		</Text>
		<Tabs
			items={tabs}
			activeId={activeId}
			onSelect={onSelect}
			label="collection"
		/>
		<div role="tabpanel">{children}</div>
	</Panel>
);
