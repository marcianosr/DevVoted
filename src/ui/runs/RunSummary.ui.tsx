import { formatStorage } from "~/lib/storage";

export type RunSummaryData = {
	pollsAnswered: number;
	pollsCorrect: number;
	totalCoverage: number;
	bestStreak: number;
	/** Gates passed before the run ended. */
	gatesCleared: number;
	/** Pipeline checks this run ran against at the end. */
	pipelinesFought: number;
	shopRebuilds: number;
	/** Left-over storage this run banked into the persistent meta archive. */
	archivedCredit: number;
};

const formatPercentage = (value: number): string =>
	`${Math.round(value * 10) / 10}%`;

const SummaryStat = ({ label, value }: { label: string; value: string }) => (
	<div className="flex flex-col">
		<span className="text-sm text-zinc-400">{label}</span>
		<span className="text-xl">{value}</span>
	</div>
);

/**
 * The end-of-run stat block: how the run went at a glance — polls answered and
 * their correct/wrong split, coverage and best streak earned, how far the run
 * got (gates cleared, pipelines fought), shop rebuilds, and the storage banked
 * into the meta archive.
 */
export const RunSummary = ({ data }: { data: RunSummaryData }) => {
	const pollsWrong = data.pollsAnswered - data.pollsCorrect;

	return (
		<section className="flex flex-col gap-3">
			<h2 className="text-2xl">Run summary</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
				<SummaryStat
					label="Polls answered"
					value={String(data.pollsAnswered)}
				/>
				<SummaryStat
					label="Correct answers"
					value={String(data.pollsCorrect)}
				/>
				<SummaryStat label="Wrong answers" value={String(pollsWrong)} />
				<SummaryStat
					label="Total coverage"
					value={formatPercentage(data.totalCoverage)}
				/>
				<SummaryStat label="Best streak" value={`${data.bestStreak}×`} />
				<SummaryStat label="Gates cleared" value={String(data.gatesCleared)} />
				<SummaryStat
					label="Pipelines fought"
					value={String(data.pipelinesFought)}
				/>
				<SummaryStat label="Shop rebuilds" value={String(data.shopRebuilds)} />
				<SummaryStat
					label="Storage banked"
					value={`+${formatStorage(data.archivedCredit)}`}
				/>
			</div>
			<p className="text-sm text-zinc-400">
				Left-over storage is banked into your meta archive — spend it on a cool
				border on your next run!
			</p>
		</section>
	);
};
