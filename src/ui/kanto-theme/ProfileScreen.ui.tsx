import type { ReactNode } from "react";

import type { KantoColor } from "./colors";
import { Screen } from "./Screen.ui";
import { Tabs, type TabItem } from "./Tabs.ui";
import { Typography } from "./Typography.ui";

const TITLE_ROW = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const SUBTITLE = "text-sm text-theme-muted";
const ARCHIVE = "ml-auto text-sm tabular-nums text-theme-muted";
const TABBED = "flex w-full flex-col";
const TOTALS =
	"flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums text-theme-muted";

export const DEX_TITLE = "Dex";
export const DEX_SUBTITLE = "everything the game has shown you";
export const DEX_TABLIST_LABEL = "Dex collections";

export type ProfileScreenProps = {
	card: ReactNode;
	theme: KantoColor;
	totals?: readonly string[];
	tabs?: readonly TabItem[];
	activeId?: string;
	onSelect?: (id: string) => void;
	archive?: string;
	children?: ReactNode;
};

type CollectionsProps = {
	tabs: readonly TabItem[];
	activeId: string;
	onSelect: (id: string) => void;
	archive?: string;
	children?: ReactNode;
};

const Collections = ({
	tabs,
	activeId,
	onSelect,
	archive,
	children,
}: CollectionsProps) => (
	<>
		<div className={TITLE_ROW}>
			<Typography variant="headline" as="h1">
				{DEX_TITLE}
			</Typography>
			<span className={SUBTITLE}>{DEX_SUBTITLE}</span>
			{archive === undefined ? null : (
				<span className={ARCHIVE}>{archive}</span>
			)}
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
	</>
);

export const ProfileScreen = ({
	card,
	theme,
	totals,
	tabs,
	activeId,
	onSelect,
	archive,
	children,
}: ProfileScreenProps) => (
	<Screen theme={theme} width="wide" ground="bare">
		{card}
		{totals === undefined ? null : (
			<div className={TOTALS}>
				{totals.map((total) => (
					<span key={total}>{total}</span>
				))}
			</div>
		)}
		{tabs === undefined ||
		activeId === undefined ||
		onSelect === undefined ? null : (
			<Collections
				tabs={tabs}
				activeId={activeId}
				onSelect={onSelect}
				archive={archive}
			>
				{children}
			</Collections>
		)}
	</Screen>
);
