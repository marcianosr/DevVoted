import type { ThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { formatGateRequirements } from "~/domains/runs/utils/gateFormatters";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { POLLS_PER_ROUND } from "~/domains/runs/services/thresholdCalculator.service";

type CiGatePanelProps = {
	thresholdInfo: ThresholdInfo;
	categoryCoverage: readonly RunCategoryCoverage[];
};

export const CiGatePanel = ({
	thresholdInfo,
	categoryCoverage,
}: CiGatePanelProps) => {
	const {
		isThresholdCheckPoll,
		meetsThreshold,
		gateDefinition,
		pollInRound,
	} = thresholdInfo;

	if (!gateDefinition) {
		return null;
	}

	const pollsUntilCheck = POLLS_PER_ROUND - pollInRound;
	const requirementText = formatGateRequirements(gateDefinition);

	const isInProgress = !isThresholdCheckPoll;
	const isPassed = isThresholdCheckPoll && meetsThreshold;

	const threshold = gateDefinition.requirements[0]?.threshold ?? 0;

	// Get status message for completed gates
	const getCompletedMessage = () => {
		if (isPassed) {
			const qualifyingCount = categoryCoverage.filter(
				(cat) => cat.currentCoverage >= threshold
			).length;
			return `${qualifyingCount} ${qualifyingCount === 1 ? "category" : "categories"} met ${requirementText}`;
		}

		// Failed - find closest category
		const closestCategory = [...categoryCoverage].sort(
			(a, b) => b.currentCoverage - a.currentCoverage
		)[0];
		if (closestCategory) {
			const gap = threshold - closestCategory.currentCoverage;
			return `Needed +${gap.toFixed(1)}% in any category`;
		}
		return `Did not meet ${requirementText}`;
	};

	// Compact display for completed gates
	if (!isInProgress) {
		return (
			<section className="border border-zinc-700/50 p-3 bg-zinc-900/20 mb-4">
				<p className="text-sm">
					🎯{" "}
					<span className="font-semibold">
						Gate #{gateDefinition.gate}
					</span>
					:{" "}
					<span
						className={isPassed ? "text-green-400" : "text-red-400"}
					>
						{isPassed ? "✅ Passed" : "❌ Failed"}
					</span>{" "}
					<span className="text-zinc-400">
						- {getCompletedMessage()}
					</span>
				</p>
			</section>
		);
	}

	// Full display for in-progress gates
	return (
		<section className="border border-zinc-700/50 p-4 bg-zinc-900/20 mb-4">
			<header className="mb-4 border-b-1 border-zinc-900 pb-4">
				<h3 className="text-3xl font-semibold mb-1">
					🎯 CI Gate #{gateDefinition.gate}
				</h3>
				<p className="text-md text-zinc-300 mt-1">
					Requirement: {requirementText}
				</p>
			</header>

			<div className="mb-4">
				<h4 className="text-sm font-medium mb-2 text-zinc-300">
					Category coverage:
				</h4>
				<ul className="space-y-1 text-sm">
					{categoryCoverage.map((cat) => {
						const meetsRequirement =
							cat.currentCoverage >= threshold;
						const categoryName =
							CATEGORY_METADATA[cat.categoryCode].name;
						return (
							<li
								key={cat.categoryCode}
								className={
									meetsRequirement
										? "text-green-400"
										: "text-red-400"
								}
							>
								• {categoryName}: {cat.currentCoverage}%
							</li>
						);
					})}
				</ul>
			</div>

			<div className="border-t border-zinc-700/50 pt-3">
				<p className="text-sm flex flex-col">
					<span className="text-yellow-400">
						Gate status: ⏳ In progress
					</span>
					<span>
						{pollsUntilCheck}{" "}
						{pollsUntilCheck === 1 ? "poll" : "polls"} left to play
						until CI build is ready
					</span>
				</p>
			</div>
		</section>
	);
};
