import {
	gateStepsSummary,
	type GateRewardKind,
	type GateRewardRow,
	type GateRewardStatus,
} from "~/modules/run/gate/gateReward.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

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

const ReportRow = ({ row }: { row: GateRewardRow }) => (
	<div className="flex items-start gap-3 py-1">
		<span className="shrink-0">
			<StatusBadge variant={STATUS_VARIANT[row.status]} />
		</span>
		<span className="shrink-0">
			<ConfigChip config={row.config} noTooltip />
		</span>
		<Paragraph
			as="span"
			size="sm"
			tone={row.status === "failed" ? "cinnabar" : "muted"}
			className="min-w-0 flex-1"
		>
			{row.description}
		</Paragraph>
		<Paragraph
			as="span"
			size="sm"
			tone={valueTone(row)}
			className="shrink-0 text-right font-bold tabular-nums"
		>
			{row.value}
		</Paragraph>
	</div>
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
			<Paragraph as="span" size="sm" tone="pewter">
				Steps
			</Paragraph>
			{parts.map((part, index) => (
				<span key={part.key} className="flex gap-2">
					{index > 0 ? <span className="text-pewter">,</span> : null}
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
	rows: readonly GateRewardRow[];
	totals?: { storageKb: number; coveragePct: number };
};

export const GateRewardReport = ({
	gateNumber,
	cleared,
	rows,
	totals,
}: GateRewardReportProps) => (
	<div className="flex flex-col gap-3">
		<Title as="h2" tone={cleared ? "gradient" : "cinnabar"}>
			{cleared ? "Build pass!" : "Build fail!"}
		</Title>

		<div className="flex items-center gap-3 ">
			<Paragraph as="span" className="font-bold">
				gate-{gateNumber}
			</Paragraph>
			<StatusBadge variant={cleared ? "pass" : "fail"} />
		</div>

		<StepsSummary rows={rows} />

		<div>
			{rows.map((row) => (
				<ReportRow key={row.key} row={row} />
			))}
		</div>

		{totals ? (
			<Paragraph size="sm" className="self-center">
				<span className="font-extrabold text-gradient-green">
					+{totals.storageKb}KB
				</span>{" "}
				storage ·{" "}
				<span className="font-extrabold text-gradient-green">
					+{totals.coveragePct}%
				</span>{" "}
				coverage
			</Paragraph>
		) : null}
	</div>
);
