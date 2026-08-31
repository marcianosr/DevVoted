import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import {
	Config,
	describeConfig,
	isUpgradable,
	largestSizeFitting,
	slotsOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import type {
	SlotsView,
	StoragePlanView,
	OfferRefusal,
	ShopOffer,
} from "~/modules/run/run/application/runView.viewmodel";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { Badge } from "~/ui/Badge.component";
import { MAX_SLOTS } from "~/modules/run/run/domain/rules.model";
import { SlotTrack } from "~/ui/modern-theme/SlotTrack.ui";
import { capLabel, plural } from "~/ui/modern-theme/format";
import { Columns } from "~/ui/Columns.ui";
import { RadioDot } from "~/ui/RadioDot.ui";
import { TerminalPanel, TerminalSection } from "~/ui/TerminalPanel.ui";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
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
import {
	UpcomingCategories,
	type UpcomingCategoriesProps,
} from "~/modules/run/run/presentation/UpcomingCategories.ui";

type ShopScreenProps = {
	storage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	stake: GateStake;
	configs: readonly Config[];
	atMinimumWidth: boolean;
	controls: ShopControls;
	busy?: boolean;
	slots: number;
	slotsUsed: number;
	slotsFree: number;
	newConfigIds: readonly string[];
	offers: readonly ShopOffer[];
	upcoming?: UpcomingCategoriesProps;
	onDraft: (configId: string) => void;
	onRebuild: () => void;
	onLock: (configId: string) => void;
	onExtend: () => void;
	onPlantPin: () => void;
	upgradedConfigId?: string;
	onUpgrade: (configId: string) => void;
	onSell: (configId: string) => void;
	slotDeals: SlotsView;
	storagePlan: StoragePlanView;
	onBuySlot: () => void;
	onCashSlot: () => void;
	onSetStoragePlan: (tier: number) => void;
};

export const shopExitLock = (overflowSlots: number): string | undefined =>
	overflowSlots === 0
		? undefined
		: `Over capacity by ${plural(overflowSlots, "slot")}. Minify, uninstall, or rent more room.`;

export const shopExitAction = (
	gate: number,
	overflowSlots: number
): {
	readonly label: string;
	readonly disabled: boolean;
	readonly hint?: string;
} => {
	const lock = shopExitLock(overflowSlots);
	return {
		label: `Continue to gate ${gate} →`,
		disabled: lock !== undefined,
		hint: lock,
	};
};

export const storagePlanTerms = (
	option: StoragePlanView["options"][number]
): string => (option.perGateKb === 0 ? "free" : `${option.perGateKb}KB a gate`);

export const offerRefusalText = (refusal: OfferRefusal): string =>
	refusal.reason === "no-room"
		? `Needs ${refusal.slots} slots — ${refusal.freeSlots} free. Minify or uninstall something`
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

const trackBars = (configs: readonly Config[]) =>
	configs.map((config) => ({
		id: config.id,
		label: config.label,
		slots: slotsOf(config),
		minified: config.minified,
	}));

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
	controls,
	busy = false,
	slots,
	slotsUsed,
	slotsFree,
	newConfigIds,
	offers,
	upcoming,
	onDraft,
	onRebuild,
	onLock,
	onExtend,
	onPlantPin,
	upgradedConfigId,
	onUpgrade,
	onSell,
	slotDeals,
	storagePlan,
	onBuySlot,
	onCashSlot,
	onSetStoragePlan,
}: ShopScreenProps) => {
	const { gateNumber } = stake;
	const {
		shopLocked: locked,
		rebuildCost,
		rebuildAvailable,
		lockAvailable,
		lockCost,
		extendAvailable,
		extendCost,
		pinAvailable,
		pinCost,
		pinnedAtGate,
	} = controls;
	const canRebuild = controls.canRebuild && !busy;
	const canLock = controls.canLock && !busy;
	const canExtend = controls.canExtend && !busy;
	const canPin = controls.canPin && !busy;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const nextGate = swatchForGate(gateNumber);

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

	const offerBadge = ({
		config,
		owned,
		priceKb,
		refusal,
	}: ShopOffer): ReactNode => {
		if (owned)
			return (
				<Badge size="corner">
					<span aria-hidden="true">✓ </span>owned
				</Badge>
			);
		if (refusal?.reason === "no-room")
			return (
				<Badge tone="muted" size="corner">
					needs {plural(slotsOf(config), "slot")}
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
				<Title>Upgrade your build</Title>
				<Subtitle>Expand your build or make it stricter!</Subtitle>
			</header>

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

						<TerminalSection label="Slots">
							<Paragraph as="p" size="xs" tone="muted">
								Room for configs, bought outright. Cashing an empty one refunds
								what that slot cost.
							</Paragraph>
							<div className="flex flex-wrap items-center gap-2 px-1 py-1">
								{actionButton({
									label:
										slotDeals.buy.costKb === undefined
											? "sold out"
											: `buy a slot · ${slotDeals.buy.costKb}KB`,
									onClick: onBuySlot,
									disabled: slotDeals.buy.refusal !== undefined || locked,
								})}
								{actionButton({
									label:
										slotDeals.cash.costKb === undefined
											? "nothing to cash"
											: `cash a slot · +${slotDeals.cash.costKb}KB`,
									onClick: onCashSlot,
									disabled: slotDeals.cash.refusal !== undefined || locked,
								})}
							</div>
							{slotDeals.buy.refusal === undefined ? null : (
								<Paragraph as="p" size="xs" tone="muted">
									{slotDeals.buy.refusal}
								</Paragraph>
							)}
						</TerminalSection>

						<hr className="border-t border-edge" />

						<TerminalSection label="Storage plan">
							<Paragraph as="p" size="xs" tone="muted">
								The cap is what you can hold. A bigger one bills every gate.
							</Paragraph>
							<ul className="flex flex-col">
								{storagePlan.options.map((option) => (
									<li
										key={option.tier}
										className="flex items-center justify-between gap-3 px-1 py-1"
									>
										<span className="flex items-center gap-2">
											<RadioDot checked={option.held} />
											<Paragraph
												as="span"
												size="sm"
												tone={option.held ? undefined : "muted"}
											>
												{capLabel(option.capKb)}
											</Paragraph>
										</span>
										<span className="flex items-center gap-3">
											<Paragraph as="span" size="sm" tone="muted">
												{storagePlanTerms(option)}
											</Paragraph>
											{option.burnsKb > 0 ? (
												<Paragraph as="span" size="sm" tone="cinnabar">
													burns {option.burnsKb}KB
												</Paragraph>
											) : null}
											{actionButton({
												label: option.held ? "on it" : "switch",
												onClick: () => onSetStoragePlan(option.tier),
												disabled: option.held || locked,
											})}
										</span>
									</li>
								))}
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
										Your build for{" "}
										<SwatchLabel
											swatch={nextGate}
											label={`${nextGate.gateName} gate ${gateNumber}`}
											size="md"
										/>
									</>
								) : (
									`Your build for gate ${gateNumber}`
								)
							}
							subtitle={`${slotsUsed} of ${slots} slots used`}
						/>
						<SlotTrack
							configs={trackBars(configs)}
							slots={slots}
							maxSlots={MAX_SLOTS}
							fits={largestSizeFitting(slotsFree)}
						/>
						<RoleList
							rows={roleRows(configs)}
							freeSlots={slotsFree}
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
