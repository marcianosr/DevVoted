import { useState } from "react";

import { DRAFT_COST_PER_SLOT_KB } from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	buildChipFor,
	controlRowFor,
	nextGateFor,
	offerChipFor,
	shopHeaderFor,
	slotDealsFor,
	upgradeChipFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { kbLabel } from "~/shared/lib/storage";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import { ShopScreen } from "~/ui/kanto-theme/ShopScreen.ui";

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onRebuild: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onBuySlot: () => void;
	onCashSlot: () => void;
	onSetStoragePlan: (tier: number) => void;
	onContinue: () => void;
};

const REBUILD = {
	glyph: "↻",
	title: "Rebuild the registry",
	detail: "deals a fresh set of offers",
};
const EXTEND = {
	glyph: "+",
	title: "Extend the registry",
	detail: "one more offer, now and every shop after",
};
const PIN = { glyph: "⚑", detail: "if this run dies, the next resumes here" };
const PLAN = { glyph: "☁", detail: "raises the cap the run can hold" };

const TO_PREP = "To prep";
const OVER_CAPACITY = "the build is over capacity";
const SEPARATOR = "·";

const offersOf = (
	view: RunView,
	onDraft: (id: string) => void,
	onUpgrade: (id: string) => void
): readonly ConfigChipProps[] =>
	view.offers.map((offer) =>
		offer.upgrades
			? upgradeChipFor(offer.config, () => onUpgrade(offer.config.id))
			: offerChipFor(offer.config, {
					priceKb: offer.priceKb,
					affordable: offer.installable && offer.refusal === null,
					onInstall: () => onDraft(offer.config.id),
				})
	);

const controlsOf = (
	view: RunView,
	handlers: Pick<
		ShopViewProps,
		"onRebuild" | "onExtend" | "onPlantPin" | "onSetStoragePlan"
	>
): readonly RegistryControlProps[] => {
	const { shopControls, storage } = view;
	const cleared = view.gatePayout.clearedGateNumber;

	return [
		...(shopControls.rebuildAvailable
			? [
					controlRowFor(
						REBUILD.glyph,
						REBUILD.title,
						REBUILD.detail,
						shopControls.rebuildCost,
						storage,
						shopControls.canRebuild ? handlers.onRebuild : undefined
					),
				]
			: []),
		...(shopControls.extendAvailable
			? [
					controlRowFor(
						EXTEND.glyph,
						EXTEND.title,
						EXTEND.detail,
						shopControls.extendCost,
						storage,
						shopControls.canExtend ? handlers.onExtend : undefined
					),
				]
			: []),
		...(shopControls.pinAvailable
			? [
					controlRowFor(
						PIN.glyph,
						`git tag ${SEPARATOR} gate ${cleared + 1}`,
						PIN.detail,
						shopControls.pinCost,
						storage,
						shopControls.canPin ? handlers.onPlantPin : undefined
					),
				]
			: []),
		...view.storagePlan.options
			.filter((option) => option.revealed && !option.held)
			.map((option) =>
				controlRowFor(
					PLAN.glyph,
					`storage plan ${option.tier} ${SEPARATOR} cap ${kbLabel(option.capKb)}`,
					`${PLAN.detail} ${SEPARATOR} bills ${kbLabel(option.perGateKb)} a gate`,
					option.burnsKb,
					storage,
					option.affordable
						? () => handlers.onSetStoragePlan(option.tier)
						: undefined
				)
			),
	];
};

export const ShopView = ({
	view,
	onDraft,
	onSell,
	onUpgrade,
	onRebuild,
	onExtend,
	onPlantPin,
	onBuySlot,
	onCashSlot,
	onSetStoragePlan,
	onContinue,
}: ShopViewProps) => {
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);

	const toggleInfo = (name: string) =>
		setOpenInfo(name === openInfo ? undefined : name);

	const overCapacity = view.overflowSlots > 0;

	return (
		<ShopScreen
			header={shopHeaderFor(view.gatePayout.clearedGateNumber, view.storage)}
			nextGate={nextGateFor(
				view.gatePayout.clearedGateNumber,
				view.gateStake.unitsHeld
			)}
			controls={controlsOf(view, {
				onRebuild,
				onExtend,
				onPlantPin,
				onSetStoragePlan,
			})}
			build={{
				configs: view.configs.map((config) =>
					buildChipFor(config, () => onSell(config.id))
				),
				slots: { used: view.slotsUsed, capacity: view.slots },
				...slotDealsFor(
					view.slots,
					view.storage,
					view.slotDeals.buy,
					view.slotDeals.cash,
					onBuySlot,
					onCashSlot
				),
				openInfo,
				onToggleInfo: toggleInfo,
			}}
			registry={{
				offers: offersOf(view, onDraft, onUpgrade),
				slotPrice: `${kbLabel(DRAFT_COST_PER_SLOT_KB)} a slot`,
				openInfo,
				onToggleInfo: toggleInfo,
			}}
			footer={{
				action: {
					label: TO_PREP,
					icon: "gate",
					onPress: overCapacity ? undefined : onContinue,
				},
				refusal: overCapacity
					? `${OVER_CAPACITY} by ${view.overflowSlots}`
					: undefined,
			}}
		/>
	);
};
