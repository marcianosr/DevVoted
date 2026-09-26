import type { ReactNode } from "react";

import type { KantoColor } from "./colors";
import { Screen } from "./Screen.ui";
import { Tabs, type TabItem } from "./Tabs.ui";
import { Typography } from "./Typography.ui";

const TITLE_ROW = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const SUBTITLE = "text-sm text-theme-muted";
const ARCHIVE = "ml-auto text-sm tabular-nums text-theme-muted";
const TABBED = "flex w-full flex-col";

export const DEX_TITLE = "Dex";
export const DEX_SUBTITLE = "everything the game has shown you";
export const DEX_TABLIST_LABEL = "Dex collections";

export type DexScreenProps = {
	tabs: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	theme: KantoColor;
	archive: string;
	children: ReactNode;
};

export const DexScreen = ({
	tabs,
	activeId,
	onSelect,
	theme,
	archive,
	children,
}: DexScreenProps) => (
	<Screen theme={theme} width="wide" ground="bare">
		<div className={TITLE_ROW}>
			<Typography variant="headline" as="h1">
				{DEX_TITLE}
			</Typography>
			<span className={SUBTITLE}>{DEX_SUBTITLE}</span>
			<span className={ARCHIVE}>{archive}</span>
		</div>
		<div className={TABBED}>
			<Tabs
				items={tabs}
				activeId={activeId}
				onSelect={onSelect}
				label={DEX_TABLIST_LABEL}
			/>
			<div role="tabpanel">{children}</div>
		</div>
	</Screen>
);
