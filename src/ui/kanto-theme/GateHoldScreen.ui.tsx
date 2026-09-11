import { Audit, type AuditProps } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import { LedgerRows, type LedgerRow } from "./LedgerRows.ui";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

const HEADER = "flex w-full flex-col gap-4";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const TOLL = "ml-auto flex shrink-0 flex-col items-end gap-1";
const TOLL_AMOUNT = "text-2xl font-extrabold tabular-nums text-theme";
const TOLL_NOTE = "text-xs text-theme-muted";
const CHIPS = "flex w-full flex-wrap items-center gap-2";
const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const PANELS = "flex w-full flex-col gap-4";
const DROP = "flex w-full flex-col gap-3";
const DROP_HEADING = "flex w-full flex-wrap items-baseline gap-3";
const DROP_META = "ml-auto shrink-0";
const DROP_ROWS = "flex w-full flex-col gap-2";

const SWATCH_SIZE = "hero";
const TRACK_SIZE = "small";
const TOLL_COLOR: KantoColor = "cinnabar";

export type GateHoldToll = { amount: string; note: string };

export type GateHoldChip = { label: string; color?: KantoColor };

export type GateHoldHeader = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	title: string;
	subtitle: string;
	toll: GateHoldToll;
	chips: readonly GateHoldChip[];
};

export type GateHoldPanel = {
	title: string;
	summary?: string;
	badges?: readonly FoldBadge[];
	open?: boolean;
	rows: readonly LedgerRow[];
};

export type GateHoldDrop = {
	title: string;
	meta: string;
	note: string;
	configs: readonly ConfigChipProps[];
};

export type GateHoldScreenProps = {
	header: GateHoldHeader;
	coverage: GateHoldPanel;
	storage: GateHoldPanel;
	drop: GateHoldDrop;
	audits?: readonly AuditProps[];
	footer: ScreenFooterProps;
	width?: ScreenWidth;
};

const GateHoldHeading = ({
	swatch,
	swatches,
	title,
	subtitle,
	toll,
	chips,
}: GateHoldHeader) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch state="current" swatch={swatch} size={SWATCH_SIZE} />
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			</span>
			<span data-screen-theme={TOLL_COLOR} className={TOLL}>
				<span className={TOLL_AMOUNT}>{toll.amount}</span>
				<span className={TOLL_NOTE}>{toll.note}</span>
			</span>
		</div>

		<SwatchTrack swatches={swatches} size={TRACK_SIZE} />

		{chips.length === 0 ? null : (
			<div className={CHIPS}>
				{chips.map((chip) => (
					<Badge key={chip.label} color={chip.color}>
						{chip.label}
					</Badge>
				))}
			</div>
		)}
	</header>
);

const LedgerPanel = ({ rows, ...panel }: GateHoldPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
	</Fold>
);

const DropPanel = ({ title, meta, note, configs }: GateHoldDrop) => (
	<section className={DROP}>
		<div className={DROP_HEADING}>
			<Typography variant="title" as="h3">
				{title}
			</Typography>
			<span className={DROP_META}>
				<Typography variant="hint" as="span">
					{meta}
				</Typography>
			</span>
		</div>
		<Panel>
			<div className={DROP_ROWS}>
				{configs.map((config, index) => (
					<ConfigChip key={index} {...config} />
				))}
			</div>
			<Typography variant="hint">{note}</Typography>
		</Panel>
	</section>
);

export const GateHoldScreen = ({
	header,
	coverage,
	storage,
	drop,
	audits = [],
	footer,
	width = "default",
}: GateHoldScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<GateHoldHeading {...header} />
		{audits.length === 0 ? null : (
			<div className={AUDITS}>
				{audits.map((audit, index) => (
					<Audit key={index} {...audit} />
				))}
			</div>
		)}
		<div className={PANELS}>
			<LedgerPanel {...coverage} />
			<LedgerPanel {...storage} />
		</div>
		<DropPanel {...drop} />
		<ScreenFooter {...footer} />
	</Screen>
);
