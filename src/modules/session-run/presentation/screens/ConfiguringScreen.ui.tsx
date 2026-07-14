import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RarityLegend } from "../configs/RarityLegend.ui";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { Loadout } from "../pipeline/Loadout.ui";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	gateNumber: number;
	pollsToGate: number;
	gateReward: number;
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
};

export const ConfiguringScreen = ({
	configs,
	slots,
	bench,
	checks,
	gateNumber,
	pollsToGate,
	gateReward,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const freeConfigs = configs.filter((config) => !config.fixed);
	const full = freeConfigs.length >= slots;
	return (
		<div className="flex flex-col gap-6">
			<section className="space-y-4 mb-8">
				<header>
					<Title>Configure your pipeline</Title>
					<Subtitle>
						Select your loadout from the starter config offers
					</Subtitle>
				</header>
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
			<Loadout configs={configs} slots={slots} onRemove={onUnslot} />
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>
		</div>
	);
};
