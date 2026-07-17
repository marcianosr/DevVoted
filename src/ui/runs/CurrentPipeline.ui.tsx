import type { ReactNode } from "react";

import { formatStorage } from "~/lib/storage";
import { PipelineProgressBar } from "~/ui/runs/PipelineProgressBar.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type PipelineCheckStatus =
	"in-progress" | "passed" | "failed" | "skipped";

export type PipelineCheckProgress = {
	previous: number;
	current: number;
	target: number;
	suffix: string;
	seen: boolean;
};

export type PipelineCheckRow = {
	label: string;
	/** Tailwind classes for the difficulty accent (text + border). */
	difficultyClassName: string;
	difficulty: string;
	requirement: string;
	reward: number;
	status: PipelineCheckStatus;
	/** Animated progress toward the requirement; omitted when no window context. */
	progress?: PipelineCheckProgress;
	/** Shown in red when the check can no longer pass — replaces the progress bar. */
	warning?: string;
};

type CurrentPipelineProps = {
	rows: PipelineCheckRow[];
	gate?: number;
	pollsLeft?: number;
	/** Sum of rewards shown as the "if all pass" line — before a gate is graded. */
	totalReward?: number;
	/** Reward banner shown after a passed gate. */
	clearedReward?: number;
	/** Group rows under status headers (after a gate is graded). */
	showGroupHeaders?: boolean;
};

const STAGGER_MS = 120;

const STATUS_ICON: Record<PipelineCheckStatus, ReactNode> = {
	"in-progress": (
		<span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
	),
	passed: <span className="text-green-400">✓</span>,
	failed: <span className="text-red-400">✗</span>,
	skipped: <span className="inline-block w-3 h-3 rounded-full bg-zinc-300" />,
};

const STATUS_GROUP_LABEL: Record<PipelineCheckStatus, string> = {
	"in-progress": "in progress",
	passed: "successful",
	failed: "failing",
	skipped: "skipped",
};

const STATUS_ORDER: PipelineCheckStatus[] = [
	"in-progress",
	"passed",
	"failed",
	"skipped",
];

const checkNoun = (count: number) => (count === 1 ? "check" : "checks");

const RewardBadge = ({ reward }: { reward: number }) => (
	<span className="text-emerald-400 text-xs whitespace-nowrap">
		+{formatStorage(reward)} storage
	</span>
);

const CheckGroupHeader = ({
	status,
	count,
}: {
	status: PipelineCheckStatus;
	count: number;
}) => (
	<div className="px-4 py-2 border-b border-white bg-white/5 flex items-center gap-2 text-sm text-gray-400">
		{STATUS_ICON[status]}
		<span>
			{count} {STATUS_GROUP_LABEL[status]} {checkNoun(count)}
		</span>
	</div>
);

const CheckRow = ({
	row,
	delayMs,
}: {
	row: PipelineCheckRow;
	delayMs: number;
}) => (
	<section className="flex items-start gap-3 border-b border-white px-4 py-3">
		<span className="mt-0.5 shrink-0">{STATUS_ICON[row.status]}</span>
		<div className="flex-1 min-w-0">
			<p className={row.difficultyClassName}>{row.label}</p>
			<p className="text-sm">
				<span className={row.difficultyClassName}>
					<span className="text-white">Risk:</span> {row.difficulty}
				</span>
				{" · "}
				<span className="text-white">Requirement:</span> {row.requirement}
				{" · "}
				<span className="text-white">Reward:</span>{" "}
				<RewardBadge reward={row.reward} />
			</p>
			{row.warning ? (
				<p className="mt-2 text-sm text-red-400">⚠ {row.warning}</p>
			) : (
				row.progress && (
					<PipelineProgressBar
						previous={row.progress.previous}
						current={row.progress.current}
						target={row.progress.target}
						suffix={row.progress.suffix}
						seen={row.progress.seen}
						delayMs={delayMs}
					/>
				)
			)}
		</div>
	</section>
);

/**
 * The "CI Pipelines" block: every active check with its risk, requirement,
 * reward and — when a window is in flight — an animated progress bar toward the
 * requirement. Once a gate is graded (`showGroupHeaders`), rows are grouped
 * under pass/fail/skip headers. This is the single home for per-check progress;
 * the score view above it only shows the coverage equation.
 */
export const CurrentPipeline = ({
	rows,
	gate,
	pollsLeft,
	totalReward,
	clearedReward,
	showGroupHeaders = false,
}: CurrentPipelineProps) => {
	const groups = STATUS_ORDER.map((status) => ({
		status,
		entries: rows.filter((row) => row.status === status),
	})).filter((group) => group.entries.length > 0);

	return (
		<div className="border border-white">
			<div className="border-b border-white px-4 py-3">
				<div className="flex items-baseline justify-between">
					<p className="text-2xl">CI Pipelines</p>
					{gate !== undefined && <span className="text-xl">Gate #{gate}</span>}
				</div>
				<p className="text-zinc-300 text-sm mt-0.5">
					{pollsLeft !== undefined && (
						<>
							<span>{pollsLeft} polls left until next gate check</span>
							{" · "}
						</>
					)}
					{rows.length} active {checkNoun(rows.length)} · all
					<span className="text-yellow-400"> pending</span> checks must pass
				</p>
				{totalReward !== undefined && totalReward > 0 && (
					<Paragraph>
						Total reward if all pass: <RewardBadge reward={totalReward} />
					</Paragraph>
				)}
			</div>

			{clearedReward !== undefined && clearedReward > 0 && (
				<div className="bg-emerald-950/40 border-b border-emerald-500/50 px-4 py-3">
					<p className="text-emerald-300 text-lg">
						✓ Pipeline cleared — +{formatStorage(clearedReward)} storage added
						to your limit
					</p>
				</div>
			)}

			{groups.map(({ status, entries }) => (
				<div key={status}>
					{showGroupHeaders && (
						<CheckGroupHeader status={status} count={entries.length} />
					)}
					{entries.map((row, index) => (
						<CheckRow
							key={`${row.label}-${index}`}
							row={row}
							delayMs={index * STAGGER_MS}
						/>
					))}
				</div>
			))}
		</div>
	);
};
