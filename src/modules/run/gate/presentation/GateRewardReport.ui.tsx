import type { ReactNode } from "react";

import {
	gateStepsSummary,
	type GateRewardKind,
	type GateRewardRow,
	type GateRewardStatus,
} from "~/modules/run/gate/domain/gateReward.model";
import {
	type GateSwatch,
	hasThemeColor,
} from "~/modules/run/gate/domain/swatch.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { GainBar } from "~/ui/GainBar.ui";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { PipelineReportRow } from "~/modules/run/pipeline/presentation/PipelineReportRow.ui";
import { PipelineTable } from "~/modules/run/pipeline/presentation/PipelineTable.ui";
import { SwatchChip } from "~/modules/run/gate/presentation/SwatchChips.ui";

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
	/**
	 * The gate's own badge: it names the headline either way, and on a clear it is
	 * also what the gate just awarded (ADR-019).
	 */
	swatch?: GateSwatch;
	rows: readonly GateRewardRow[];
	totals?: { storageKb: number; coveragePct: number };
	/** Run storage before → after the payout — drawn as the HUD bar's sibling
	 * under the winnings line. */
	storageBar?: { fromKb: number; toKb: number; capKb: number };
	/**
	 * Run coverage after the payout — the running total the coverage figure
	 * reads against. Omitted at the slot cap, where there is no total left to
	 * track. The rung's own progress is `slotRow`'s job, not this one's.
	 */
	coverageBar?: { toPct: number };
	/** How much of the collection this clear's badge makes — "1 of 13". */
	swatchProgress?: { earned: number; total: number };
	/**
	 * The climb under the badge: the gate ladder, and where the clear leaves you.
	 * The badge is the reward; this is the depth it bought, which is the only one
	 * of the three rewards whose meter is a row of gates rather than a bar.
	 */
	climb?: { ladder: ReactNode; caption: ReactNode };
	/**
	 * The width the run's coverage is paying for, as its own ledger row — a
	 * small bar plus "X% of Y%", muted until met and gradient-green once it
	 * is. Sits right under the coverage row rather than inside it: coverage
	 * is a running total, the slot is a separate thing it is buying.
	 */
	slotRow?: ReactNode;
	/** What the coverage number breaks down into — closes the rewards section. */
	breakdown?: ReactNode;
	removableConfigIds?: readonly string[];
	onRemoveConfig?: (configId: string) => void;
	stripsRemaining?: number;
};

/**
 * Gates are named, not numbered: "Pallet gate cleared!" is what the player will
 * remember, and the badge's own colour marks the pass better than a green PASS
 * pill ever did. The number stays as the muted caption, since it is what the
 * ladder, the HUD and the daily lock all count in.
 *
 * The swatch mark rides both outcomes. It marks *which gate this was*, not what
 * you walked away with — the same identity the name beside it already carries —
 * so a failure that names the Pallet gate should look like the Pallet gate. Only
 * a failure keeps the red FAIL pill: a clear needs no second word for "passed"
 * once the badge is sitting there, but a failure has no badge of its own to say
 * it with.
 */
const GateHeadline = ({
	gateNumber,
	cleared,
	swatch,
}: {
	gateNumber: number;
	cleared: boolean;
	swatch?: GateSwatch;
}) => (
	<div
		{...(swatch && hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
		className="flex items-center gap-3"
	>
		{cleared ? null : <StatusBadge variant="fail" />}
		{swatch ? (
			<SwatchMark finish={swatch.finish} size="lg" />
		) : cleared ? (
			<StatusBadge variant="pass" />
		) : null}
		<Title>
			{swatch ? (
				<span className={swatchNameClass(swatch.finish)}>
					{swatch.gateName}
				</span>
			) : (
				`Gate ${gateNumber}`
			)}{" "}
			{swatch ? "gate " : ""}
			{cleared ? "cleared!" : "failed!"}
		</Title>
		<Paragraph as="span" size="sm" tone="faint">
			gate {gateNumber}
		</Paragraph>
	</div>
);

/**
 * The two figures a reward carries — where the run stands, and what this gate
 * added. On the first gate they are the same number, because everything you hold
 * is what you just won, so the label carries "this gate" and the value is the
 * gain alone. A run with history keeps the running total as the value and moves
 * "this gate" onto a second, smaller figure beneath it.
 */
const meterFigures = (
	total: number | undefined,
	gain: number,
	unit: string,
	name: string
): { label: string; value: string; gain?: string } =>
	total === undefined || total === gain
		? { label: `${name} this gate`, value: `+${gain}${unit}` }
		: {
				label: name,
				value: `${total}${unit}`,
				gain: `+${gain}${unit} this gate`,
			};

/**
 * One reward as a bullet line. `GateStakeReceipt` (what a gate promises)
 * moved to an inline flow (Marciano, 2026-08-10: "5 polls → reward → fail
 * consequence") — this report (what it paid) stays a list, since it's read
 * after the fact rather than scanned for a quick decision. The value leads,
 * gradient green and bold, since it is the number a player scans for; the
 * label just names what it is. An optional detail (a bar, a caption) sits
 * below the line, inside the bullet.
 */
const RewardLine = ({
	label,
	value,
	gain,
	detail,
}: {
	label: ReactNode;
	value: ReactNode;
	gain?: ReactNode;
	detail?: ReactNode;
}) => (
	<li>
		<Paragraph as="span" size="sm">
			<Paragraph
				as="span"
				size="sm"
				tone="gradient"
				className="font-extrabold tabular-nums"
			>
				{value}
			</Paragraph>{" "}
			{label}
			{gain ? (
				<Paragraph
					as="span"
					size="xs"
					tone="saffron"
					className="ml-2 tabular-nums"
				>
					{gain}
				</Paragraph>
			) : null}
		</Paragraph>
		{detail}
	</li>
);

/**
 * The badge this clear awarded: the third line of the payout, a reward on a par
 * with the storage and the coverage. It needs no "earned" — the heading above it
 * already says these are the gate's rewards.
 *
 * The same bordered chip the collection strip uses, so the badge in the payout
 * and the badge two lines below it under "Swatches collected" read as one object
 * rather than two drawings of it.
 */
const EarnedSwatch = ({ swatch }: { swatch: GateSwatch }) => (
	<SwatchChip swatch={swatch} testId="earned-swatch" />
);

export const GateRewardReport = ({
	gateNumber,
	cleared,
	swatch,
	rows,
	totals,
	storageBar,
	coverageBar,
	swatchProgress,
	climb,
	slotRow,
	breakdown,
	removableConfigIds = [],
	onRemoveConfig,
	stripsRemaining,
}: GateRewardReportProps) => {
	const storageFigures = meterFigures(
		storageBar?.toKb,
		totals?.storageKb ?? 0,
		"KB",
		"storage"
	);
	const coverageFigures = meterFigures(
		coverageBar?.toPct,
		totals?.coveragePct ?? 0,
		"%",
		"coverage"
	);

	const pipelineSection = (
		<section className="flex flex-col gap-2">
			<Title>Your pipeline</Title>
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
		</section>
	);

	return (
		<div className="flex flex-col gap-3">
			<GateHeadline gateNumber={gateNumber} cleared={cleared} swatch={swatch} />

			{totals && climb ? (
				<div className="flex flex-col gap-1.5">
					{climb.ladder}
					<Paragraph as="span" size="xs" tone="faint">
						{climb.caption}
					</Paragraph>
				</div>
			) : null}

			{!cleared && stripsRemaining !== undefined && stripsRemaining > 0 && (
				<Paragraph size="sm" tone="pewter">
					Remove {stripsRemaining} config{stripsRemaining === 1 ? "" : "s"} to
					continue
				</Paragraph>
			)}

			{totals ? (
				// Only the cleared path passes totals. The pipeline steps and the
				// payout are two halves of the same report — what the run just did,
				// and what it won for doing it — so they sit side by side rather than
				// one after the other.
				<div className="grid gap-x-12 gap-y-6 pt-6 sm:grid-cols-2">
					{pipelineSection}
					<section className="flex flex-col gap-2">
						<Title>Gate rewards</Title>
						<ul className="flex flex-col gap-1 list-disc pl-4 marker:text-zinc-500">
							<RewardLine
								label={storageFigures.label}
								value={storageFigures.value}
								gain={storageFigures.gain}
								detail={
									storageBar ? (
										<>
											<GainBar
												from={storageBar.fromKb}
												to={storageBar.toKb}
												cap={storageBar.capKb}
												label="storage"
											/>
											<Paragraph as="span" size="xs" tone="faint">
												of {storageBar.capKb}KB cap
											</Paragraph>
										</>
									) : undefined
								}
							/>
							<RewardLine
								label={coverageFigures.label}
								value={coverageFigures.value}
								gain={coverageFigures.gain}
							/>
							{slotRow}
							{swatch ? (
								<li>
									<div className="flex flex-wrap items-center gap-3">
										<EarnedSwatch swatch={swatch} />
										{swatchProgress ? (
											<Paragraph as="span" size="xs" tone="faint">
												earned · {swatchProgress.earned} of{" "}
												{swatchProgress.total}
											</Paragraph>
										) : null}
									</div>
								</li>
							) : null}
						</ul>
					</section>
				</div>
			) : (
				pipelineSection
			)}

			{totals && breakdown ? (
				<>
					<hr className="border-t border-zinc-800" />
					{breakdown}
				</>
			) : null}
		</div>
	);
};
