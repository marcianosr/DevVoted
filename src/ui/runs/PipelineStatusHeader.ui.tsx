type PipelineStatusHeaderProps = {
	gate?: number;
	pollsLeft?: number;
};

const pollsLeftLabel = (pollsLeft: number) =>
	`${pollsLeft} poll${pollsLeft === 1 ? "" : "s"} left until gate check`;

/**
 * The /pipelines page header: names the screen, and surfaces the run's window
 * status — the active gate as a large accent beside the title, with the polls
 * remaining before it's graded as a muted subline. Hoisted out of the CI
 * Pipelines block so the window status reads once, at the top.
 */
export const PipelineStatusHeader = ({
	gate,
	pollsLeft,
}: PipelineStatusHeaderProps) => (
	<div className="flex items-end justify-between gap-4">
		<div>
			<h1 className="text-3xl">Pipeline status</h1>
			{pollsLeft !== undefined && (
				<p className="text-sm text-gray-400 mt-1">
					{pollsLeftLabel(pollsLeft)}
				</p>
			)}
		</div>
		{gate !== undefined && (
			<span className="text-4xl text-theme leading-none">Gate #{gate}</span>
		)}
	</div>
);
