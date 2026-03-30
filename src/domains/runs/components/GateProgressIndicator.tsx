import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import {
	GateDefinition,
	GateRequirement,
} from "~/domains/runs/services/thresholdCalculator.service";
import { getCategoryMetadata } from "~/domains/shared/categories";

type GateProgressIndicatorProps = {
	gate: GateDefinition;
	categoryCoverage: RunCategoryCoverage[];
	correctPollsCount: number;
	victoryAchievedAt?: Date | null;
};

const isCoverageRequirementMet = (
	req: Extract<GateRequirement, { type: "coverage" }>,
	categoryCoverage: RunCategoryCoverage[]
): boolean => {
	const sorted = [...categoryCoverage].sort(
		(a, b) => b.currentCoverage - a.currentCoverage
	);
	return sorted
		.slice(0, req.requiredCategories)
		.every((cat) => cat.currentCoverage >= req.threshold);
};

const GateProgressIndicator = ({
	gate,
	categoryCoverage,
	correctPollsCount,
	victoryAchievedAt,
}: GateProgressIndicatorProps) => {
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

	const requirementsMet = gate.requirements.filter((req) => {
		if (req.type === "coverage") {
			return isCoverageRequirementMet(req, categoryCoverage);
		}
		if (req.type === "correct-answers") {
			return correctPollsCount >= req.count;
		}
		return false;
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
				{gate.requirements.map((requirement, index) => (
					<li key={index} className="mb-2">
						{requirement.type === "coverage" ? (
							<CoverageRequirementDisplay
								requirement={requirement}
								sortedCategories={sortedCategories}
							/>
						) : (
							<CorrectAnswersRequirementDisplay
								requirement={requirement}
								correctPollsCount={correctPollsCount}
							/>
						)}
					</li>
				))}
			</ul>
		</details>
	);
};

type CoverageRequirementDisplayProps = {
	requirement: Extract<GateRequirement, { type: "coverage" }>;
	sortedCategories: RunCategoryCoverage[];
};

const CoverageRequirementDisplay = ({
	requirement,
	sortedCategories,
}: CoverageRequirementDisplayProps) => {
	const topCategories = sortedCategories.slice(
		0,
		requirement.requiredCategories
	);

	return (
		<div>
			<strong className="underline">
				{requirement.threshold}% in {requirement.requiredCategories} categories
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
	);
};

type CorrectAnswersRequirementDisplayProps = {
	requirement: Extract<GateRequirement, { type: "correct-answers" }>;
	correctPollsCount: number;
};

const CorrectAnswersRequirementDisplay = ({
	requirement,
	correctPollsCount,
}: CorrectAnswersRequirementDisplayProps) => {
	const met = correctPollsCount >= requirement.count;

	return (
		<div>
			<strong className="underline">
				Answer {requirement.count} polls correctly
			</strong>
			<div className="flex gap-2 items-center">
				<span className={met ? "text-green-400" : "text-gray-300"}>
					{correctPollsCount} / {requirement.count}
				</span>
			</div>
		</div>
	);
};

export { GateProgressIndicator };
