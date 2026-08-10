import type { Config } from "~/modules/run/configs/config.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { Button } from "~/ui/Button.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateStakeReceipt } from "../gate/GateStakeReceipt.ui";

type PrepScreenProps = {
	/** 0-indexed, same source as the HUD and `swatchForGate`. */
	gateNumber: number;
	pollsPerGate: number;
	/** Configs a failed window would peel at this depth (`dropCount`). */
	stripsOnFailure: number;
	/** The storage plan's recurring bill, owed when this window closes — 0 on the free tier. */
	storageBillKb: number;
	modifiers: PipelineModifiers;
	configs: readonly Config[];
	/** Reveals each chip's remove affordance. */
	editing: boolean;
	onDropConfig: (configId: string) => void;
	onEditPipeline: () => void;
	onStartGate: () => void;
};

const PipelineChips = ({
	configs,
	editing,
	onDropConfig,
}: Pick<PrepScreenProps, "configs" | "editing" | "onDropConfig">) => (
	<section className="flex flex-col gap-3 rounded border border-zinc-800 px-4 py-3">
		<Title as="h3">Your pipeline</Title>
		<div className="flex flex-wrap gap-2">
			{configs.map((config) => {
				// The last config can never actually drop (holdsLastConfig), so it
				// stays non-interactive in edit mode too rather than offering a dead click.
				const removable = editing && configs.length > 1;
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
	storageBillKb,
	modifiers,
	configs,
	editing,
	onDropConfig,
	onEditPipeline,
	onStartGate,
}: PrepScreenProps) => {
	const gateName = swatchForGate(gateNumber)?.gateName ?? `Gate ${gateNumber}`;
	return (
		<div className="flex flex-col gap-6">
			<PipelineChips
				configs={configs}
				editing={editing}
				onDropConfig={onDropConfig}
			/>
			<GateStakeReceipt
				gateNumber={gateNumber}
				pollsPerGate={pollsPerGate}
				stripsOnFailure={stripsOnFailure}
				configCount={configs.length}
				modifiers={modifiers}
				billKb={storageBillKb}
			/>
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button variant="neutral" className="flex-1" onClick={onEditPipeline}>
					{editing ? "Done editing" : "Edit pipeline"}
				</Button>
				<Button className="flex-1" onClick={onStartGate}>
					Start {gateName} gate →
				</Button>
			</div>
		</div>
	);
};
