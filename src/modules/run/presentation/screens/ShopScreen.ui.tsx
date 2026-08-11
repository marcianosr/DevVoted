import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
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
	perAnswerPreviewFor,
	pipelineModifiersFor,
	type PerAnswerPreview,
	type PipelineModifiers,
} from "~/modules/run/pipeline/pipeline.model";
import { Columns } from "~/ui/Columns.ui";
import { RadioDot } from "~/ui/RadioDot.ui";
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
	/** The coming gate's width demand (ADR-027): selling below it is refused. */
	minConfigs: number;
	modifiers: PipelineModifiers;
	perAnswer: PerAnswerPreview;
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
	minConfigs,
	modifiers,
	perAnswer,
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

	const canUpgrade = (config: Config): boolean => {
		if (!config.focusCategory)
			return storage >= upgradeStorageCost(config.level ?? 1);
		return (
			(coverageByCategory[config.focusCategory] ?? 0) >=
			upgradeCoverageRequired(config.level ?? 1)
		);
	};

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

	const atMinimumWidth = configs.length <= Math.max(1, minConfigs);

	const loadoutActions = (config: Config): ReactNode => {
		const deinstallButton = actionButton({
			label: "Uninstall",
			price: `+${sellRefund(config)}KB`,
			onClick: () => onSell(config.id),
			disabled: atMinimumWidth,
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
				{atMinimumWidth ? (
					<Tooltip
						content={
							minConfigs >= 2
								? `Gate ${gateNumber} demands ${minConfigs} configs — uninstalling would sink the build below it.`
								: "Your only config — deinstalling it would leave nothing to clear a gate with."
						}
					>
						{deinstallButton}
					</Tooltip>
				) : (
					deinstallButton
				)}
			</span>
		);
	};

	const previewConfig = draftOptions.find(
		(config) => config.id === previewId && canInstall(config)
	);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig])
		: undefined;
	const nextPerAnswer = previewConfig
		? perAnswerPreviewFor([...configs, previewConfig], gateNumber)
		: undefined;

	const install = (configId: string) => {
		onDraft(configId);
		setPreviewId(null);
	};

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

						<TerminalSection label="Storage upgrades">
							<ul className="flex flex-col">
								{storagePlans.map((plan) => {
									const descriptor =
										plan.billKb === 0 ? "free" : `-${plan.billKb}KB/gate`;
									const row = (
										<span className="flex items-center justify-between gap-3">
											<span className="flex items-center gap-2">
												<RadioDot checked={plan.current} />
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
									// Every row shares one box (padding, rounding) whether it's the
									// current plan or a switch target — otherwise the current row
									// (plain span) sits a different size than the others (button),
									// and the list visibly shifts as the selection changes.
									const rowBox = "block w-full rounded-lg px-1 py-1 text-left";
									if (plan.current)
										return (
											<li key={plan.tier}>
												<span className={rowBox}>{row}</span>
											</li>
										);
									const switchButton = (
										<button
											type="button"
											onClick={() => onChangePlan(plan.tier)}
											aria-label={`Switch to ${plan.capKb}KB storage plan${
												plan.billKb > 0 ? `, ${plan.billKb}KB per gate` : ""
											}`}
											className={clsx(
												rowBox,
												"cursor-pointer transition hover:bg-zinc-800/60"
											)}
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
							perAnswer={perAnswer}
							previewPerAnswer={nextPerAnswer}
							billKb={billKb}
							minConfigs={minConfigs}
						/>
					</section>
				}
			/>
		</div>
	);
};
