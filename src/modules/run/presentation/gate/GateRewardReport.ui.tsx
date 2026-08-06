import { clsx } from "clsx";

import {
	gateStepsSummary,
	type GateRewardKind,
	type GateRewardRow,
	type GateRewardStatus,
} from "~/modules/run/gate/gateReward.model";
import {
	type GateSwatch,
	hasThemeColor,
} from "~/modules/run/gate/swatch.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { GainBar } from "~/ui/runs/GainBar.ui";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { PipelineReportRow } from "./PipelineReportRow.ui";
import { PipelineTable } from "./PipelineTable.ui";

const STATUS_VARIANT: Record<GateRewardStatus, StatusBadgeVariant> = {
	passed: "pass",
	failed: "fail",
	skipped: "skip",
};

// Coverage reads green, storage amber, checks green — overridden to red when the
// step failed, muted when skipped.
const KIND_TONE: Record<GateRewardKind, ParagraphTone> = {
	coverage: "viridian",
	storage: "saffron",
	check: "viridian",
};

const valueTone = (row: GateRewardRow): ParagraphTone => {
	if (row.status === "failed") return "cinnabar";
	if (row.status === "skipped") return "muted";
	return KIND_TONE[row.kind];
};

const ReportRow = ({
	row,
	removable,
	onRemove,
}: {
	row: GateRewardRow;
	removable?: boolean;
	onRemove?: (configId: string) => void;
}) => (
	<PipelineReportRow
		badge={STATUS_VARIANT[row.status]}
		layout="table"
		config={row.config}
		description={row.description}
		descriptionTone={row.status === "failed" ? "cinnabar" : "muted"}
		value={row.value}
		valueTone={valueTone(row)}
		removable={removable}
		onRemove={onRemove}
	/>
);

const STEP_PARTS = [
	{ key: "passed", tone: "viridian" },
	{ key: "failed", tone: "cinnabar" },
	{ key: "skipped", tone: "muted" },
] as const;

const StepsSummary = ({ rows }: { rows: readonly GateRewardRow[] }) => {
	const summary = gateStepsSummary(rows);
	const parts = STEP_PARTS.filter((part) => summary[part.key] > 0);
	return (
		<Paragraph as="div" size="sm" className="flex gap-2 ">
			{parts.map((part, index) => (
				<span key={part.key} className="flex gap-2">
					{index > 0 ? <span className="text-zinc-300">·</span> : null}
					<Paragraph as="span" size="sm" tone={part.tone}>
						{summary[part.key]} {part.key}
					</Paragraph>
				</span>
			))}
		</Paragraph>
	);
};

type GateRewardReportProps = {
	gateNumber: number;
	cleared: boolean;
	/** The badge this gate's clear awarded (ADR-019) — absent on a failed gate. */
	earnedSwatch?: GateSwatch;
	rows: readonly GateRewardRow[];
	totals?: { storageKb: number; coveragePct: number };
	/** Run storage before → after the payout — drawn as the HUD bar's sibling
	 * under the winnings line. */
	storageBar?: { fromKb: number; toKb: number; capKb: number };
	removableConfigIds?: readonly string[];
	onRemoveConfig?: (configId: string) => void;
	stripsRemaining?: number;
};

const headline = (
	gateNumber: number,
	cleared: boolean
): { variant: StatusBadgeVariant; title: string } =>
	cleared
		? { variant: "pass", title: `Gate ${gateNumber} cleared!` }
		: { variant: "fail", title: `Gate ${gateNumber} failed!` };

/**
 * The badge line: the clear's own receipt, so it sits directly under the
 * headline rather than with the collection tally further down. Wears the
 * swatch's colour, which is the whole point of earning it.
 */
const EarnedSwatch = ({ swatch }: { swatch: GateSwatch }) => (
	<span
		data-testid="earned-swatch"
		{...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
		className="flex items-center gap-2"
	>
		<SwatchMark finish={swatch.finish} />
		{/* One Paragraph, not two: a flex gap is not whitespace, so split spans
		    would be read out as "Boulder Swatchearned". */}
		<Paragraph as="span" size="sm" tone="muted">
			<span className={clsx("font-bold", swatchNameClass(swatch.finish))}>
				{swatch.name}
			</span>{" "}
			earned
		</Paragraph>
	</span>
);

export const GateRewardReport = ({
	gateNumber,
	cleared,
	earnedSwatch,
	rows,
	totals,
	storageBar,
	removableConfigIds = [],
	onRemoveConfig,
	stripsRemaining,
}: GateRewardReportProps) => {
	const { variant, title } = headline(gateNumber, cleared);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3 ">
				<StatusBadge variant={variant} />
				<Title>{title}</Title>
			</div>

			{cleared && earnedSwatch && <EarnedSwatch swatch={earnedSwatch} />}

			{!cleared && stripsRemaining !== undefined && stripsRemaining > 0 && (
				<Paragraph size="sm" tone="pewter">
					Remove {stripsRemaining} config{stripsRemaining === 1 ? "" : "s"} to
					continue
				</Paragraph>
			)}

			<StepsSummary rows={rows} />

			<PipelineTable>
				{[...rows]
					.sort((a: GateRewardRow, b: GateRewardRow) => {
						const aRemovable = removableConfigIds.includes(a.config.id);
						const bRemovable = removableConfigIds.includes(b.config.id);
						// Fixed (non-removable) configs first, then removable ones
						return aRemovable === bRemovable ? 0 : aRemovable ? 1 : -1;
					})
					.map((row) => (
						<ReportRow
							key={row.key}
							row={row}
							removable={removableConfigIds.includes(row.config.id)}
							onRemove={onRemoveConfig}
						/>
					))}
			</PipelineTable>

			{totals ? (
				// Only the cleared path passes totals, so the line reads as the
				// gate's winnings rather than a bare sum.
				<div className="flex flex-col items-center gap-2 self-center">
					<Paragraph size="sm">
						<Paragraph as="span" size="sm" tone="muted">
							you won{" "}
						</Paragraph>
						<span className="font-extrabold text-gradient-green">
							+{totals.storageKb}KB
						</span>{" "}
						storage ·{" "}
						<span className="font-extrabold text-gradient-green">
							+{totals.coveragePct}%
						</span>{" "}
						coverage
					</Paragraph>
					{storageBar ? (
						<span className="w-56">
							<GainBar
								from={storageBar.fromKb}
								to={storageBar.toKb}
								cap={storageBar.capKb}
								label="storage"
							/>
						</span>
					) : null}
				</div>
			) : null}
		</div>
	);
};
