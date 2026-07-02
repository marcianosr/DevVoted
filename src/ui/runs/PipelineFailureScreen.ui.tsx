import type { ReactNode } from "react";

import { formatStorage } from "~/lib/storage";
import { ConfigCard } from "~/ui/economy/ConfigCard.ui";
import type { Rarity } from "~/ui/rarityColors";

export type RunSummaryData = {
	pollsAnswered: number;
	pollsCorrect: number;
	totalCoverage: number;
	bestStreak: number;
	shopRebuilds: number;
	/** Left-over storage this run banked into the persistent meta archive. */
	archivedCredit: number;
};

export type InstalledConfig = {
	id: string;
	name: string;
	rarity: Rarity;
};

const formatPercentage = (value: number): string =>
	`${Math.round(value * 10) / 10}%`;

export type CategoryCoverageRow = {
	categoryCode: string;
	categoryName: string;
	coverage: number;
	bestStreak: number;
	pollsCorrect: number;
	pollsAnswered: number;
};

type PipelineFailureScreenProps = {
	pipelineSlot: ReactNode; // the pipeline layout (CurrentPipeline) with pass/fail status
	runSummary: RunSummaryData;
	categoryCoverage: CategoryCoverageRow[];
	installedConfigs: InstalledConfig[];
};

const SummaryStat = ({ label, value }: { label: string; value: string }) => (
	<div className="flex flex-col">
		<span className="text-sm text-zinc-400">{label}</span>
		<span className="text-xl">{value}</span>
	</div>
);

/**
 * Shown after a pipeline check fails and the run ends. Reuses the pipeline
 * layout to show every check's pass/fail outcome, plus the run summary and the
 * answer review.
 */
export const PipelineFailureScreen = ({
	pipelineSlot,
	runSummary,
	categoryCoverage,
	installedConfigs,
}: PipelineFailureScreenProps) => (
	<div className="flex flex-col gap-8 py-8">
		<header className="flex flex-col gap-1">
			<h1 className="text-4xl">Pipeline failed ✗</h1>
			<p className="text-zinc-300">
				Your pipeline didn&apos;t pass its checks. This run has ended.
			</p>
		</header>

		{pipelineSlot}

		<section className="flex flex-col gap-3">
			<h2 className="text-2xl">Run summary</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
				<SummaryStat
					label="Polls answered"
					value={String(runSummary.pollsAnswered)}
				/>
				<SummaryStat
					label="Correct answers"
					value={`${runSummary.pollsCorrect}/${runSummary.pollsAnswered}`}
				/>
				<SummaryStat
					label="Total coverage"
					value={formatPercentage(runSummary.totalCoverage)}
				/>
				<SummaryStat label="Best streak" value={`${runSummary.bestStreak}×`} />
				<SummaryStat
					label="Shop rebuilds"
					value={String(runSummary.shopRebuilds)}
				/>
				<SummaryStat
					label="Storage banked"
					value={`+${formatStorage(runSummary.archivedCredit)}`}
				/>
			</div>
			<p className="text-sm text-zinc-400">
				Left-over storage is banked into your meta archive — spend it on a cool
				border on your next run!
			</p>
		</section>

		{installedConfigs.length > 0 && (
			<section className="flex flex-col gap-3">
				<h2 className="text-2xl">Configs installed</h2>
				<ul className="flex flex-wrap gap-3">
					{installedConfigs.map((config) => (
						<li key={config.id}>
							<ConfigCard
								name={config.name}
								rarity={config.rarity}
								size="small"
							/>
						</li>
					))}
				</ul>
			</section>
		)}

		{categoryCoverage.length > 0 && (
			<section className="flex flex-col gap-3">
				<h2 className="text-2xl">Coverage per category</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{categoryCoverage.map((category) => (
						<div
							key={category.categoryCode}
							data-category-theme={category.categoryCode}
							className="flex flex-col gap-0.5 border border-theme px-3 py-2"
						>
							<div className="flex items-baseline justify-between">
								<span className="text-theme">{category.categoryName}</span>
								<span className="text-zinc-300">{category.coverage}%</span>
							</div>
							<div className="flex items-baseline justify-between text-sm text-zinc-400">
								<span>
									{category.pollsCorrect}/{category.pollsAnswered} correct
								</span>
								<span>best {category.bestStreak}×</span>
							</div>
						</div>
					))}
				</div>
			</section>
		)}
	</div>
);
