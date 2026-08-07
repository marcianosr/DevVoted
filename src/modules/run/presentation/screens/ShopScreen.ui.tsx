import { useState, type ReactNode } from "react";
import {
	Config,
	describeConfig,
	draftCost,
	isUpgradable,
	sellRefund,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { pipelineModifiersFor } from "~/modules/run/pipeline/pipeline.model";
import { Columns } from "~/ui/Columns.ui";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { SwatchLabel } from "../gate/SwatchLabel.ui";
import { GateModifierStrip } from "../gate/GateModifierStrip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { nextSlotRow } from "../gate/SlotUnlockRow.ui";

type ShopScreenProps = {
	storage: number;
	storageCap: number;
	ownedStorageConfigs: Readonly<Record<string, number>>;
	availableStorageConfigs: ReadonlyArray<{
		readonly id: string;
		readonly label: string;
		readonly description: string;
		readonly currentLevel: number;
		readonly nextLevelCost: number | null;
		readonly maxLevel: boolean;
	}>;
	draftCostReduction: number;
	refundBoost: number;
	payoutBoost: number;
	freeRebuild: boolean;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	configs: readonly Config[];
	slots: number;
	gateReward: number;
	rewardMultiplier: number;
	coverageMultiplier: number;
	coverageAdd: number;
	newConfigIds: readonly string[];
	draftOptions: readonly Config[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	coverage: number;
	slotCoverageRequired: number;
	canAddSlot: boolean;
	onAddSlot: () => void;
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
};

// The shop's row controls share one shape: a bordered pill whose label reads
// plain and whose price glows saffron. Buying is the loud one (viridian);
// an unlocked upgrade wears the legendary Kanto ring (prismatic).
const actionTone = ({
	loud,
	prismatic,
}: {
	loud: boolean;
	prismatic: boolean;
}): string => {
	if (prismatic)
		return "border-transparent legendary-ring text-zinc-100 enabled:hover:brightness-125";
	if (loud)
		return "border-viridian bg-viridian/10 text-zinc-100 enabled:hover:bg-viridian/20";
	return "border-zinc-600 text-zinc-300 enabled:hover:border-zinc-400";
};

const actionButton = ({
	label,
	price,
	onClick,
	disabled = false,
	loud = false,
	prismatic = false,
}: {
	label: string;
	price?: string;
	onClick?: () => void;
	disabled?: boolean;
	loud?: boolean;
	prismatic?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className={`rounded-lg border px-3 py-1.5 text-sm transition ${actionTone({ loud, prismatic })} enabled:cursor-pointer disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600`}
	>
		{label}
		{price ? (
			<>
				{" "}
				<span className="ml-1 font-bold text-saffron">{price}</span>
			</>
		) : null}
	</button>
);

type PanelHeadingProps = {
	/** A node, not a string: the load-out panel names its gate in badge colour. */
	title: ReactNode;
	subtitle: string;
};

const PanelHeading = ({ title, subtitle }: PanelHeadingProps) => (
	<header>
		<Title>{title}</Title>
		<Subtitle>{subtitle}</Subtitle>
	</header>
);

export const ShopScreen = ({
	storage,
	storageCap: _storageCap,
	ownedStorageConfigs: _ownedStorageConfigs,
	availableStorageConfigs: _availableStorageConfigs,
	draftCostReduction: _draftCostReduction,
	refundBoost: _refundBoost,
	payoutBoost: _payoutBoost,
	freeRebuild: _freeRebuild,
	coverageByCategory,
	checks,
	gateNumber,
	configs,
	slots,
	gateReward,
	rewardMultiplier,
	coverageMultiplier,
	coverageAdd,
	newConfigIds,
	draftOptions,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	coverage,
	slotCoverageRequired,
	canAddSlot,
	onAddSlot,
	onUpgrade,
	onSell,
}: ShopScreenProps) => {
	const [previewId, setPreviewId] = useState<string | null>(null);
	const isFull = configs.length >= slots;
	const nextGate = swatchForGate(gateNumber);

	const canAfford = (config: Config): boolean => storage >= draftCost(config);
	const canInstall = (config: Config): boolean => !isFull && canAfford(config);

	// Focus upgrades are coverage-gated and free; Unit Tests' upgrade is
	// storage-priced (32KB × the level bought) with no coverage requirement.
	const canUpgrade = (config: Config): boolean => {
		if (!config.focusCategory)
			return storage >= upgradeStorageCost(config.level ?? 1);
		return (
			(coverageByCategory[config.focusCategory] ?? 0) >=
			upgradeCoverageRequired(config.level ?? 1)
		);
	};

	// Hovering Upgrade always previews the next level's concrete effect; while
	// gated it adds what the upgrade wants — the category-tied coverage for a
	// focus config (its name in bold), the KB price otherwise.
	const upgradeTooltip = (config: Config): ReactNode => {
		const nextLevel = (config.level ?? 1) + 1;
		const preview = `L${nextLevel}: ${describeConfig({ ...config, level: nextLevel })}`;
		if (canUpgrade(config)) return preview;
		if (!config.focusCategory) {
			const cost = upgradeStorageCost(config.level ?? 1);
			return `${preview} Costs ${cost}KB — you have ${storage}KB.`;
		}
		const required = upgradeCoverageRequired(config.level ?? 1);
		const have = coverageByCategory[config.focusCategory] ?? 0;
		return (
			<>
				{preview} Unlocks at {required}%{" "}
				<span className="font-bold">
					{getCategoryMetadata(config.focusCategory).name}
				</span>{" "}
				coverage — you have {have}%.
			</>
		);
	};

	// The last installed config stays: a bare pipeline can never clear a gate
	// (ADR-017), so deinstalling it would hand the player an already-lost run —
	// and since ADR-021 a build only dies at a gate it failed.
	const holdsLastConfig = configs.length <= 1;

	const loadoutActions = (config: Config): ReactNode => {
		const deinstallButton = actionButton({
			label: "Deinstall",
			price: `${sellRefund(config)}KB`,
			onClick: () => onSell(config.id),
			disabled: holdsLastConfig,
		});
		const upgradeButton = isUpgradable(config)
			? actionButton({
					label: "Upgrade",
					price: config.focusCategory
						? undefined
						: `${upgradeStorageCost(config.level ?? 1)}KB`,
					onClick: () => onUpgrade(config.id),
					disabled: !canUpgrade(config),
					prismatic: canUpgrade(config),
				})
			: null;
		return (
			<span className="flex items-center gap-2">
				{upgradeButton ? (
					<Tooltip content={upgradeTooltip(config)}>{upgradeButton}</Tooltip>
				) : null}
				{holdsLastConfig ? (
					<Tooltip content="Your only config — deinstalling it would leave nothing to clear a gate with.">
						{deinstallButton}
					</Tooltip>
				) : (
					deinstallButton
				)}
			</span>
		);
	};

	// Only an installable offer previews. Hovering one you cannot afford (or with
	// no free slot) used to draw a ghost row in a slot that does not exist, which
	// read as if the config had been added. The chip's own price tag and tooltip
	// carry the refusal instead.
	const previewConfig = draftOptions.find(
		(config) => config.id === previewId && canInstall(config)
	);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig])
		: undefined;

	const install = (configId: string) => {
		onDraft(configId);
		setPreviewId(null);
	};

	// Only reached for an installable offer, so this is purely the price — the row
	// itself is the button (its aria-label names the action).
	const previewHint = (config: Config): ReactNode => (
		<Paragraph as="span" size="sm" tone="muted">
			<span className="font-bold text-saffron">{draftCost(config)}KB</span>
		</Paragraph>
	);

	const offerChip = (config: Config): ReactNode => {
		const chip = (
			<ConfigChip
				config={config}
				noTooltip
				price={draftCost(config)}
				disabled={!canInstall(config)}
				onClick={() => install(config.id)}
			/>
		);
		if (!isFull) return chip;
		return (
			<Tooltip content="Add a new slot to upgrade or sell an existing config">
				{chip}
			</Tooltip>
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<header>
				<Title>Upgrade your pipeline</Title>
				<Subtitle>
					Expand your load-out or make your pipeline stricter!
				</Subtitle>
			</header>

			{/* Storage configs moved to separate StorageShop component */}

			<Columns
				aside={
					<section className="space-y-2">
						<PanelHeading
							title="Install new configs"
							subtitle="New categories raise coverage fastest"
						/>
						{/* The price tags overhang their chips, so the bench needs more room
						    between offers than a plain chip row would — otherwise one
						    offer's tag lands on the next one's label. */}
						<div className="flex flex-wrap gap-x-4 gap-y-4 pt-2">
							{draftOptions.map((config) => (
								<span
									key={config.id}
									onMouseEnter={() => setPreviewId(config.id)}
									onFocus={() => setPreviewId(config.id)}
								>
									{offerChip(config)}
								</span>
							))}
						</div>
						<div className="pt-1">
							{actionButton({
								label: "Rebuild offers",
								price: `${rebuildCost}KB`,
								onClick: onRebuild,
								disabled: !canRebuild,
							})}
						</div>
					</section>
				}
				main={
					<section className="flex flex-col gap-4">
						<PanelHeading
							// The shop sits between gates, so its heading names the one you
							// are building for — by badge, since that is what the gate is
							// called and what clearing it will award.
							title={
								nextGate ? (
									<>
										Your load-out for{" "}
										<SwatchLabel
											swatch={nextGate}
											label={`${nextGate.gateName} gate ${gateNumber}`}
											size="md"
										/>
									</>
								) : (
									`Your load-out for gate ${gateNumber}`
								)
							}
							subtitle={`${configs.length} of ${slots} slots used`}
						/>
						<RoleList
							rows={roleRows(configs, checks)}
							slots={slots}
							trailingFor={loadoutActions}
							newConfigIds={newConfigIds}
							preview={
								previewConfig
									? {
											config: previewConfig,
											onAdd: () => install(previewConfig.id),
											hint: previewHint(previewConfig),
										}
									: undefined
							}
							trailing={nextSlotRow({
								slots,
								coverage,
								slotCoverageRequired,
								claim: { ready: canAddSlot, onClaim: onAddSlot },
							})}
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
					</section>
				}
			/>
		</div>
	);
};
