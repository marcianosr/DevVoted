import type { ReactNode } from "react";

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
import { SwatchChip } from "./SwatchChips.ui";

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
	 * Run coverage before → after, and the rung it is paying for. Coverage buys
	 * width, so the target is the next slot (ADR-019) — never a swatch, which the
	 * clear itself awards. Omitted at the slot cap, where nothing is left to buy.
	 */
	coverageBar?: {
		fromPct: number;
		toPct: number;
		targetPct: number;
		targetLabel: string;
		/** True when this gate's coverage is what carried it over the line. */
		reached?: boolean;
	};
	/** How much of the collection this clear's badge makes — "1 of 13". */
	swatchProgress?: { earned: number; total: number };
	/**
	 * The climb under the badge: the gate ladder, and where the clear leaves you.
	 * The badge is the reward; this is the depth it bought, which is the only one
	 * of the three rewards whose meter is a row of gates rather than a bar.
	 */
	climb?: { ladder: ReactNode; caption: ReactNode };
	/**
	 * The width the run's coverage is paying for, as the same dashed row the shop
	 * and the configuring screen draw. It *is* the coverage meter's bar when given,
	 * not a second one under it: both draw the same rung, and two identical bars
	 * two lines apart read as two different facts. The row wins because it adds
	 * what the plain bar cannot — whether the rung has actually bought a slot yet.
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

/** Every reward's number reads in the same gradient green. */
const RewardValue = ({ children }: { children: ReactNode }) => (
	<span className="font-extrabold text-gradient-green">{children}</span>
);

/**
 * The two figures a reward carries — where the run stands, and what this gate
 * added. On the first gate they are the same number, because everything you hold
 * is what you just won, so they merge into one line instead of printing "72KB"
 * on the left and "+72KB" on the right. A run with history keeps them apart,
 * which is the only case where the pair says two things.
 */
const meterFigures = (
	total: number | undefined,
	gain: number,
	unit: string
): { total: string; suffix: string; gain?: string } =>
	total === undefined || total === gain
		? { total: `+${gain}${unit}`, suffix: " this gate" }
		: {
				total: `${total}${unit}`,
				suffix: "",
				gain: `+${gain}${unit} this gate`,
			};

/**
 * One reward as a meter: where the run now stands, what this gate added, a bar,
 * and what the bar is filling toward. Storage and coverage are the same kind of
 * thing — a running total this gate moved — so they get the same three lines,
 * and the caption is what stops a bar from being decoration: "of 512KB cap" and
 * the slot's unlock row are the only reason the fill means anything.
 */
const RewardMeter = ({
	total,
	label,
	gain,
	bar,
	caption,
}: {
	total: ReactNode;
	label: string;
	gain?: ReactNode;
	bar?: ReactNode;
	caption?: ReactNode;
}) => (
	<li className="flex flex-col gap-1">
		<div className="flex flex-wrap items-baseline justify-between gap-x-6">
			<Paragraph as="span" size="sm">
				<RewardValue>{total}</RewardValue> {label}
			</Paragraph>
			{gain ? (
				<Paragraph as="span" size="sm" tone="saffron" className="tabular-nums">
					{gain}
				</Paragraph>
			) : null}
		</div>
		{bar}
		{caption ? (
			<Paragraph as="span" size="xs" tone="faint">
				{caption}
			</Paragraph>
		) : null}
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
		"KB"
	);
	const coverageFigures = meterFigures(
		coverageBar?.toPct,
		totals?.coveragePct ?? 0,
		"%"
	);

	return (
		<div className="flex flex-col gap-3">
			<GateHeadline gateNumber={gateNumber} cleared={cleared} swatch={swatch} />

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
				// Only the cleared path passes totals, so this whole block is the gate's
				// payout — one reward per line, since three of them chained on a single
				// line read as a sentence rather than as a list of winnings. The heading
				// says "rewards", so no line needs to repeat "you won".
				<section className="flex flex-col gap-2 pt-8">
					<Title>Gate rewards</Title>
					<ul className="flex flex-col gap-4">
						<RewardMeter
							total={storageFigures.total}
							label={`storage${storageFigures.suffix}`}
							gain={storageFigures.gain}
							bar={
								storageBar ? (
									<GainBar
										from={storageBar.fromKb}
										to={storageBar.toKb}
										cap={storageBar.capKb}
										label="storage"
									/>
								) : undefined
							}
							caption={storageBar ? `of ${storageBar.capKb}KB cap` : undefined}
						/>
						<RewardMeter
							total={coverageFigures.total}
							label={`coverage${coverageFigures.suffix}`}
							gain={coverageFigures.gain}
							bar={
								slotRow ??
								(coverageBar ? (
									<GainBar
										from={coverageBar.fromPct}
										to={coverageBar.toPct}
										cap={coverageBar.targetPct}
										label={`coverage toward ${coverageBar.targetLabel}`}
									/>
								) : undefined)
							}
							caption={
								// A rung crossed *this* gate is news the row's own "unlocked"
								// pill cannot carry — the pill states a fact, this says it just
								// happened, and points at where to spend it.
								coverageBar?.reached ? (
									<Paragraph as="span" size="xs" tone="viridian">
										{coverageBar.targetLabel} unlocked this gate — claim it in
										the shop
									</Paragraph>
								) : slotRow ? undefined : coverageBar ? (
									`of ${coverageBar.targetPct}% for ${coverageBar.targetLabel}`
								) : undefined
							}
						/>
						{swatch ? (
							// Badge beside ladder, not above it: they are one fact — the pip
							// that just filled is the badge sitting next to it — and stacked
							// they read as two separate rewards. Wraps to two rows only when
							// the ladder can no longer sit alongside.
							<li className="flex flex-wrap items-center gap-x-6 gap-y-3">
								<div className="flex flex-wrap items-center gap-3">
									<EarnedSwatch swatch={swatch} />
									{swatchProgress ? (
										<Paragraph as="span" size="xs" tone="faint">
											earned · {swatchProgress.earned} of {swatchProgress.total}
										</Paragraph>
									) : null}
								</div>
								{climb ? (
									<div className="flex flex-col gap-1.5">
										{climb.ladder}
										<Paragraph as="span" size="xs" tone="faint">
											{climb.caption}
										</Paragraph>
									</div>
								) : null}
							</li>
						) : null}
					</ul>
					{breakdown ? (
						<>
							<hr className="mt-4 border-t border-zinc-800" />
							{breakdown}
						</>
					) : null}
				</section>
			) : null}
		</div>
	);
};
