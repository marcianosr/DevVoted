import type { Config } from "~/modules/session-run/configs/config.model";
import { Title } from "~/ui/typography/Title.component";
import { ConfigRow } from "../configs/ConfigRow.ui";
import { RarityLegend } from "../configs/RarityLegend.ui";
import { BuildSummary } from "../gate/BuildSummary.ui";
import { Pipeline } from "../pipeline/Pipeline.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	bench: readonly Config[];
	demands: readonly string[];
	rewardMultiplier: number;
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
	onStart: () => void;
};

export const ConfiguringScreen = ({
	configs,
	slots,
	bench,
	demands,
	rewardMultiplier,
	onSlot,
	onUnslot,
	onStart,
}: ConfiguringScreenProps) => {
	const full = configs.length >= slots;
	return (
		<div className="flex flex-col gap-6">
			<Title>Configure your pipeline</Title>
			<Pipeline configs={configs} slots={slots} onRemove={onUnslot} />
			<BuildSummary demands={demands} rewardMultiplier={rewardMultiplier} />
			<RarityLegend />
			<div className="flex flex-col gap-2">
				{bench.map((config) => (
					<ConfigRow
						key={config.id}
						config={config}
						action={full ? undefined : "＋"}
						onClick={full ? undefined : () => onSlot(config.id)}
					/>
				))}
			</div>
			<button
				type="button"
				onClick={onStart}
				className="self-start rounded-lg bg-cerulean px-6 py-3 font-bold text-black transition hover:brightness-110"
			>
				Start the climb →
			</button>
		</div>
	);
};
