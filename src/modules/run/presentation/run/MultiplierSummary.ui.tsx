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
	<div className="flex flex-wrap gap-8 rounded-r-xl border-l-4 border-viridian bg-linear-to-r from-viridian/10 to-transparent p-4">
		<StatBadge
			label="Reward multiplier"
			value={`×${rewardMultiplier}`}
			valueTone="gradient"
		/>
		<StatBadge
			label="Coverage multiplier"
			value={`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`}
			valueTone="gradient"
		/>
	</div>
);
