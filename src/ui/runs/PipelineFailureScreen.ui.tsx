import { PrimaryButton } from "~/ui/PrimaryButton.component";

export type FailedSlotSummary = {
	label: string; // e.g. "Correct Answers · high"
	requirement: string; // human-readable requirement text
};

type PipelineFailureScreenProps = {
	failedSlots: FailedSlotSummary[];
	onStartNewRun: () => void;
	onViewSummary: () => void;
};

/**
 * Shown after a pipeline check fails and the run ends. Explains which gate
 * requirements were not met and routes onward to a new run or summary.
 */
export const PipelineFailureScreen = ({
	failedSlots,
	onStartNewRun,
	onViewSummary,
}: PipelineFailureScreenProps) => (
	<div className="flex flex-col gap-8 py-8">
		<header className="flex flex-col gap-1">
			<h1 className="text-4xl">Pipeline failed ✗</h1>
			<p className="text-gray-300">
				Your pipeline didn&apos;t pass its checks. This run has ended.
			</p>
		</header>

		<section className="flex flex-col gap-3">
			<h2 className="text-2xl">What broke the build</h2>
			{failedSlots.length === 0 ? (
				<p className="text-gray-400">No failing requirements recorded.</p>
			) : (
				<ul className="flex flex-col gap-1">
					{failedSlots.map((slot) => (
						<li key={slot.label} className="text-red-400">
							✗ {slot.label} — {slot.requirement}
						</li>
					))}
				</ul>
			)}
		</section>

		<div className="flex gap-4">
			<PrimaryButton onClick={onStartNewRun} className="px-6 py-3">
				Start new run →
			</PrimaryButton>
			<PrimaryButton onClick={onViewSummary} className="px-6 py-3">
				View run summary
			</PrimaryButton>
		</div>
	</div>
);
