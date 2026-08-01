import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { RunModifiers } from "../run/RunModifiers.ui";
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
	const full = configs.length >= slots;
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
				<div className="grid gap-4 lg:grid-cols-2">
					<RunStakes gateReward={gateReward} />
					<RunModifiers
						rewardMultiplier={rewardMultiplier}
						coverageMultiplier={coverageMultiplier}
						coverageAdd={coverageAdd}
					/>
				</div>
				<Paragraph size="xs" tone="muted">
					Rules and modifiers update as you select configs.
				</Paragraph>
				<div className="space-y-2">
					<Title as="h3" size="sm">
						Pipelines
					</Title>
					<RoleList rows={rows} onRemove={onUnslot} slots={slots} />
				</div>
			</section>
		</div>
	);
};
