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
import type { StoragePlanOption } from "~/modules/run/view/runView.viewmodel";
import { getCategoryMetadata } from "~/domains/shared/categories";
import {
	pipelineModifiersFor,
	type PipelineModifiers,
} from "~/modules/run/pipeline/pipeline.model";
import { Columns } from "~/ui/Columns.ui";
import { TerminalPanel, TerminalSection } from "~/ui/TerminalPanel.ui";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { SwatchLabel } from "../gate/SwatchLabel.ui";
import { GateStakeReceipt } from "../gate/GateStakeReceipt.ui";
import { RoleList } from "../gate/RoleList.ui";
import { nextSlotRow } from "../gate/SlotUnlockRow.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	configs: readonly Config[];
	slots: number;
	pollsPerGate: number;
	stripsOnFailure: number;
	modifiers: PipelineModifiers;
	billKb?: number;
	newConfigIds: readonly string[];
	draftOptions: readonly Config[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	coverage: number;
	slotCoverageRequired: number;
	justUnlockedSlots: readonly number[];
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
	storagePlans: readonly StoragePlanOption[];
	onChangePlan: (tier: number) => void;
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
	pill = false,
}: {
	label: string;
	price?: string;
	onClick?: () => void;
	disabled?: boolean;
	loud?: boolean;
	prismatic?: boolean;
	pill?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className={`${pill ? "rounded-full" : "rounded-lg"} border px-3 py-1.5 text-sm transition ${actionTone({ loud, prismatic })} enabled:cursor-pointer disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600`}
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
	coverageByCategory,
	checks,
	gateNumber,
	configs,
	slots,
	pollsPerGate,
	stripsOnFailure,
	modifiers,
	billKb,
	newConfigIds,
	draftOptions,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	coverage,
	slotCoverageRequired,
	justUnlockedSlots,
	onUpgrade,
	onSell,
	storagePlans,
	onChangePlan,
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
			label: "Uninstall",
			price: `+${sellRefund(config)}KB`,
			onClick: () => onSell(config.id),
			disabled: holdsLastConfig,
			pill: true,
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
				<Subtitle>Expand your pipeline or make it stricter!</Subtitle>
			</header>

			<Columns
				aside={
					<TerminalPanel title="Shop · Install configs">
						<div className="flex flex-wrap gap-x-4 gap-y-4">
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
							<Tooltip content="Swap these offers for a new set — the price doubles each rebuild, resets next shop">
								{actionButton({
									label: "↻ Rebuild offers",
									price: `${rebuildCost}KB`,
									onClick: onRebuild,
									disabled: !canRebuild,
								})}
							</Tooltip>
						</div>

						<hr className="border-t border-zinc-700" />

						<TerminalSection label="Storage">
							<ul className="flex flex-col">
								{storagePlans.map((plan) => {
									const descriptor =
										plan.billKb === 0 ? "free" : `-${plan.billKb}KB/gate`;
									const row = (
										<span className="flex items-center justify-between gap-3">
											<span className="flex items-center gap-2">
												<span aria-hidden>{plan.current ? "●" : "○"}</span>
												<Paragraph
													as="span"
													size="sm"
													tone={plan.current ? undefined : "muted"}
												>
													{plan.capKb}KB
												</Paragraph>
											</span>
											<Paragraph as="span" size="sm" tone="muted">
												{descriptor}
											</Paragraph>
										</span>
									);
									if (plan.current) return <li key={plan.tier}>{row}</li>;
									const switchButton = (
										<button
											type="button"
											onClick={() => onChangePlan(plan.tier)}
											aria-label={`Switch to ${plan.capKb}KB storage plan${
												plan.billKb > 0 ? `, ${plan.billKb}KB per gate` : ""
											}`}
											className="w-full cursor-pointer rounded-lg px-1 py-1 text-left transition hover:bg-zinc-800/60"
										>
											{row}
										</button>
									);
									return (
										<li key={plan.tier}>
											{plan.burnKb > 0 ? (
												<Tooltip
													content={`Switching burns the ${plan.burnKb}KB sitting above this cap.`}
												>
													{switchButton}
												</Tooltip>
											) : (
												switchButton
											)}
										</li>
									);
								})}
							</ul>
						</TerminalSection>
					</TerminalPanel>
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
										Your pipeline for{" "}
										<SwatchLabel
											swatch={nextGate}
											label={`${nextGate.gateName} gate ${gateNumber}`}
											size="md"
										/>
									</>
								) : (
									`Your pipeline for gate ${gateNumber}`
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
								justUnlocked: justUnlockedSlots,
							})}
						/>
						<GateStakeReceipt
							gateNumber={gateNumber}
							pollsPerGate={pollsPerGate}
							stripsOnFailure={stripsOnFailure}
							configCount={configs.length}
							modifiers={modifiers}
							preview={next}
							billKb={billKb}
						/>
					</section>
				}
			/>
		</div>
	);
};
