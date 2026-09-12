import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import {
	COVERAGE_BAND_COLOR,
	CoverageBar,
	type CoverageBandId,
	type CoverageBarProps,
	coverageBandOf,
} from "./CoverageBar.ui";
import { Audit, type AuditProps } from "./Audit.ui";
import { Figures } from "./Figures.ui";
import { Fold, type FoldBadge } from "./Fold.ui";
import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";
import type { IconName } from "./Icon.ui";
import { LedgerRows, type LedgerRow } from "./LedgerRows.ui";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch, type SwatchFill, type SwatchState } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

const HEADER = "flex w-full flex-col gap-4";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const FIGURE = "ml-auto flex shrink-0 flex-col items-end gap-1";
const FIGURE_AMOUNT = "text-2xl font-extrabold tabular-nums text-theme";
const FIGURE_NOTE = "text-xs text-theme-muted";
const CHIPS = "flex w-full flex-wrap items-center gap-2";
const AUDITS = "flex w-full flex-wrap items-stretch gap-3";
const PANELS = "flex w-full flex-col gap-4";
const REVIEW_ROW = "flex w-full justify-end";
const ENDING = "flex w-full flex-col gap-2";

const SWATCH_SIZE = "hero";
const TRACK_SIZE = "small";
const REVIEW_SIZE = "sm";

const RUN_OVER_BAND: CoverageBandId = "danger";
const RUN_OVER_COLOR: KantoColor = "cinnabar";
const MARKED_BAND: CoverageBandId = "perfect";

const SWATCH_STATE = {
	perfect: "discovered",
	healthy: "discovered",
	ok: "discovered",
	shaky: "current",
	danger: "current",
} satisfies Record<CoverageBandId, SwatchState>;

export type GateOutcomeFigure = { amount: string; note: string };

export type GateOutcomeChip = { label: string; color?: KantoColor };

export type GateOutcomeHeader = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	title: string;
	subtitle: string;
	figure: GateOutcomeFigure;
	chips: readonly GateOutcomeChip[];
};

export type GateOutcomePanel = {
	title: string;
	summary?: string;
	badges?: readonly FoldBadge[];
	open?: boolean;
};

export type GateOutcomeLedgerPanel = GateOutcomePanel & {
	rows: readonly LedgerRow[];
};

export type GateOutcomeBonusPanel = GateOutcomePanel & { detail: string };

export type GateOutcomeBuildPanel = GateOutcomePanel & {
	changes: readonly ConfigChipProps[];
	note?: string;
};

export type GateOutcomeReview = {
	label: string;
	icon?: IconName;
	onPress?: () => void;
};

export type GateOutcomeAnswersPanel = GateOutcomeLedgerPanel & {
	review?: GateOutcomeReview;
};

export type GateEnding = { title: string; detail: string };

export type GateOutcomeTail =
	| { choice: GateChoiceProps; ending?: never }
	| { ending: GateEnding; choice?: never };

export type GateOutcomeScreenProps = {
	header: GateOutcomeHeader;
	bar: CoverageBarProps;
	bonus?: GateOutcomeBonusPanel;
	coverage: GateOutcomeLedgerPanel;
	storage: GateOutcomeLedgerPanel;
	changes?: GateOutcomeBuildPanel;
	answers: GateOutcomeAnswersPanel;
	audits?: readonly AuditProps[];
	tail?: GateOutcomeTail;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
};

const GateOutcomeHeading = ({
	band,
	swatch,
	swatches,
	title,
	subtitle,
	figure,
	chips,
}: GateOutcomeHeader & { band: CoverageBandId }) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch
				state={SWATCH_STATE[band]}
				swatch={swatch}
				marked={band === MARKED_BAND}
				size={SWATCH_SIZE}
			/>
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			</span>
			<span data-screen-theme={COVERAGE_BAND_COLOR[band]} className={FIGURE}>
				<span className={FIGURE_AMOUNT}>{figure.amount}</span>
				<span className={FIGURE_NOTE}>{figure.note}</span>
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

const BonusPanel = ({ detail, ...panel }: GateOutcomeBonusPanel) => (
	<Fold {...panel}>
		<Typography variant="paragraph">
			<Figures text={detail} />
		</Typography>
	</Fold>
);

const LedgerPanel = ({ rows, ...panel }: GateOutcomeLedgerPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
	</Fold>
);

const ChangesPanel = ({ changes, note, ...panel }: GateOutcomeBuildPanel) => (
	<Fold {...panel}>
		{changes.map((change, index) => (
			<ConfigChip key={index} {...change} />
		))}
		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</Fold>
);

const AnswersPanel = ({ rows, review, ...panel }: GateOutcomeAnswersPanel) => (
	<Fold {...panel}>
		<LedgerRows rows={rows} />
		{review === undefined ? null : (
			<div className={REVIEW_ROW}>
				<Button
					size={REVIEW_SIZE}
					label={review.label}
					icon={review.icon}
					disabled={review.onPress === undefined}
					onPress={review.onPress}
				/>
			</div>
		)}
	</Fold>
);

const EndingPanel = ({ title, detail }: GateEnding) => (
	<Panel className={ENDING}>
		<Typography variant="title" as="h2">
			{title}
		</Typography>
		<Typography variant="paragraph">
			<Figures text={detail} />
		</Typography>
	</Panel>
);

export const GateOutcomeScreen = ({
	header,
	bar,
	bonus,
	coverage,
	storage,
	changes,
	answers,
	audits = [],
	tail,
	footer,
	width = "default",
}: GateOutcomeScreenProps) => {
	const band = coverageBandOf(bar.held, bar);

	const body = (
		<>
			<GateOutcomeHeading band={band} {...header} />

			{audits.length === 0 ? null : (
				<div className={AUDITS}>
					{audits.map((audit, index) => (
						<Audit key={index} {...audit} />
					))}
				</div>
			)}

			<CoverageBar {...bar} pin />

			<div className={PANELS}>
				{bonus === undefined ? null : <BonusPanel {...bonus} />}
				<LedgerPanel {...coverage} />
				<LedgerPanel {...storage} />
				{changes === undefined ? null : <ChangesPanel {...changes} />}
				<AnswersPanel {...answers} />
			</div>

			{tail?.choice === undefined ? null : <GateChoice {...tail.choice} />}
			{tail?.ending === undefined ? null : <EndingPanel {...tail.ending} />}

			<ScreenFooter {...footer} />
		</>
	);

	if (band === RUN_OVER_BAND) {
		return (
			<Screen theme={RUN_OVER_COLOR} width={width}>
				{body}
			</Screen>
		);
	}

	return (
		<Screen gate={header.swatch.theme} width={width}>
			{body}
		</Screen>
	);
};
