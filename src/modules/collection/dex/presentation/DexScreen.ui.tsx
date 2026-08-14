import type { ReactNode } from "react";

import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";
import { Tabs, type Tab } from "~/ui/Tabs.ui";
import { Title } from "~/ui/typography/Title.component";

type DexScreenProps = {
	tabs: Tab[];
	activeTab: string;
	onSelectTab: (id: string) => void;
	children: ReactNode;
};

/** The Dex shell: title + shared tab bar, with the active tab's body below. */
export const DexScreen = ({
	tabs,
	activeTab,
	onSelectTab,
	children,
}: DexScreenProps) => (
	<Screen>
		<Stack gap="6">
			<Title>Dex</Title>
			<Tabs tabs={tabs} activeId={activeTab} onSelect={onSelectTab} />
			{children}
		</Stack>
	</Screen>
);
