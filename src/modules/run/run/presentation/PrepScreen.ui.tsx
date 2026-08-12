import type { Config } from "~/modules/run/config/domain/config.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { Button } from "~/ui/Button.component";
import type { ScreenAction } from "~/ui/Screen.ui";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";

type PrepScreenProps = {
	gateNumber: number;
	pollsPerGate: number;
	stripsOnFailure: number;
	minConfigs: number;
	storageBillKb: number;
	modifiers: PipelineModifiers;
	perAnswer: PerAnswerPreview;
	configs: readonly Config[];
	startLock?: string;
	shopAction?: ScreenAction;
	onStartGate: () => void;
};

const PipelineChips = ({ configs }: Pick<PrepScreenProps, "configs">) => (
	<section className="flex flex-col gap-3 rounded border border-zinc-800 px-4 py-3">
		<Title as="h3">Your pipeline</Title>
		<div className="flex flex-wrap gap-2">
			{configs.map((config) => (
				<ConfigChip key={config.id} config={config} noTooltip />
			))}
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
	startLock,
	shopAction,
	onStartGate,
}: PrepScreenProps) => {
	const gateName = swatchForGate(gateNumber)?.gateName ?? `Gate ${gateNumber}`;
	return (
		<div className="flex flex-col gap-6">
			<PipelineChips configs={configs} />
			<GateStakeReceipt
				gateNumber={gateNumber}
				pollsPerGate={pollsPerGate}
				stripsOnFailure={stripsOnFailure}
				configCount={configs.length}
				modifiers={modifiers}
				perAnswer={perAnswer}
				billKb={storageBillKb}
				minConfigs={minConfigs}
				shopAction={shopAction}
			/>
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button
					className="flex-1"
					onClick={onStartGate}
					disabled={startLock !== undefined}
				>
					{startLock ?? `Start ${gateName} gate →`}
				</Button>
			</div>
		</div>
	);
};
