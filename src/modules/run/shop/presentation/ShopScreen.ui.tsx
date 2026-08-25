import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import {
	Config,
	describeConfig,
	isUpgradable,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import type { SlotUnlock } from "~/modules/run/pipeline/domain/pipeline.model";
import type {
	GateStake,
	OfferRefusal,
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
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { TextTone } from "~/ui/typography/textTone";
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
import {
	UpcomingCategories,
	type UpcomingCategoriesProps,
} from "~/modules/run/run/presentation/UpcomingCategories.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	stake: GateStake;
	configs: readonly Config[];
	/** The build is on its width floor, so every uninstall is refused. */
	atMinimumWidth: boolean;
	/** Read-only (ADR-038) has shut this shop: everything is browsable, nothing
	 * is buyable, and the banner says which gate did it. */
	locked?: boolean;
	slots: number;
	newConfigIds: readonly string[];
	offers: readonly ShopOffer[];
	/** Prefetch's reveal; absent when no installed config reads the draw. */
	upcoming?: UpcomingCategoriesProps;
	onDraft: (configId: string) => void;
	rebuildCost: number;
	canRebuild: boolean;
	/** Hidden, not disabled, while WTFPL lays out the whole catalog — a reroll
	 * of everything is not a thing this shop sells. */
	rebuildAvailable?: boolean;
	onRebuild: () => void;
	lockAvailable: boolean;
	lockCost: number;
	canLock: boolean;
	onLock: (configId: string) => void;
	extendAvailable: boolean;
	extendCost: number;
	canExtend: boolean;
	onExtend: () => void;
	/** The git tag (ADR-036): a once-per-run checkpoint purchase, priced by the
	 * gate it would mark. */
	pinAvailable: boolean;
	pinCost: number;
	canPin: boolean;
	pinnedAtGate: number | null;
	onPlantPin: () => void;
	/** What opens the next slot — a gate, a coverage total, or either
	 * (ADR-041); null at the cap. */
	nextSlotUnlock: SlotUnlock | null;
	justUnlockedSlots: readonly number[];
	/** The config Dependabot bumped at the clear that opened this shop. */
	upgradedConfigId?: string;
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
	storagePlans: readonly StoragePlanOption[];
	onChangePlan: (tier: number) => void;
};

/** The shop door is always open (ADR-035): no gate grades the exit anymore. */
export const shopExitAction = (
	gate: number
): { readonly label: string; readonly disabled: boolean } => ({
	label: `Continue to gate ${gate} →`,
	disabled: false,
});

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
const planLabelTone = (plan: StoragePlanOption): TextTone | undefined =>
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
	stake,
	configs,
	atMinimumWidth,
	locked = false,
	slots,
	newConfigIds,
	offers,
	upcoming,
	onDraft,
	rebuildCost,
	canRebuild,
	rebuildAvailable = true,
	onRebuild,
	lockAvailable,
	lockCost,
	canLock,
	onLock,
	extendAvailable,
	extendCost,
	canExtend,
	onExtend,
	pinAvailable,
	pinCost,
	canPin,
	pinnedAtGate,
	onPlantPin,
	nextSlotUnlock,
	justUnlockedSlots,
	upgradedConfigId,
	onUpgrade,
	onSell,
	storagePlans,
	onChangePlan,
}: ShopScreenProps) => {
	const { gateNumber } = stake;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const nextGate = swatchForGate(gateNumber);

	// Two independent gates, asked separately so the tooltip can name whichever
	// one is in the way — a Focus config can be earned but unaffordable, or
	// affordable but unearned.
	const upgradeAffordable = (config: Config): boolean =>
		storage >= upgradeStorageCost(config.level ?? 1);

	const upgradeEarned = (config: Config): boolean =>
		config.focusCategory === undefined ||
		(coverageByCategory[config.focusCategory] ?? 0) >=
			upgradeCoverageRequired(config.level ?? 1);

	const canUpgrade = (config: Config): boolean =>
		upgradeAffordable(config) && upgradeEarned(config);

	const coverageShortfall = (config: Config): ReactNode => {
		if (config.focusCategory === undefined) return null;
		const required = upgradeCoverageRequired(config.level ?? 1);
		const have = coverageByCategory[config.focusCategory] ?? 0;
		return (
			<>
				{" "}
				Unlocks at {required}%{" "}
				<span className="font-bold">
					{getCategoryMetadata(config.focusCategory).name}
				</span>{" "}
				coverage — you have {have}%.
			</>
		);
	};

	const upgradeTooltip = (config: Config): ReactNode => {
		const nextLevel = (config.level ?? 1) + 1;
		const preview = `L${nextLevel}: ${describeConfig({ ...config, level: nextLevel })}`;
		if (canUpgrade(config)) return preview;
		const cost = upgradeStorageCost(config.level ?? 1);
		return (
			<>
				{preview}
				{upgradeAffordable(config) ? null : (
					<>
						{" "}
						Costs {cost}KB — you have {storage}KB.
					</>
				)}
				{upgradeEarned(config) ? null : coverageShortfall(config)}
			</>
		);
	};

	const loadoutActions = (config: Config): ReactNode => {
		const deinstallButton = actionButton({
			label: "Uninstall",
			price: `+${sellRefundIn(configs, config)}KB`,
			onClick: () => onSell(config.id),
			disabled: atMinimumWidth || locked,
			pill: true,
		});
		const upgradeButton = isUpgradable(config)
			? actionButton({
					label: "Upgrade",
					// Every upgrade is priced now, Focus included, so the price belongs on
					// the button face like every other spend in the shop.
					price: `${upgradeStorageCost(config.level ?? 1)}KB`,
					onClick: () => onUpgrade(config.id),
					disabled: !canUpgrade(config) || locked,
					prismatic: canUpgrade(config) && !locked,
				})
			: null;
		return (
			<span className="flex items-center gap-2">
				{upgradeButton ? (
					<Tooltip content={upgradeTooltip(config)}>{upgradeButton}</Tooltip>
				) : null}
				{atMinimumWidth ? (
					<Tooltip content={widthRefusal("uninstalling")}>
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
				disabled={refusal !== null || locked}
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
					disabled={!canLock || locked}
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

			{/* One statement at the top rather than a refusal on every control: with
			    the whole shop shut, seven tooltips would each explain the same rule.
			    The offers stay visible, because knowing what you cannot buy is how
			    the gate after this one gets planned. */}
			{locked ? (
				<div className="rounded-lg border border-cinnabar/50 px-3 py-2">
					<Paragraph size="sm" tone="cinnabar">
						Read-only: gate {gateNumber} audits the build you already have.
						Nothing can be bought, sold or switched before it.
					</Paragraph>
				</div>
			) : null}

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
						{/* Between the offers and the controls: what's coming is drafting
						    information, read in the same glance as what's for sale. */}
						{upcoming ? <UpcomingCategories {...upcoming} /> : null}
						<TerminalSection label="Shop controls">
							<div className="flex flex-wrap items-center gap-2">
								{rebuildAvailable ? (
									<Tooltip content="Swap these offers for a new set — the price doubles each rebuild, resets next shop">
										{actionButton({
											label: "↻ Rebuild offers",
											price: `${rebuildCost}KB`,
											onClick: onRebuild,
											disabled: !canRebuild || locked,
										})}
									</Tooltip>
								) : null}
								{extendAvailable ? (
									<Tooltip content="One more offer, in this shop and every shop after it">
										{actionButton({
											label: "+ Extend offers",
											price: `${extendCost}KB`,
											onClick: onExtend,
											disabled: !canExtend || locked,
										})}
									</Tooltip>
								) : null}
								{pinAvailable ? (
									<Tooltip content="Plant a checkpoint at this gate: after a death, your next run checks out here instead of gate 1. The price rises with every gate, and the last one sold is gate 10. One per run, spent by the run it rescues — after that you buy another.">
										{actionButton({
											label: "🏷 git tag",
											price: `${pinCost}KB`,
											onClick: onPlantPin,
											disabled: !canPin || locked,
										})}
									</Tooltip>
								) : null}
								{pinnedAtGate !== null ? (
									<Paragraph as="span" size="xs" tone="viridian">
										git tag planted at gate {pinnedAtGate} — your next run
										checks out there
									</Paragraph>
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
											disabled={locked}
											onClick={() => onChangePlan(plan.tier)}
											aria-label={`Switch to ${formatKb(plan.capKb)} storage plan${
												plan.billKb > 0 ? `, ${plan.billKb}KB per gate` : ""
											}`}
											className={clsx(
												rowBox,
												locked
													? "cursor-not-allowed opacity-60"
													: "cursor-pointer transition hover:bg-surface-raised/60"
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
							rows={roleRows(configs)}
							slots={slots}
							trailingFor={loadoutActions}
							newConfigIds={newConfigIds}
							upgradedConfigId={upgradedConfigId}
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
								nextSlotUnlock,
								justUnlocked: justUnlockedSlots,
							})}
						/>
						<GateStakeReceipt
							stake={stake}
							preview={next}
							previewPerAnswer={nextPerAnswer}
						/>
					</section>
				}
			/>
		</div>
	);
};
