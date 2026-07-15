import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import {
	extraGateRequirements,
	roleRows,
	stakesRequirement,
} from "~/modules/session-run/gate/configRole.model";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RarityLegend } from "../configs/RarityLegend.ui";
import { RoleList } from "../gate/RoleList.ui";
import { RunStakes } from "../run/RunStakes.ui";
import { StepHeading } from "./StepHeading.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	victoryGate: number;
	gateReward: number;
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
};

export const ConfiguringScreen = ({
	configs,
	slots,
	bench,
	checks,
	victoryGate,
	gateReward,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const freeConfigs = configs.filter((config) => !config.fixed);
	const full = freeConfigs.length >= slots;
	const requirement = stakesRequirement(configs, checks);
	const extraRequirements = extraGateRequirements(configs, checks);
	const rows = roleRows(configs, checks);

	return (
		<div className="flex flex-col gap-10">
			<section className="space-y-4">
				<StepHeading
					step={1}
					title="Pick your stack"
					subtitle="Select your loadout from the starter config offers"
					tone="cerulean"
				/>
				<div className="flex flex-wrap gap-2">
					{bench.map((config) => (
						<ConfigChip
							key={config.id}
							config={config}
							action={full ? undefined : "＋"}
							onClick={full ? undefined : () => onSlot(config.id)}
						/>
					))}
				</div>
				<RarityLegend />
			</section>

			<section className="space-y-4">
				<StepHeading
					step={2}
					title="Review your build"
					subtitle="Your configured pipeline requirements and perks"
					tone="viridian"
				/>
				<RunStakes
					victoryGate={victoryGate}
					requirement={requirement.count}
					requirementLabel={requirement.label}
					extraRequirements={extraRequirements}
					gateReward={gateReward}
				/>
				<div className="space-y-2">
					<Title as="h3" size="md">
						Pipelines
					</Title>
					<RoleList rows={rows} onRemove={onUnslot} />
				</div>
			</section>
		</div>
	);
};
