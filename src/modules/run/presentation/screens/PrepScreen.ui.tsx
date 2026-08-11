import type { Config } from "~/modules/run/configs/config.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/pipeline.model";
import { Button } from "~/ui/Button.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateStakeReceipt } from "../gate/GateStakeReceipt.ui";

type PrepScreenProps = {
	gateNumber: number;
	pollsPerGate: number;
	stripsOnFailure: number;
	minConfigs: number;
	storageBillKb: number;
	modifiers: PipelineModifiers;
	perAnswer: PerAnswerPreview;
	configs: readonly Config[];
	editing: boolean;
	onDropConfig: (configId: string) => void;
	onEditPipeline: () => void;
	onStartGate: () => void;
};

const PipelineChips = ({
	configs,
	minConfigs,
	editing,
	onDropConfig,
}: Pick<
	PrepScreenProps,
	"configs" | "minConfigs" | "editing" | "onDropConfig"
>) => (
	<section className="flex flex-col gap-3 rounded border border-zinc-800 px-4 py-3">
		<Title as="h3">Your pipeline</Title>
		<div className="flex flex-wrap gap-2">
			{configs.map((config) => {
				const removable = editing && configs.length > Math.max(1, minConfigs);
				return (
					<ConfigChip
						key={config.id}
						config={config}
						noTooltip
						action={removable ? "✕" : undefined}
						onClick={removable ? () => onDropConfig(config.id) : undefined}
					/>
				);
			})}
		</div>
	</section>
);

export const PrepScreen = ({
	gateNumber,
	pollsPerGate,
	stripsOnFailure,
	minConfigs,
	storageBillKb,
	modifiers,
	perAnswer,
	configs,
	editing,
	onDropConfig,
	onStartGate,
}: PrepScreenProps) => {
	const gateName = swatchForGate(gateNumber)?.gateName ?? `Gate ${gateNumber}`;
	return (
		<div className="flex flex-col gap-6">
			<PipelineChips
				configs={configs}
				minConfigs={minConfigs}
				editing={editing}
				onDropConfig={onDropConfig}
			/>
			<GateStakeReceipt
				gateNumber={gateNumber}
				pollsPerGate={pollsPerGate}
				stripsOnFailure={stripsOnFailure}
				configCount={configs.length}
				modifiers={modifiers}
				perAnswer={perAnswer}
				billKb={storageBillKb}
				minConfigs={minConfigs}
			/>
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button className="flex-1" onClick={onStartGate}>
					Start {gateName} gate →
				</Button>
			</div>
		</div>
	);
};
