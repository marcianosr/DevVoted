import type { Config } from "~/modules/session-run/configs/config.model";
import { GradientText } from "~/ui/typography/GradientText.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { Pipeline } from "./Pipeline.ui";

type LoadoutProps = {
	configs: readonly Config[];
	slots: number;
	/** When set, the heading names the gate this load-out is heading into. */
	gateNumber?: number;
	gateReward?: number;
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
};

export const Loadout = ({
	configs,
	slots,
	gateNumber,
	gateReward,
	newConfigIds,
	onRemove,
}: LoadoutProps) => (
	<section className="flex flex-col gap-2">
		<header>
			<Title as="h2" size="md">
				Your load-out{gateNumber !== undefined ? ` for gate ${gateNumber}` : ""}
			</Title>
			{gateReward !== undefined ? (
				<Subtitle>
					Clears for <GradientText>{gateReward}KB</GradientText> — heavier
					requirements pay more, easier builds pay less
				</Subtitle>
			) : (
				<Subtitle>Your configured pipeline requirements and perks</Subtitle>
			)}
		</header>
		<Pipeline
			configs={configs}
			slots={slots}
			newConfigIds={newConfigIds}
			onRemove={onRemove}
		/>
	</section>
);
