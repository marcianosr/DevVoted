import {
	gateStepsSummary,
	type GateRewardKind,
	type GateRewardRow,
	type GateRewardStatus,
} from "~/modules/run/gate/gateReward.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { GainBar } from "~/ui/runs/GainBar.ui";
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
	/**
	 * Present when the clear passed but the climb stays on this gate: the
	 * pipeline is too narrow for the next one (ADR-018). A third headline state —
	 * the clear was real and paid, so "failed" would lie, but so would implying
	 * the next gate is next. Carries the one claim that releases it.
	 */
	held?: { nextGate: number; unlockSlot: number; swatchName: string };
	rows: readonly GateRewardRow[];
	totals?: { storageKb: number; coveragePct: number };
	/** Run storage before → after the payout — drawn as the HUD bar's sibling
	 * under the winnings line. */
	storageBar?: { fromKb: number; toKb: number; capKb: number };
	removableConfigIds?: readonly string[];
	onRemoveConfig?: (configId: string) => void;
	stripsRemaining?: number;
};

// A held clear keeps the PASS badge — the gate genuinely passed and paid; it is
// the *climb* that stopped, which the title and the saffron line below carry.
const headline = (
	gateNumber: number,
	cleared: boolean,
	held: boolean
): { variant: StatusBadgeVariant; title: string } => {
	if (!cleared) return { variant: "fail", title: `Gate ${gateNumber} failed!` };
	if (held)
		return {
			variant: "pass",
			title: `Gate ${gateNumber} cleared — still gate ${gateNumber}`,
		};
	return { variant: "pass", title: `Gate ${gateNumber} cleared!` };
};

export const GateRewardReport = ({
	gateNumber,
	cleared,
	held,
	rows,
	totals,
	storageBar,
	removableConfigIds = [],
	onRemoveConfig,
	stripsRemaining,
}: GateRewardReportProps) => {
	const { variant, title } = headline(gateNumber, cleared, held !== undefined);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3 ">
				<StatusBadge variant={variant} />
				<Title>{title}</Title>
			</div>

			{cleared && held && (
				<Paragraph size="sm" tone="saffron">
					Gate {held.nextGate} needs a wider pipeline, so you&apos;ll run gate{" "}
					{gateNumber} again. Unlock slot {held.unlockSlot} in the shop — the{" "}
					{held.swatchName} — to climb on.
				</Paragraph>
			)}

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
