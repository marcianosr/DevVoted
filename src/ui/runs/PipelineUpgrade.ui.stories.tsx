import type { Meta, StoryObj } from "@storybook/react";
import { CurrentPipelineUI, PipelineUpgradeUI } from "./PipelineUpgrade.ui";

// — CurrentPipelineUI —

const currentPipelineMeta: Meta<typeof CurrentPipelineUI> = {
	component: CurrentPipelineUI,
	title: "Runs/Organisms/Current Pipeline",
	decorators: [
		(Story) => (
			<div className="max-w-xl p-4">
				<Story />
			</div>
		),
	],
};
export default currentPipelineMeta;

type CurrentStory = StoryObj<typeof CurrentPipelineUI>;

const inProgressSlots = [
	{
		id: "coverage-1",
		status: "in-progress" as const,
		label: "Coverage Gain Pipeline",
		difficulty: "medium" as const,
		requirement: "Gain 2% coverage",
		reward: "+64 KB",
		currentStat: "+1.4% of 2% needed",
	},
	{
		id: "correct-1",
		status: "in-progress" as const,
		label: "Correct Answer Pipeline",
		difficulty: "low" as const,
		requirement: "3/5 correct",
		reward: "+32 KB",
		currentStat: "2/3 correct",
	},
];

export const LiveView: CurrentStory = {
	args: {
		gateNumber: 3,
		pollsLeft: 2,
		totalPotentialReward: "+96 KB",
		slots: inProgressSlots,
	},
};

export const EvaluationPassed: CurrentStory = {
	args: {
		gateNumber: 3,
		slots: [
			{ ...inProgressSlots[0], status: "passed" },
			{ ...inProgressSlots[1], status: "passed" },
		],
		evaluation: { passed: true, totalReward: "+96 KB" },
	},
};

export const EvaluationFailed: CurrentStory = {
	args: {
		gateNumber: 5,
		slots: [
			{ ...inProgressSlots[0], status: "passed" },
			{
				id: "mastery-1",
				status: "failed" as const,
				label: "Category Mastery Pipeline",
				difficulty: "critical" as const,
				requirement: "All Banjo-Kazooie polls correct",
				reward: "+256 KB",
			},
		],
		evaluation: { passed: false, totalReward: "+0 KB" },
	},
};

export const WithSkipped: CurrentStory = {
	args: {
		gateNumber: 7,
		slots: [
			{ ...inProgressSlots[0], status: "passed" },
			{
				id: "mastery-1",
				status: "skipped" as const,
				label: "Category Mastery Pipeline",
				difficulty: "critical" as const,
				requirement: "All Pokémon polls correct",
				reward: "+128 KB",
			},
		],
		evaluation: { passed: true, totalReward: "+64 KB" },
	},
};

// — PipelineUpgradeUI (separate export via named export trick) —

export const UpgradeView: StoryObj<typeof PipelineUpgradeUI> = {
	render: () => (
		<div className="max-w-2xl p-4">
			<PipelineUpgradeUI
				isPending={false}
				pipelineSection={
					<CurrentPipelineUI
						gateNumber={3}
						pollsLeft={0}
						slots={[
							{ ...inProgressSlots[0], status: "passed" },
							{ ...inProgressSlots[1], status: "passed" },
						]}
						evaluation={{ passed: true, totalReward: "+96 KB" }}
					/>
				}
				upgradeCards={[
					{
						kind: "upgrade-slot",
						label: "Coverage Gain Pipeline",
						difficulty: "medium",
						upgradeTo: "high",
						requirement: "Gain 3% coverage",
						reward: "+128 KB",
						onSelect: () => {},
					},
				]}
				addSlotCards={[
					{
						kind: "add-slot",
						label: "Cold Start Pipeline",
						difficulty: "high",
						requirement: "First poll correct",
						reward: "+96 KB",
						onSelect: () => {},
					},
				]}
			/>
		</div>
	),
};
