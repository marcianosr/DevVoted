import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";
import { getCategoryMetadata } from "~/domains/shared/categories";

type GateProgressIndicatorProps = {
	gate: GateDefinition;
	categoryCoverage: RunCategoryCoverage[];
	victoryAchievedAt?: Date | null;
};

const GateProgressIndicator = ({
	gate,
	categoryCoverage,
	victoryAchievedAt,
}: GateProgressIndicatorProps) => {
	// Post-victory mode: show completion status instead of next gate requirements
	if (victoryAchievedAt) {
		const totalCoverage = categoryCoverage.reduce(
			(sum, cat) => sum + cat.currentCoverage,
			0
		);

		return (
			<div className="text-right">
				<p className="text-green-400 text-xl font-bold">All Gates Complete!</p>
				<p className="text-gray-300 text-sm">
					Total coverage: {totalCoverage.toFixed(1)}%
				</p>
				<p className="text-gray-400 text-xs">Post-victory mode</p>
			</div>
		);
	}

	const sortedCategories = [...categoryCoverage].sort(
		(a, b) => b.currentCoverage - a.currentCoverage
	);

	const requirementsMet = gate.requirements.filter((requirement) => {
		const topCategories = sortedCategories.slice(
			0,
			requirement.requiredCategories
		);
		return topCategories.every(
			(category) => category.currentCoverage >= requirement.threshold
		);
	});

	const metCount = requirementsMet.length;
	const totalCount = gate.requirements.length;
	const allMet = metCount === totalCount;
	const showProgress = gate.evaluationMode === "AND" && totalCount > 1;

	return (
		<details>
			<summary className="text-lg">
				<span className="text-xl text-theme">
					Gate: #{gate.gate}{" "}
					{allMet ? (
						<span className="text-green-400 text-2xl">✓</span>
					) : (
						<span className="text-red-400 text-2xl">✗</span>
					)}
				</span>
				{showProgress && (
					<span className="ml-2 text-base">
						({metCount}/{totalCount})
					</span>
				)}
			</summary>
			<ul className="flex gap-4">
				{gate.requirements.map((requirement, index) => {
					const displayCount = requirement.requiredCategories;

					const topCategories = sortedCategories.slice(0, displayCount);

					return (
						<li key={index} className="mb-2">
							<div>
								<strong className="underline">
									{requirement.threshold}% in {requirement.requiredCategories}{" "}
									categories
								</strong>
								{topCategories.map((category) => {
									const { name } = getCategoryMetadata(category.categoryCode);

									return (
										<div key={category.categoryCode} className="mb-1">
											<span>{name}</span>
											<div className="flex gap-2 items-center">
												<span>0</span>
												<meter
													min="0"
													max={requirement.threshold}
													value={category.currentCoverage}
												></meter>
												<span>{requirement.threshold}%</span>
											</div>
										</div>
									);
								})}
							</div>
						</li>
					);
				})}
			</ul>
		</details>
	);
};

export { GateProgressIndicator };
