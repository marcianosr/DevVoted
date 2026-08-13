import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import {
	Config,
	describeConfig,
	isUpgradable,
	sellRefund,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import type {
	GateStake,
	OfferRefusal,
	ShopExit,
	ShopOffer,
	StoragePlanOption,
} from "~/modules/run/run/application/runView.viewmodel";
import { getCategoryMetadata } from "~/shared/lib/categories";
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
import {
	GateStakeReceipt,
	widthRefusal,
} from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";
import { nextSlotRow } from "~/modules/run/pipeline/presentation/SlotUnlockRow.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	checks: readonly CheckStatus[];
	stake: GateStake;
	configs: readonly Config[];
	/** The build is on its width floor, so every uninstall is refused. */
	atMinimumWidth: boolean;
	slots: number;
	newConfigIds: readonly string[];
	offers: readonly ShopOffer[];
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	onRebuild: () => void;
	lockAvailable: boolean;
	lockCost: number;
	canLock: boolean;
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

type ShopExitAction = {
	readonly label: string;
	readonly disabled: boolean;
	readonly hint?: string;
	readonly variant?: "danger";
};

/**
 * The shop door's wording, for the three verdicts `shopExitFor` grades. Lives
 * here rather than in the viewmodel so every phrasing is reachable from a story
 * instead of only from an engine state that produces it.
 */
export const shopExitAction = (exit: ShopExit): ShopExitAction => {
	if (exit.state === "open")
		return { label: `Continue to gate ${exit.gate} →`, disabled: false };
	if (exit.state === "blocked")
		return {
			label: `Continue to gate ${exit.gate} →`,
			disabled: true,
			hint: `Gate ${exit.gate} demands ${exit.demand} configs — install ${exit.shortfall} more before you can climb on.`,
		};
	return {
		label: `End run — gate ${exit.gate} demands ${exit.demand} configs →`,
		disabled: false,
		variant: "danger",
		hint: "The shop can no longer get the build to the demand. Leaving walks into the gate and ends the run.",
	};
};

/**
 * An offer's install refusal, in the shop's own words. Same split as
 * `shopExitAction` above: the viewmodel grades, this formats — so both
 * phrasings are reachable from a story.
 */
export const offerRefusalText = (refusal: OfferRefusal): string =>
	refusal.reason === "no-slot"
		? "No free slot — uninstall a config first"
		: `Costs ${refusal.priceKb}KB — you have ${refusal.storageKb}KB`;

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
	return "border-control-edge text-pewter enabled:hover:border-zinc-400";
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
		className={`${pill ? "rounded-full" : "rounded-lg"} border px-3 py-1.5 text-sm transition ${actionTone({ loud, prismatic })} enabled:cursor-pointer disabled:cursor-not-allowed disabled:border-edge disabled:text-zinc-600`}
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

// A locked rung reads dim through its row's own opacity, so it needs no third
// tone of its own — only the plan you are on is at full strength.
const planLabelTone = (plan: StoragePlanOption): ParagraphTone | undefined =>
	plan.current ? undefined : "muted";

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
	stake,
	configs,
	atMinimumWidth,
	slots,
	newConfigIds,
	offers,
	onDraft,
	rebuildCost,
	canRebuild,
	onRebuild,
	lockAvailable,
	lockCost,
	canLock,
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
	const { gateNumber, minConfigs } = stake;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const nextGate = swatchForGate(gateNumber);

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
						content={widthRefusal(gateNumber, minConfigs, "uninstalling")}
					>
						{deinstallButton}
					</Tooltip>
				) : (
					deinstallButton
				)}
			</span>
		);
	};

	const previewOffer = offers.find(
		(offer) =>
			offer.config.id === (hoveredId ?? selectedId) && offer.installable
	);
	const next = previewOffer?.preview;
	const nextPerAnswer = previewOffer?.previewPerAnswer;

	const install = (configId: string) => {
		onDraft(configId);
		setSelectedId(null);
		setHoveredId(null);
	};

	const previewHint = (offer: ShopOffer): ReactNode => (
		<Paragraph as="span" size="sm" tone="muted">
			<span className="font-bold text-saffron">{offer.priceKb}KB</span>
		</Paragraph>
	);

	const offerBadge = ({ owned, priceKb }: ShopOffer): ReactNode => {
		if (owned)
			return (
				<Badge size="corner">
					<span aria-hidden="true">✓ </span>owned
				</Badge>
			);
		return (
			<Badge tone="price" size="corner">
				{priceKb}KB
			</Badge>
		);
	};

	const offerTooltip = (offer: ShopOffer): ReactNode => {
		const { config, priceKb, refusal } = offer;
		const installTone: "neutral" | "positive" = refusal
			? "neutral"
			: "positive";
		const installBtn = (
			<Badge
				tone={installTone}
				size="corner"
				onClick={() => install(config.id)}
				disabled={refusal !== null}
				ariaLabel={`Install ${config.label} for ${priceKb}KB`}
			>
				install
			</Badge>
		);
		const lockBtn =
			lockAvailable && !offer.locked ? (
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
						<Tooltip content={offerRefusalText(refusal)} compact nested>
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

	const offerChip = (offer: ShopOffer): ReactNode => {
		const { config, owned } = offer;
		const selected = config.id === selectedId;
		return (
			<ConfigChip
				config={config}
				tooltip={!owned ? offerTooltip(offer) : undefined}
				interactiveTooltip={!owned}
				tooltipHint={!owned ? "Click to install" : undefined}
				tooltipPinned={!owned ? selected : undefined}
				onTooltipDismiss={() => setSelectedId(null)}
				badge={
					<>
						{offer.locked ? <Badge size="corner">Locked</Badge> : null}
						{offerBadge(offer)}
					</>
				}
				disabled={owned}
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
							{offers.map((offer) => (
								<span
									key={offer.config.id}
									className={clsx(
										"inline-flex rounded-sm",
										offer.config.id === selectedId &&
											"ring-2 ring-celadon ring-offset-2 ring-offset-zinc-950"
									)}
									onMouseEnter={() => setHoveredId(offer.config.id)}
									onFocus={() => setHoveredId(offer.config.id)}
								>
									{offerChip(offer)}
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

						<hr className="border-t border-edge" />

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
												"cursor-pointer transition hover:bg-surface-raised/60"
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
								previewOffer
									? {
											config: previewOffer.config,
											onAdd: () => install(previewOffer.config.id),
											hint: previewHint(previewOffer),
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
							stake={stake}
							configCount={configs.length}
							preview={next}
							previewPerAnswer={nextPerAnswer}
						/>
					</section>
				}
			/>
		</div>
	);
};
