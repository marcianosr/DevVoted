import { GradientText } from "~/ui/typography/GradientText.component";
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
			value={<GradientText>×{rewardMultiplier}</GradientText>}
		/>
		<StatBadge
			label="Coverage multiplier"
			value={`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`}
		/>
	</div>
);
