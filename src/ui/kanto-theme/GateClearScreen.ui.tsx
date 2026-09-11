import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import type { IconName } from "./Icon.ui";
import { LedgerRows, type LedgerRow } from "./LedgerRows.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

const HEADER = "flex w-full flex-col gap-4";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const GAIN = "ml-auto flex shrink-0 flex-col items-end gap-1";
const GAIN_AMOUNT = "text-2xl font-extrabold tabular-nums text-theme";
const GAIN_NOTE = "text-xs text-theme-muted";
const CHIPS = "flex w-full flex-wrap items-center gap-2";
const PANELS = "flex w-full flex-col gap-4";
const REVIEW_ROW = "flex w-full justify-end";

const SWATCH_SIZE = "hero";
const TRACK_SIZE = "small";
const REVIEW_SIZE = "sm";

export type GateClearChip = { label: string; color?: KantoColor };

export type GateClearGain = { amount: string; note: string };

export type GateClearHeader = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	title: string;
	subtitle: string;
	gain: GateClearGain;
	chips: readonly GateClearChip[];
};

export type GateClearPanel = {
	title: string;
	summary?: string;
	badges?: readonly FoldBadge[];
	open?: boolean;
};

export type GateClearLedgerPanel = GateClearPanel & {
	rows: readonly LedgerRow[];
};

export type GateClearBuildPanel = GateClearPanel & {
	changes: readonly ConfigChipProps[];
	note?: string;
};

export type GateClearReview = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

export type GateClearAnswersPanel = GateClearLedgerPanel & {
	review: GateClearReview;
};

export type GateClearScreenProps = {
	header: GateClearHeader;
	coverage: GateClearLedgerPanel;
	storage: GateClearLedgerPanel;
	changes: GateClearBuildPanel;
	answers: GateClearAnswersPanel;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
};

const GateClearHeading = ({
	swatch,
	swatches,
	title,
	subtitle,
	gain,
	chips,
}: GateClearHeader) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch state="discovered" swatch={swatch} size={SWATCH_SIZE} />
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			</span>
			<span className={GAIN}>
				<span className={GAIN_AMOUNT}>{gain.amount}</span>
				<span className={GAIN_NOTE}>{gain.note}</span>
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

const LedgerPanel = ({ rows, ...panel }: GateClearLedgerPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
	</Fold>
);

const ChangesPanel = ({ changes, note, ...panel }: GateClearBuildPanel) => (
	<Fold {...panel}>
		{changes.map((change, index) => (
			<ConfigChip key={index} {...change} />
		))}
		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</Fold>
);

const AnswersPanel = ({ rows, review, ...panel }: GateClearAnswersPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
		<div className={REVIEW_ROW}>
			<Button
				size={REVIEW_SIZE}
				label={review.label}
				icon={review.icon}
				disabled={review.onPress === undefined}
				onPress={review.onPress}
			/>
		</div>
	</Fold>
);

export const GateClearScreen = ({
	header,
	coverage,
	storage,
	changes,
	answers,
	footer,
	width = "default",
}: GateClearScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<GateClearHeading {...header} />
		<div className={PANELS}>
			<LedgerPanel {...coverage} />
			<LedgerPanel {...storage} />
			<ChangesPanel {...changes} />
			<AnswersPanel {...answers} />
		</div>
		<ScreenFooter {...footer} />
	</Screen>
);
