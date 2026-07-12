import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RarityLegend } from "../configs/RarityLegend.ui";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { Pipeline } from "../pipeline/Pipeline.ui";

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
	onStart: () => void;
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
	onStart,
}: ConfiguringScreenProps) => {
	const full = configs.length >= slots;
	return (
		<div className="flex flex-col gap-6">
			<Title>Configure your pipeline</Title>
			<Pipeline configs={configs} slots={slots} onRemove={onUnslot} />
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>
			<RarityLegend />
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
			<button
				type="button"
				onClick={onStart}
				disabled={configs.length === 0}
				className="cursor-pointer self-start rounded-lg bg-cerulean px-6 py-3 font-bold text-black transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
			>
				{configs.length === 0 ? "Slot a config to start" : "Start the climb →"}
			</button>
		</div>
	);
};
