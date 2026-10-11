import { type ReactNode, useState } from "react";

import { clsx } from "clsx";

import { BUILD, REGISTRY } from "~/shared/lib/copy";

import { Audit, type AuditProps } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import {
	Build,
	BuildRoom,
	buildHeadOf,
	buildTallyOf,
	type BuildProps,
} from "./Build.ui";
import { discloseAllFor } from "./DiscloseAll.ui";
import { IncidentDesk, type IncidentDeskProps } from "./IncidentDesk.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Panel } from "./Panel.ui";
import { Registry, RegistrySummary, type RegistryProps } from "./Registry.ui";
import {
	RegistryControl,
	type RegistryControlProps,
} from "./RegistryControl.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Tabs, type TabItem } from "./Tabs.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	controlsTitle: "Services",
	tabs: "Shop panels",
	desk: "Desk",
	ready: "ready",
} as const;

const TOP = "contents md:flex md:w-full md:items-center md:gap-8";
const TOP_TITLE = "min-w-0 md:flex-1";
const TOP_PRESS = "order-last min-w-0 md:order-none md:flex-1";
const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const TABS = "w-full md:hidden";
const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMNS_SHUT = "opacity-60";
const COLUMN = "contents md:flex md:w-full md:min-w-0 md:flex-col md:gap-6";
const PANE = "w-full min-w-0 flex-col md:flex";
const PANE_SHOWN = "flex";
const PANE_HIDDEN = "hidden";

const CONTROL_LAYOUT = "row";

export type ShopTab = "registry" | "build" | "services" | "desk";

const FIRST_TAB: ShopTab = "registry";

export type ShopServiceRow = RegistryControlProps & { id: string };

export type ShopScreenProps = {
	build: BuildProps;
	registry: RegistryProps;
	header: HeaderProps;
	controls?: readonly ShopServiceRow[];
	audits?: readonly AuditProps[];
	incidents?: IncidentDeskProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
	shut?: string;
};

const isReady = (row: ShopServiceRow) =>
	row.locked !== true && row.carried !== false;

const tabsOf = (
	build: BuildProps,
	registry: RegistryProps,
	controls: readonly ShopServiceRow[],
	incidents: IncidentDeskProps | undefined
): TabItem[] => [
	{
		id: "registry",
		label: REGISTRY,
		count: `${registry.offers.length}`,
	},
	{ id: "build", label: BUILD, count: buildTallyOf(build) },
	...(controls.length === 0
		? []
		: [
				{
					id: "services",
					label: COPY.controlsTitle,
					count: `${controls.filter(isReady).length}`,
				},
			]),
	...(incidents === undefined ? [] : [{ id: "desk", label: COPY.desk }]),
];

const isShopTab = (id: string): id is ShopTab =>
	id === "registry" || id === "build" || id === "services" || id === "desk";

type PaneProps = { tab: ShopTab; shown: ShopTab; children: ReactNode };

const Pane = ({ tab, shown, children }: PaneProps) => (
	<div
		role="tabpanel"
		data-shop-tab={tab}
		className={clsx(PANE, tab === shown ? PANE_SHOWN : PANE_HIDDEN)}
	>
		{children}
	</div>
);

const ReadyCount = ({ count }: { count: number }) => (
	<>
		<Badge>{count}</Badge>
		<span>{COPY.ready}</span>
	</>
);

const ServiceRow = ({ control }: { control: RegistryControlProps }) => (
	<Panel.Row>
		<RegistryControl {...control} layout={CONTROL_LAYOUT} />
	</Panel.Row>
);

const Services = ({ controls }: { controls: readonly ShopServiceRow[] }) => (
	<Panel>
		<Panel.Header
			label={COPY.controlsTitle}
			meta={<ReadyCount count={controls.filter(isReady).length} />}
		/>
		<Panel.Rows>
			{controls.map(({ id, ...control }) => (
				<ServiceRow key={id} control={control} />
			))}
		</Panel.Rows>
	</Panel>
);

export const ShopScreen = ({
	build,
	registry,
	header,
	controls = [],
	audits = [],
	incidents,
	footer,
	width,
	ground = "bare",
	shut,
}: ShopScreenProps) => {
	const [shown, setShown] = useState<ShopTab>(FIRST_TAB);

	return (
		<Screen
			gate={header.swatch.theme}
			width={width}
			ground={ground}
			enter="rise"
		>
			<div className={TOP}>
				<div className={TOP_TITLE}>
					<Header {...header} />
				</div>
				{footer === undefined ? null : (
					<div className={TOP_PRESS}>
						<ScreenActions {...footer} />
					</div>
				)}
			</div>

			{audits.length === 0 ? null : (
				<div className={AUDITS}>
					{audits.map((audit, index) => (
						<Audit key={audit.code ?? index} {...audit} />
					))}
				</div>
			)}

			{shut === undefined ? null : (
				<Panel>
					<Panel.Body>
						<Typography variant="prose">{shut}</Typography>
					</Panel.Body>
				</Panel>
			)}

			<div className={TABS}>
				<Tabs
					look="pill"
					label={COPY.tabs}
					items={tabsOf(build, registry, controls, incidents)}
					activeId={shown}
					onSelect={(id) => {
						if (isShopTab(id)) setShown(id);
					}}
				/>
			</div>

			<div
				inert={shut !== undefined}
				className={clsx(COLUMNS, shut !== undefined && COLUMNS_SHUT)}
			>
				<div className={COLUMN}>
					<Pane tab="build" shown={shown}>
						<Panel>
							<Panel.Header
								label={BUILD}
								meta={buildHeadOf(build)}
								trailing={discloseAllFor(build, build.configs.length)}
							/>
							<Panel.Body>
								<BuildRoom {...build} />
								<Build {...build} heading={false} caption={false} />
							</Panel.Body>
						</Panel>
					</Pane>

					{incidents === undefined ? null : (
						<Pane tab="desk" shown={shown}>
							<IncidentDesk {...incidents} />
						</Pane>
					)}

					{controls.length === 0 ? null : (
						<Pane tab="services" shown={shown}>
							<Services controls={controls} />
						</Pane>
					)}
				</div>

				<div className={COLUMN}>
					<Pane tab="registry" shown={shown}>
						<Panel>
							<Panel.Header
								label={REGISTRY}
								meta={
									<RegistrySummary
										offers={registry.offers.length}
										slotPrice={registry.slotPrice}
									/>
								}
								trailing={discloseAllFor(registry, registry.offers.length)}
							/>
							<Panel.Body>
								<Registry {...registry} heading={false} />
							</Panel.Body>
						</Panel>
					</Pane>
				</div>
			</div>
		</Screen>
	);
};
