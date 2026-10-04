import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Figures } from "./Figures.ui";
import { Screen } from "./Screen.ui";
import { Tabs, type TabItem } from "./Tabs.ui";
import { Typography } from "./Typography.ui";

const TITLE_ROW = "flex w-full flex-wrap items-center gap-x-6 gap-y-2";
const ARCHIVE = "ml-auto text-sm text-theme-muted";
const TABBED = "flex w-full flex-col gap-4";
const FOOTER_ROOM = "h-24";
const HIGHLIGHTS = "grid w-full items-start gap-6 lg:grid-cols-2";
const SECTIONS = "flex w-full flex-col gap-6";

export const DEX_TITLE = "Dex";
export const DEX_TABLIST_LABEL = "Dex collections";

export type ProfileScreenProps = {
	hero: ReactNode;
	theme: SwatchTheme;
	highlights?: ReactNode;
	sections?: ReactNode;
	tabs?: readonly TabItem[];
	activeId?: string;
	onSelect?: (id: string) => void;
	archive?: string;
	footer?: ReactNode;
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
	<div className={TABBED}>
		<div className={TITLE_ROW}>
			<Typography variant="headline" as="h1">
				{DEX_TITLE}
			</Typography>
			<Tabs
				items={tabs}
				activeId={activeId}
				onSelect={onSelect}
				label={DEX_TABLIST_LABEL}
				look="ghost"
			/>
			{archive === undefined ? null : (
				<span className={ARCHIVE}>
					<Figures text={archive} />
				</span>
			)}
		</div>
		<div role="tabpanel">{children}</div>
	</div>
);

export const ProfileScreen = ({
	hero,
	theme,
	highlights,
	sections,
	tabs,
	activeId,
	onSelect,
	archive,
	footer,
	children,
}: ProfileScreenProps) => (
	<Screen gate={theme} width="wide" ground="bare">
		{hero}
		{highlights === undefined ? null : (
			<div className={HIGHLIGHTS}>{highlights}</div>
		)}
		{sections === undefined ? null : <div className={SECTIONS}>{sections}</div>}
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
		{footer === undefined ? null : (
			<>
				<div aria-hidden className={FOOTER_ROOM} />
				{footer}
			</>
		)}
	</Screen>
);
