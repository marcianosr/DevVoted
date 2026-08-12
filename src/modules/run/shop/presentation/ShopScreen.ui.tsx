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
} from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import type { StoragePlanOption } from "~/modules/run/run/application/runView.viewmodel";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	perAnswerPreviewFor,
	pipelineModifiersFor,
	type PerAnswerPreview,
	type PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { formatKb } from "~/shared/lib/storage";
import { Badge } from "~/ui/Badge.component";
import { Columns } from "~/ui/Columns.ui";
import { RadioDot } from "~/ui/RadioDot.ui";
import { TerminalPanel, TerminalSection } from "~/ui/TerminalPanel.ui";
import { Tooltip } from "~/ui/Tooltip.component";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { SwatchLabel } from "~/modules/run/gate/presentation/SwatchLabel.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";
import { nextSlotRow } from "~/modules/run/pipeline/presentation/SlotUnlockRow.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	gateNumber: number;
	configs: readonly Config[];
	slots: number;
	pollsPerGate: number;
	stripsOnFailure: number;
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
	lockAvailable: boolean;
	lockCost: number;
	canLock: boolean;
	lockedOfferIds: readonly string[];
	onLock: (configId: string) => void;
	extendAvailable: boolean;
	extendCost: number;
	canExtend: boolean;
	onExtend: () => void;
	coverage: number;
	slotCoverageRequired: number;
	justUnlockedSlots: readonly number[];
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
	storagePlans: readonly StoragePlanOption[];
	onChangePlan: (tier: number) => void;
};

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
	ariaLabel,
}: {
	label: string;
	price?: string;
	onClick?: () => void;
	disabled?: boolean;
	loud?: boolean;
	prismatic?: boolean;
	pill?: boolean;
	ariaLabel?: string;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		aria-label={ariaLabel}
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

const planBill = (plan: StoragePlanOption): string => {
	if (plan.locked) return `Opens after gate ${plan.fromGate}`;
	return plan.billKb === 0 ? "Free" : `${plan.billKb}KB / gate`;
};

const planLabelTone = (plan: StoragePlanOption): ParagraphTone | undefined => {
	if (plan.locked) return "faint";
	return plan.current ? undefined : "muted";
};

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
	lockAvailable,
	lockCost,
	canLock,
	lockedOfferIds,
	onLock,
	extendAvailable,
	extendCost,
	canExtend,
	onExtend,
	coverage,
	slotCoverageRequired,
	justUnlockedSlots,
	onUpgrade,
	onSell,
	storagePlans,
	onChangePlan,
}: ShopScreenProps) => {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const isFull = configs.length >= slots;
	const nextGate = swatchForGate(gateNumber);

	const isLocked = (config: Config): boolean =>
		lockedOfferIds.includes(config.id);

	const isOwned = (config: Config): boolean =>
		configs.some((installed) => installed.id === config.id);

	const canAfford = (config: Config): boolean => storage >= draftCost(config);
	const canInstall = (config: Config): boolean =>
		!isFull && canAfford(config) && !isOwned(config);

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
		(config) => config.id === (hoveredId ?? selectedId) && canInstall(config)
	);
	const next = previewConfig
		? pipelineModifiersFor([...configs, previewConfig])
		: undefined;
	const nextPerAnswer = previewConfig
		? perAnswerPreviewFor([...configs, previewConfig], gateNumber)
		: undefined;

	const install = (configId: string) => {
		onDraft(configId);
		setSelectedId(null);
		setHoveredId(null);
	};

	const previewHint = (config: Config): ReactNode => (
		<Paragraph as="span" size="sm" tone="muted">
			<span className="font-bold text-saffron">{draftCost(config)}KB</span>
		</Paragraph>
	);

	const installRefusal = (config: Config): string | null => {
		if (isFull) return "No free slot — uninstall a config first";
		if (!canAfford(config))
			return `Costs ${draftCost(config)}KB — you have ${storage}KB`;
		return null;
	};

	const offerBadge = (config: Config): ReactNode => {
		if (isOwned(config))
			return (
				<Badge size="corner">
					<span aria-hidden="true">✓ </span>owned
				</Badge>
			);
		return (
			<Badge tone="price" size="corner">
				{draftCost(config)}KB
			</Badge>
		);
	};

	const offerTooltip = (config: Config): ReactNode => {
		const refusal = installRefusal(config);
		const installTone: "neutral" | "positive" = refusal
			? "neutral"
			: "positive";
		const installBtn = (
			<Badge
				tone={installTone}
				size="corner"
				onClick={() => install(config.id)}
				disabled={refusal !== null}
				ariaLabel={`Install ${config.label} for ${draftCost(config)}KB`}
			>
				install
			</Badge>
		);
		const lockBtn =
			lockAvailable && !isLocked(config) ? (
				<Badge
					tone="price"
					size="corner"
					onClick={() => onLock(config.id)}
					disabled={!canLock}
					ariaLabel={`Lock ${config.label} for ${lockCost}KB`}
				>
					Lock config
				</Badge>
			) : null;

		return (
			<>
				<span className="text-sm">{describeConfig(config)}</span>
				<span className="mt-2 flex gap-1">
					{refusal ? (
						<Tooltip content={refusal} compact nested>
							{installBtn}
						</Tooltip>
					) : (
						installBtn
					)}
					{lockBtn &&
						(canLock ? (
							lockBtn
						) : (
							<Tooltip
								content={`Holding costs ${lockCost}KB — you have ${storage}KB.`}
								compact
								nested
							>
								{lockBtn}
							</Tooltip>
						))}
				</span>
			</>
		);
	};

	const offerChip = (config: Config): ReactNode => {
		const selected = config.id === selectedId;
		return (
			<ConfigChip
				config={config}
				tooltip={!isOwned(config) ? offerTooltip(config) : undefined}
				interactiveTooltip={!isOwned(config)}
				tooltipHint={!isOwned(config) ? "Click to install" : undefined}
				tooltipPinned={!isOwned(config) ? selected : undefined}
				onTooltipDismiss={() => setSelectedId(null)}
				badge={
					<>
						{isLocked(config) ? <Badge size="corner">Locked</Badge> : null}
						{offerBadge(config)}
					</>
				}
				disabled={isOwned(config)}
				onClick={() => setSelectedId(selected ? null : config.id)}
				ariaExpanded={selected}
			/>
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
						<div className="flex flex-wrap items-start gap-x-4 gap-y-5">
							{draftOptions.map((config) => (
								<span
									key={config.id}
									className={clsx(
										"inline-flex rounded-sm",
										config.id === selectedId &&
											"ring-2 ring-celadon ring-offset-2 ring-offset-zinc-950"
									)}
									onMouseEnter={() => setHoveredId(config.id)}
									onFocus={() => setHoveredId(config.id)}
								>
									{offerChip(config)}
								</span>
							))}
						</div>
						<TerminalSection label="Shop controls">
							<div className="flex flex-wrap items-center gap-2">
								<Tooltip content="Swap these offers for a new set — the price doubles each rebuild, resets next shop">
									{actionButton({
										label: "↻ Rebuild offers",
										price: `${rebuildCost}KB`,
										onClick: onRebuild,
										disabled: !canRebuild,
									})}
								</Tooltip>
								{extendAvailable ? (
									<Tooltip content="One more offer, in this shop and every shop after it">
										{actionButton({
											label: "+ Extend offers",
											price: `${extendCost}KB`,
											onClick: onExtend,
											disabled: !canExtend,
										})}
									</Tooltip>
								) : null}
							</div>
						</TerminalSection>

						<hr className="border-t border-zinc-700" />

						<TerminalSection label="Storage upgrades">
							<ul className="flex flex-col">
								{storagePlans.map((plan) => {
									const planRow = (
										<span className="flex items-center justify-between gap-3">
											<span className="flex items-center gap-2">
												<RadioDot checked={plan.current} />
												<Paragraph
													as="span"
													size="sm"
													tone={planLabelTone(plan)}
												>
													{formatKb(plan.capKb)}
												</Paragraph>
											</span>
											<Paragraph as="span" size="sm" tone="muted">
												{planBill(plan)}
											</Paragraph>
										</span>
									);
									const rowBox = "block w-full rounded-lg px-1 py-1 text-left";
									if (plan.locked)
										return (
											<li key={plan.tier}>
												<Tooltip
													content={`A ${formatKb(plan.capKb)} cap is only worth its bill once a gate pays enough to fill it — this rung opens after gate ${plan.fromGate}.`}
												>
													<span className={clsx(rowBox, "opacity-60")}>
														{planRow}
													</span>
												</Tooltip>
											</li>
										);
									if (plan.current)
										return (
											<li key={plan.tier}>
												<span className={rowBox}>{planRow}</span>
											</li>
										);
									const switchButton = (
										<button
											type="button"
											onClick={() => onChangePlan(plan.tier)}
											aria-label={`Switch to ${formatKb(plan.capKb)} storage plan${
												plan.billKb > 0 ? `, ${plan.billKb}KB per gate` : ""
											}`}
											className={clsx(
												rowBox,
												"cursor-pointer transition hover:bg-zinc-800/60"
											)}
										>
											{planRow}
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
