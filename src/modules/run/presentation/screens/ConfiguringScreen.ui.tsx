import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { Pipeline } from "../pipeline/Pipeline.ui";
import { MultiplierSummary } from "../run/MultiplierSummary.ui";
import { RunStakes } from "../run/RunStakes.ui";
import { StepHeading } from "./StepHeading.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	gateReward: number;
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
};

export const ConfiguringScreen = ({
	configs,
	slots,
	bench,
	checks,
	gateReward,
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const freeConfigs = configs.filter((config) => !config.fixed);
	const full = freeConfigs.length >= slots;
	const rows = roleRows(configs, checks);

	return (
		<div className="flex flex-col gap-10">
			<section className="space-y-4">
				<StepHeading
					step={1}
					title="Pick your config stack"
					subtitle="Enrich your pipeline with these offered starter configs"
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
			</section>

			<section className="space-y-4">
				<StepHeading
					step={2}
					title="Review your build"
					subtitle="Your configured pipeline requirements and perks"
					tone="viridian"
				/>
				<RunStakes gateReward={gateReward} />
				<MultiplierSummary
					rewardMultiplier={rewardMultiplier}
					coverageMultiplier={coverageMultiplier}
					coverageAdd={coverageAdd}
				/>
				<div className="space-y-2">
					<Title as="h3" size="sm">
						Pipelines
					</Title>
					<Pipeline configs={configs} slots={slots} onRemove={onUnslot} />
					<RoleList rows={rows} onRemove={onUnslot} />
				</div>
			</section>
		</div>
	);
};
