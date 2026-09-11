import { clsx } from "clsx";

import { Audit, type AuditProps } from "./Audit.ui";
import { Build, type BuildProps } from "./Build.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import type { IconName } from "./Icon.ui";
import { Ledger, type LedgerProps } from "./Ledger.ui";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full flex-col gap-6";
const SECTION = "flex w-full flex-col gap-3";
const TITLE_ROW = "flex items-baseline gap-3";
const BILL =
	"ml-auto flex shrink-0 flex-wrap items-center gap-2 text-sm text-theme-muted";
const ROWS = "flex w-full flex-col";
const ROW = "flex w-full py-2";
const DIVIDER = "border-t border-theme-faint";
const SHOP_ROW = "flex w-full";

const NOTE_GAIN: KantoColor = "pewter";

const AUDIT_LAYOUT = "row";
const SHOP_SIZE = "md";

export type PrepAudits = {
	title: string;
	meta?: string;
	bill?: string;
	note?: string;
	alerts: readonly AuditProps[];
};

export type PrepShopLink = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

const Audits = ({ title, meta, bill, note, alerts }: PrepAudits) => (
	<section className={SECTION}>
		<div className={TITLE_ROW}>
			<Typography variant="title" as="h3">
				{title}
			</Typography>
			{meta === undefined ? null : (
				<Typography variant="hint" as="span">
					{meta}
				</Typography>
			)}
			{bill === undefined ? null : (
				<span className={BILL}>
					<Figures text={bill} />
				</span>
			)}
		</div>

		{alerts.length === 0 ? null : (
			<Panel>
				<div className={ROWS}>
					{alerts.map((alert, index) => (
						<div
							key={alert.code ?? index}
							className={clsx(ROW, index > 0 && DIVIDER)}
						>
							<Audit {...alert} layout={AUDIT_LAYOUT} />
						</div>
					))}
				</div>
				{note === undefined ? null : (
					<Typography variant="hint">
						<Figures text={note} gain={NOTE_GAIN} />
					</Typography>
				)}
			</Panel>
		)}
	</section>
);

export type PrepScreenProps = {
	header: HeaderProps;
	build: BuildProps;
	shop?: PrepShopLink;
	polls: LedgerProps;
	audits: PrepAudits;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
};

export const PrepScreen = ({
	header,
	build,
	shop,
	polls,
	audits,
	footer,
	width = "wide",
}: PrepScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<Header {...header} />
		<div className={COLUMNS}>
			<div className={COLUMN}>
				<Build {...build} layout="column" track="occupancy" />
				{shop === undefined ? null : (
					<div className={SHOP_ROW}>
						<Button
							size={SHOP_SIZE}
							label={shop.label}
							icon={shop.icon}
							onPress={shop.onPress}
							disabled={shop.onPress === undefined}
						/>
					</div>
				)}
			</div>

			<div className={COLUMN}>
				<Ledger {...polls} />
				<Audits {...audits} />
			</div>
		</div>
		<ScreenFooter {...footer} />
	</Screen>
);
