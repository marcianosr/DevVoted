import { useState } from "react";

import { kbLabel } from "~/shared/lib/storage";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	abArmLabel,
	type Config,
	describeConfig,
	isUpgradable,
	maxLevelOf,
	levelUp,
	otherArmOf,
	slotsOf,
	upgradeCoverageRequired,
	upgradePreview,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import type {
	RunView,
	ShopOffer,
	StoragePlanView,
} from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	coverageFor,
	storageGaugeFor,
} from "~/modules/run/run/presentation/PollView.component";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import { offerRefusalText } from "~/modules/run/shop/presentation/ShopScreen.ui";
import {
	ShopScreen,
	type ArmedAction,
	type ShopBuildRow,
	type ShopOfferRow,
} from "~/ui/terminal-theme/screens/ShopScreen.ui";
import type { SlotDealRow } from "~/ui/terminal-theme/SlotDeal.ui";
import type { StoragePlanProps } from "~/ui/terminal-theme/StoragePlan.ui";
import { plural } from "~/ui/terminal-theme/format";

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
			: [`Costs ${kbLabel(cost)}, you have ${kbLabel(view.storage)}.`]),
		...(category === undefined || held >= required
			? []
			: [
					`Unlocks at ${required}% ${getCategoryMetadata(category).name} coverage, you have ${held}%.`,
				]),
	];
};

// A hidden rung says what opens it, never what it is: the cap named is the one
// already on the shelf, so the reading leaks nothing about the rung above.
const opensAtLabel = (opensAtKb: number, peakKb: number): string =>
	peakKb === 0
		? `opens at ${kbLabel(opensAtKb)} held`
		: `opens at ${kbLabel(opensAtKb)} held · best ${kbLabel(peakKb)}`;

const storagePlanProps = (
	plan: StoragePlanView,
	heldKb: number,
	onSetPlan: (tier: number) => void,
	locked: boolean
): StoragePlanProps => {
	const heldIndex = Math.max(
		0,
		plan.options.findIndex((option) => option.held)
	);

	return {
		meter: {
			heldKb,
			capKb: plan.capKb,
			nextCapKb: plan.options.at(heldIndex + 1)?.capKb,
		},
		cards: plan.options.map((option) => {
			const selectable =
				option.revealed && !option.held && !locked && option.affordable;

			return {
				capKb: option.capKb,
				rentKb: option.perGateKb,
				held: option.held,
				revealed: option.revealed,
				requirement:
					option.opensAtKb === undefined
						? undefined
						: opensAtLabel(option.opensAtKb, plan.peakKb),
				burnsKb: option.burnsKb,
				refusal:
					option.revealed && !option.held && !option.affordable
						? `bills ${kbLabel(option.perGateKb)} a gate, you hold ${kbLabel(heldKb)}`
						: undefined,
				onSelect: selectable ? () => onSetPlan(option.tier) : undefined,
			};
		}),
	};
};

const storageMeta = (view: RunView) =>
	view.overflowSlots > 0
		? `${view.slotsUsed} of ${view.slots} · over by ${view.overflowSlots}`
		: `${view.slotsUsed} of ${view.slots} · ${view.slotsFree} free`;

const offerRefused = (offer: ShopOffer) =>
	offer.owned || offer.refusal !== null;

const swapFor = (
	config: Config,
	locked: boolean,
	onSwitchArm: (configId: string) => void
): ShopBuildRow["swap"] => {
	const arm = otherArmOf(config);
	if (arm === undefined) return undefined;
	return {
		label: `Ship arm ${abArmLabel(arm)}`,
		onUse: locked ? undefined : () => onSwitchArm(config.id),
	};
};

const slotRows = (
	view: RunView,
	locked: boolean,
	onBuySlot: () => void,
	onCashSlot: () => void
): readonly SlotDealRow[] => {
	const { buy, cash } = view.slotDeals;

	return [
		...(cash.costKb === undefined
			? []
			: [
					{
						name:
							view.slotsFree > 0
								? `Slot ${view.slots} · empty`
								: `Slot ${view.slots}`,
						label: `Cash slot ${view.slots}`,
						detail: cash.refusal,
						price: kbLabel(cash.costKb),
						receives: true,
						onUse:
							cash.refusal === undefined && !locked ? onCashSlot : undefined,
					},
				]),
		...(buy.costKb === undefined
			? []
			: [
					{
						name: `Slot ${view.slots + 1}`,
						label: `Buy slot ${view.slots + 1}`,
						detail: buy.refusal,
						price: kbLabel(buy.costKb),
						onUse: buy.refusal === undefined && !locked ? onBuySlot : undefined,
					},
				]),
	];
};

const offerLockFor = (
	offer: ShopOffer,
	controls: RunView["shopControls"],
	locked: boolean,
	onLock: (configId: string) => void,
	onUnlock: (configId: string) => void
): ShopOfferRow["lock"] => {
	if (!controls.lockAvailable || offer.upgrades) return undefined;
	const pinned = controls.lockedOfferIds.includes(offer.config.id);
	if (pinned)
		return {
			pinned,
			label: "Release the lock",
			onToggle: locked ? undefined : () => onUnlock(offer.config.id),
		};
	return {
		pinned,
		label: `Lock for ${kbLabel(controls.lockCost)}`,
		onToggle:
			controls.canLock && !locked ? () => onLock(offer.config.id) : undefined,
	};
};

const planBillLock = (view: RunView): string | undefined =>
	view.storagePlan.perGateKb > view.storage
		? `Storage plan bills ${kbLabel(view.storagePlan.perGateKb)} a gate, you hold ${kbLabel(view.storage)}`
		: undefined;

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onSwitchArm: (configId: string) => void;
	onLock: (configId: string) => void;
	onUnlock: (configId: string) => void;
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
	onSwitchArm,
	onLock,
	onUnlock,
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
				confirming === "upgrade" ? "Confirm upgrade" : "Confirm uninstall",
			cancelLabel: "Cancel",
			note:
				confirming === "upgrade"
					? describeConfig(levelUp(config))
					: `Refunds ${kbLabel(sellRefundIn(view.configs, config))}`,
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
			name: config.label,
			detail: describeConfig(config),
			slots: slotsOf(config),
			version: level,
			maxVersion: maxLevelOf(config),
			maxed: !isUpgradable(config),
			upgrade: isUpgradable(config)
				? {
						version: `v${level + 1}`,
						changes: upgradePreview(config),
						price: kbLabel(upgradeStorageCost(level)),
						label: "Upgrade",
						reason: ready
							? undefined
							: upgradeShortfalls(view, config).join(" "),
						onArm: ready && !locked ? arm(config.id, "upgrade") : undefined,
					}
				: undefined,
			remove: {
				label: "Uninstall",
				value: kbLabel(sellRefundIn(view.configs, config)),
				onArm:
					view.atMinimumWidth || locked ? undefined : arm(config.id, "remove"),
			},
			swap: swapFor(config, locked, onSwitchArm),
			armed: armedFor(config),
		};
	});

	const offerRows: readonly ShopOfferRow[] = view.offers.map((offer) => ({
		name: offer.config.label,
		detail: describeConfig(offer.config),
		...(offer.refusal === null
			? {}
			: { refusal: offerRefusalText(offer.refusal) }),
		slots: slotsOf(offer.config),
		version: offer.config.level ?? 1,
		maxVersion: maxLevelOf(offer.config),
		upgrades: offer.upgrades,
		price: kbLabel(offer.priceKb),
		buyLabel: offer.owned
			? "Installed"
			: offer.upgrades
				? "Upgrade"
				: "Install",
		onBuy:
			offerRefused(offer) || locked
				? undefined
				: () => onDraft(offer.config.id),
		refused: offerRefused(offer),
		lock: offerLockFor(offer, shopControls, locked, onLock, onUnlock),
	}));

	return (
		<ShopScreen
			theme={view.gateTheme}
			header={{
				title: `${swatch?.gateName ?? "The"} shop`,
				subtitle: `before gate ${nextGate}`,
				swatch: swatch?.theme,
				swatchState: "pending",
				value: kbLabel(view.storage),
				caption: "balance",
				gauge: storageGaugeFor(view),
				coverage: coverageFor(view),
			}}
			notice={
				locked
					? `Shop closed. 405 Method Not Allowed audits the build you already have, so nothing can be bought, sold or switched before gate ${nextGate}.`
					: undefined
			}
			storage={{
				meta: storageMeta(view),
				slots: view.slots,
			}}
			build={{
				meta: `${view.configs.length}`,
				rows: buildRows,
				slotRows: slotRows(view, locked, onBuySlot, onCashSlot),
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
							price: kbLabel(shopControls.extendCost),
							onExtend:
								shopControls.canExtend && !locked ? onExtend : undefined,
						}
					: undefined,
				rebuild: {
					label: "Rebuild offers",
					price: kbLabel(shopControls.rebuildCost),
					lock: shopControls.rebuildAvailable
						? undefined
						: "Config list exhausted!",
					onBuy:
						shopControls.rebuildAvailable && shopControls.canRebuild && !locked
							? onRebuild
							: undefined,
				},
			}}
			plan={storagePlanProps(
				view.storagePlan,
				view.storage,
				onSetStoragePlan,
				locked
			)}
			gitTag={
				shopControls.pinAvailable
					? {
							label: "Buy a git tag",
							detail: `If this run dies, the next one checks out at gate ${nextGate} instead of gate 0. One per run.`,
							price: kbLabel(shopControls.pinCost),
							onBuy: shopControls.canPin && !locked ? onPlantPin : undefined,
						}
					: undefined
			}
			continueLabel={`To ${swatch?.gateName ?? "the gate"} →`}
			continueLock={
				view.overflowSlots > 0
					? `Over capacity by ${plural(view.overflowSlots, "slot")}`
					: planBillLock(view)
			}
			onContinue={onContinue}
		/>
	);
};
