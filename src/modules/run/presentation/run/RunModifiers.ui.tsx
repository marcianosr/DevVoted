import { Title } from "~/ui/typography/Title.component";
import { StatBadge } from "./StatBadge.ui";

type RunModifiersProps = {
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
};

type ModifierBoxProps = {
	label: string;
	value: string;
};

const ModifierBox = ({ label, value }: ModifierBoxProps) => (
	<div className="rounded-lg border border-viridian/30 bg-viridian/5 p-4 text-center">
		<StatBadge label={label} value={value} valueTone="gradient" />
	</div>
);

const coverageValue = (coverageMultiplier: number, coverageAdd: number) =>
	`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`;

export const RunModifiers = ({
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
}: RunModifiersProps) => (
	<div className="rounded-xl border border-zinc-700 p-4">
		<Title as="h3" size="sm">
			Run modifiers
		</Title>
		<div className="mt-3 grid grid-cols-2 gap-3">
			<ModifierBox label="Reward multiplier" value={`×${rewardMultiplier}`} />
			<ModifierBox
				label="Coverage multiplier"
				value={coverageValue(coverageMultiplier, coverageAdd)}
			/>
		</div>
	</div>
);
