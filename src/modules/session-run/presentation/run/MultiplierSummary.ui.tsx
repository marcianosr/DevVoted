import { StatBadge } from "./StatBadge.ui";

type MultiplierSummaryProps = {
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
};

export const MultiplierSummary = ({
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
}: MultiplierSummaryProps) => (
	<div className="flex flex-wrap gap-8">
		<StatBadge
			label="Reward multiplier"
			value={`×${rewardMultiplier}`}
			valueTone="gradient"
		/>
		<StatBadge
			label="Coverage multiplier"
			value={`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`}
		/>
	</div>
);
