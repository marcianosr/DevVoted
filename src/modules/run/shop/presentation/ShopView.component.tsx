import { useState } from "react";

import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	isUpgradable,
	slotsOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import type {
	RunView,
	ShopOffer,
	SlotDealView,
	StoragePlanOption,
} from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { coverageFor } from "~/modules/run/run/presentation/PollView.component";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import { offerRefusalText } from "~/modules/run/shop/presentation/ShopScreen.ui";
import {
	ShopScreen,
	type ArmedAction,
	type PlanTier,
	type ShopBuildRow,
	type ShopOfferRow,
} from "~/ui/terminal-theme/screens/ShopScreen.ui";
import type { BuyLineProps } from "~/ui/terminal-theme/BuyLine.ui";
import { plural } from "~/ui/terminal-theme/format";

const kb = (value: number) => `${value} KB`;

const capLabel = (capKb: number) =>
	capKb >= 1024 ? `${Math.round((capKb / 1024) * 10) / 10} MB` : kb(capKb);

const versionOf = (config: Config) => `v${config.level ?? 1}`;

type Armed = {
	readonly configId: string;
	readonly action: ArmedAction["action"];
};

const upgradeShortfalls = (
	view: RunView,
	config: Config
): readonly string[] => {
	const level = config.level ?? 1;
	const category = config.focusCategory;
	const cost = upgradeStorageCost(level);
	const required = upgradeCoverageRequired(level);
	const held = category ? (view.coverageByCategory[category] ?? 0) : 0;

	return [
		...(view.storage >= cost
			? []
			: [`Costs ${kb(cost)}, you have ${kb(view.storage)}.`]),
		...(category === undefined || held >= required
			? []
			: [
					`Unlocks at ${required}% ${getCategoryMetadata(category).name} coverage, you have ${held}%.`,
				]),
	];
};

const planTier = (
	option: StoragePlanOption,
	onSetPlan: (tier: number) => void,
	locked: boolean
): PlanTier => ({
	cap: capLabel(option.capKb),
	rate: option.perGateKb === 0 ? "free" : `${option.perGateKb} KB a gate`,
	current: option.held,
	onPick: option.held || locked ? undefined : () => onSetPlan(option.tier),
});

const offerRefused = (offer: ShopOffer) =>
	offer.owned || offer.refusal !== null;

const slotLine = (
	deal: SlotDealView,
	label: string,
	onUse: () => void,
	locked: boolean
): BuyLineProps | undefined => {
	if (deal.costKb === undefined) return undefined;
	return {
		label,
		detail: deal.refusal,
		price: kb(deal.costKb),
		onBuy: deal.refusal === undefined && !locked ? onUse : undefined,
	};
};

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onLock: (configId: string) => void;
	onRebuild: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onBuySlot: () => void;
	onCashSlot: () => void;
	onSetStoragePlan: (tier: number) => void;
	onContinue: () => void;
};

export const ShopView = ({
	view,
	onDraft,
	onSell,
	onUpgrade,
	onLock,
	onRebuild,
	onExtend,
	onPlantPin,
	onBuySlot,
	onCashSlot,
	onSetStoragePlan,
	onContinue,
}: ShopViewProps) => {
	const [armed, setArmed] = useState<Armed | null>(null);
	const disarm = () => setArmed(null);
	const arm = (configId: string, action: ArmedAction["action"]) => () =>
		setArmed({ configId, action });

	const { shopControls } = view;
	const locked = shopControls.shopLocked;
	const nextGate = view.gateStake.gateNumber;
	const swatch = swatchForGate(nextGate);

	const armedFor = (config: Config): ArmedAction | undefined => {
		if (armed?.configId !== config.id) return undefined;
		const confirming = armed.action;

		return {
			action: confirming,
			confirmLabel:
				confirming === "upgrade"
					? `Confirm upgrade of ${config.label}`
					: `Confirm uninstall of ${config.label}`,
			cancelLabel: "Cancel",
			note:
				confirming === "upgrade"
					? upgradeShortfalls(view, config).join(" ")
					: `Refunds ${kb(sellRefundIn(view.configs, config))}`,
			onConfirm: () => {
				disarm();
				if (confirming === "upgrade") return onUpgrade(config.id);
				return onSell(config.id);
			},
			onCancel: disarm,
		};
	};

	const buildRows: readonly ShopBuildRow[] = view.configs.map((config) => {
		const level = config.level ?? 1;
		const ready = upgradeShortfalls(view, config).length === 0;

		return {
			family: config.family,
			name: config.label,
			detail: config.description,
			slots: slotsOf(config),
			version: versionOf(config),
			maxed: !isUpgradable(config),
			upgrade: isUpgradable(config)
				? {
						version: `v${level + 1}`,
						changes: [{ from: `v${level}`, to: `v${level + 1}` }],
						price: kb(upgradeStorageCost(level)),
						label: `Upgrade ${config.label}`,
						onArm: ready && !locked ? arm(config.id, "upgrade") : undefined,
					}
				: undefined,
			remove: {
				label: `Uninstall ${config.label}`,
				value: kb(sellRefundIn(view.configs, config)),
				onArm:
					view.atMinimumWidth || locked ? undefined : arm(config.id, "remove"),
			},
			armed: armedFor(config),
		};
	});

	const offerRows: readonly ShopOfferRow[] = view.offers.map((offer) => ({
		family: offer.config.family,
		name: offer.config.label,
		detail:
			offer.refusal === null
				? offer.config.description
				: offerRefusalText(offer.refusal),
		slots: slotsOf(offer.config),
		price: kb(offer.priceKb),
		buyLabel: offer.owned
			? `${offer.config.label} is installed`
			: `Install ${offer.config.label}`,
		onBuy:
			offerRefused(offer) || locked
				? undefined
				: () => onDraft(offer.config.id),
		refused: offerRefused(offer),
		lock: shopControls.lockAvailable
			? {
					pinned: shopControls.lockedOfferIds.includes(offer.config.id),
					label: `Keep ${offer.config.label} for the next shop`,
					onToggle:
						shopControls.canLock && !locked
							? () => onLock(offer.config.id)
							: undefined,
				}
			: undefined,
	}));

	return (
		<ShopScreen
			theme={view.gateTheme}
			header={{
				title: `${swatch?.gateName ?? "The"} shop`,
				subtitle: `before gate ${nextGate}`,
				swatch: swatch?.theme,
				swatchState: "pending",
				value: kb(view.storage),
				caption: "balance",
				coverage: coverageFor(view),
			}}
			notice={
				locked
					? `Shop closed. 405 Method Not Allowed audits the build you already have, so nothing can be bought, sold or switched before gate ${nextGate}.`
					: undefined
			}
			storage={{
				meta: `${view.slotsUsed} of ${plural(view.slots, "slot")}`,
				slots: view.slots,
			}}
			build={{
				meta: `${view.configs.length}`,
				rows: buildRows,
				buySlot: slotLine(
					view.slotDeals.buy,
					`Buy slot ${view.slots + 1}`,
					onBuySlot,
					locked
				),
				cashSlot: slotLine(
					view.slotDeals.cash,
					`Cash slot ${view.slots}`,
					onCashSlot,
					locked
				),
			}}
			offers={{
				meta: `${plural(view.offers.length, "offer")}${
					shopControls.lockedOfferIds.length === 0
						? ""
						: ` · ${shopControls.lockedOfferIds.length} kept`
				}`,
				rows: offerRows,
				extend: shopControls.extendAvailable
					? {
							note: "one more offer, here and every shop after",
							label: "Extend",
							price: kb(shopControls.extendCost),
							onExtend:
								shopControls.canExtend && !locked ? onExtend : undefined,
						}
					: undefined,
				rebuild: {
					label: "Rebuild offers",
					price: kb(shopControls.rebuildCost),
					onBuy:
						shopControls.rebuildAvailable && shopControls.canRebuild && !locked
							? onRebuild
							: undefined,
				},
			}}
			plan={{
				meta: capLabel(view.storagePlan.capKb),
				note:
					view.storagePlan.perGateKb === 0
						? "The free rung costs nothing a gate."
						: `The rung you hold bills ${view.storagePlan.perGateKb} KB a gate, pass or fail.`,
				tiers: view.storagePlan.options.map((option) =>
					planTier(option, onSetStoragePlan, locked)
				),
			}}
			gitTag={
				shopControls.pinAvailable
					? {
							label: "Buy a git tag",
							detail: `If this run dies, the next one checks out at gate ${nextGate} instead of gate 0. One per run.`,
							price: kb(shopControls.pinCost),
							onBuy: shopControls.canPin && !locked ? onPlantPin : undefined,
						}
					: undefined
			}
			continueLabel={`To ${swatch?.gateName ?? "the gate"} →`}
			continueLock={
				view.overflowSlots > 0
					? `Over capacity by ${plural(view.overflowSlots, "slot")}`
					: undefined
			}
			onContinue={onContinue}
		/>
	);
};
