import { useState } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { pipelineModifiersFor } from "~/modules/run/pipeline/pipeline.model";
import {
	ALL_SWATCHES,
	swatchesEarnedAt,
} from "~/modules/run/gate/swatch.model";
import { Columns } from "~/ui/Columns.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { GateModifierStrip } from "../gate/GateModifierStrip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { nextSlotRow } from "../gate/SlotUnlockRow.ui";
import { SwatchChips } from "../gate/SwatchChips.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
	/** Gates banked, which names the swatches collected so far. */
	gatesCleared: number;
	bench: readonly Config[];
	checks: readonly CheckStatus[];
	gateReward: number;
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
	/** The run's total coverage — the locked slot's live unlock progress. */
	coverage?: number;
	/** Coverage the next slot demands (Infinity at the cap hides the row). */
	slotCoverageRequired?: number;
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
	bench,
	checks,
	gateReward,
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
	coverage,
	slotCoverageRequired,
	onSlot,
	onUnslot,
}: ConfiguringScreenProps) => {
	const [previewId, setPreviewId] = useState<string | null>(null);
	const full = configs.length >= slots;
	const rows = roleRows(configs, checks);
	const earnedSwatches = swatchesEarnedAt(gatesCleared);

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
								onMouseEnter={full ? undefined : () => setPreviewId(config.id)}
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
						trailing={nextSlotRow({ slots, coverage, slotCoverageRequired })}
					/>
					<GateModifierStrip
						current={{
							gateReward,
							rewardMultiplier,
							coverageMultiplier,
							coverageAdd,
						}}
						next={next}
					/>
					{/* A collection tally, not a gate modifier — so it stands apart. */}
					<div className="flex flex-col gap-2">
						<Subtitle as="p">
							Swatches {earnedSwatches.length} / {ALL_SWATCHES.length}
						</Subtitle>
						{earnedSwatches.length > 0 ? (
							<SwatchChips swatches={earnedSwatches} />
						) : (
							<Paragraph size="xs" tone="faint">
								Clear gates to earn your swatches: every gate carries one.
							</Paragraph>
						)}
					</div>
				</section>
			}
		/>
	);
};
