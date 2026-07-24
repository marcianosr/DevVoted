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
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { PipelineReportRow } from "./PipelineReportRow.ui";

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
	<PipelineReportRow
		badge={STATUS_VARIANT[row.status]}
		config={row.config}
		description={row.description}
		descriptionTone={row.status === "failed" ? "cinnabar" : "muted"}
		value={row.value}
		valueTone={valueTone(row)}
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
			<StatusBadge variant={cleared ? "pass" : "fail"} />
			<Title size="sm">Gate {gateNumber} cleared!</Title>
		</div>

		<section>
			<Subtitle>Pipeline summary</Subtitle>
			<StepsSummary rows={rows} />
		</section>

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
