import { useState } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { pipelineModifiersFor } from "~/modules/run/pipeline/pipeline.model";
import {
	ALL_SWATCHES,
	swatchesEarnedAt,
} from "~/modules/run/pipeline/swatch.model";
import { Columns } from "~/ui/Columns.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { nextSwatchRow } from "../gate/SlotSwatchRow.ui";
import { SwatchChips } from "../gate/SwatchChips.ui";
import { StatBadge } from "../run/StatBadge.ui";

type ConfiguringScreenProps = {
	configs: readonly Config[];
	slots: number;
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

const coverageValue = (coverageMultiplier: number, coverageAdd: number) =>
	`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`;

type StatPair = { readonly value: string; readonly from?: string };

// While a bench config is previewed the strip reads old → new; an unchanged
// stat keeps its plain value (no arrow).
const statPair = (current: string, next: string | undefined): StatPair =>
	next === undefined || next === current
		? { value: current }
		: { value: next, from: current };

// An identity multiplier means "no modifier equipped yet" — it reads muted so
// the stats that actually move are the ones that glow.
const multiplierTone = (pair: StatPair): "muted" | "gradient" =>
	pair.from === undefined && pair.value === "×1" ? "muted" : "gradient";

export const ConfiguringScreen = ({
	configs,
	slots,
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
	const earnedSwatches = swatchesEarnedAt(slots);

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

	const reward = statPair(
		`+${gateReward}KB`,
		next ? `+${next.gateReward}KB` : undefined
	);
	const rewardTimes = statPair(
		`×${rewardMultiplier}`,
		next ? `×${next.rewardMultiplier}` : undefined
	);
	const coverageTimes = statPair(
		coverageValue(coverageMultiplier, coverageAdd),
		next ? coverageValue(next.coverageMultiplier, next.coverageAdd) : undefined
	);

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
						trailing={nextSwatchRow({ slots, coverage, slotCoverageRequired })}
					/>
					<div className="flex flex-col gap-2 border-t border-zinc-700 pt-4">
						<Subtitle as="p">Gate modifiers</Subtitle>
						<div className="flex flex-wrap gap-8">
							<StatBadge
								label="reward on clear"
								value={reward.value}
								from={reward.from}
								valueTone="gradient"
							/>
							<StatBadge
								label="reward ×"
								value={rewardTimes.value}
								from={rewardTimes.from}
								valueTone={multiplierTone(rewardTimes)}
							/>
							<StatBadge
								label="coverage ×"
								value={coverageTimes.value}
								from={coverageTimes.from}
								valueTone={multiplierTone(coverageTimes)}
							/>
						</div>
					</div>
					{/* A collection tally, not a gate modifier — so it stands apart. */}
					<div className="flex flex-col gap-2">
						<Subtitle as="p">
							Swatches {earnedSwatches.length} / {ALL_SWATCHES.length}
						</Subtitle>
						{earnedSwatches.length > 0 ? (
							<SwatchChips swatches={earnedSwatches} />
						) : (
							<Paragraph size="xs" tone="faint">
								Unlock a slot to earn your first — each one opens the next gate.
							</Paragraph>
						)}
					</div>
				</section>
			}
		/>
	);
};
