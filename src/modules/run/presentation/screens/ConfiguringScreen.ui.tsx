import { useState } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import {
	MAX_SLOTS,
	pipelineModifiersFor,
	type PipelineModifiers,
} from "~/modules/run/pipeline/pipeline.model";
import { Columns } from "~/ui/Columns.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateStakeReceipt } from "../gate/GateStakeReceipt.ui";
import { GateStakeSummary } from "../gate/GateStakeSummary.ui";
import { RoleList } from "../gate/RoleList.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	gatesCleared: number;
	pollsPerGate: number;
	/** Configs a failed window would peel at this depth (`dropCount`). */
	stripsOnFailure: number;
	modifiers: PipelineModifiers;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	onSlot: (configId: string) => void;
	onUnslot: (configId: string) => void;
};

// TODO(marciano): with the family headers gone, the bench needs an order.
// Chips color by rarity (not family), so the options read differently:
// roster order (stable), rarity-clustered (colors group), family-clustered
// (old grouping, minus headers). Implement your pick here.
const benchOrder = (bench: readonly Config[]): readonly Config[] => bench;

const RARITY_LEGEND: readonly Rarity[] = [
	"common",
	"uncommon",
	"rare",
	"legendary",
];

type PanelHeadingProps = {
	title: string;
	subtitle: string;
};

const PanelHeading = ({ title, subtitle }: PanelHeadingProps) => (
	<header>
		<Title>{title}</Title>
		<Subtitle>{subtitle}</Subtitle>
	</header>
);

export const ConfiguringScreen = ({
	configs,
	slots,
	gatesCleared,
	pollsPerGate,
	stripsOnFailure,
	modifiers,
	bench,
	checks,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const [previewId, setPreviewId] = useState<string | null>(null);
	const full = configs.length >= slots;
	const rows = roleRows(configs, checks);

	const previewConfig = full
		? undefined
		: bench.find((config) => config.id === previewId);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig])
		: undefined;

	const commit = (configId: string) => {
		onSlot(configId);
		setPreviewId(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<GateStakeSummary gateNumber={gatesCleared} pollsPerGate={pollsPerGate} />
			<Columns
				aside={
					<section className="space-y-2">
						<PanelHeading
							title="Starter configs"
							subtitle="Click a config to add it to your pipeline"
						/>
						<div className="flex flex-wrap gap-2">
							{benchOrder(bench).map((config) => (
								<span
									key={config.id}
									onMouseEnter={
										full ? undefined : () => setPreviewId(config.id)
									}
									onFocus={full ? undefined : () => setPreviewId(config.id)}
								>
									<ConfigChip
										config={config}
										noTooltip
										disabled={full}
										onClick={() => commit(config.id)}
									/>
								</span>
							))}
						</div>
						<div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
							{RARITY_LEGEND.map((rarity) => (
								<span
									key={rarity}
									className={clsx("text-xs", RARITY_COLORS[rarity].text)}
								>
									{rarity}
								</span>
							))}
						</div>
					</section>
				}
				main={
					<section className="flex flex-col gap-4">
						<PanelHeading
							title="Your pipeline"
							subtitle={`${configs.length} of ${slots} slots used`}
						/>
						<RoleList
							rows={rows}
							onRemove={onUnslot}
							slots={slots}
							preview={
								previewConfig
									? {
											config: previewConfig,
											onAdd: () => commit(previewConfig.id),
										}
									: undefined
							}
						/>
						{slots < MAX_SLOTS ? (
							<Paragraph size="xs" tone="faint">
								More slots will unlock when you gain coverage!
							</Paragraph>
						) : null}
						<GateStakeReceipt
							stripsOnFailure={stripsOnFailure}
							configCount={configs.length}
							modifiers={modifiers}
							preview={next}
						/>
					</section>
				}
			/>
		</div>
	);
};
