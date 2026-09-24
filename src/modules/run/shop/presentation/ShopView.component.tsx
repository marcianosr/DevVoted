import { WEIGHT } from "~/shared/lib/copy";
import { useState } from "react";

import type { Config } from "~/modules/run/config/domain/config.model";
import { DRAFT_COST_PER_SLOT_KB } from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	buildChipFor,
	controlRowFor,
	nextGateFor,
	offerChipFor,
	shopHeaderFor,
	upgradeChipFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { VENDOR_REMEDY } from "~/modules/run/build/application/vendorChip.viewmodel";
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
	onVendorLock: (configId: string) => void;
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

const TO_PREP = "To prep";
const SEPARATOR = "·";
const OVER_MARK = "over the";
const OVER_REMEDY = "the bill covered · sell or drop to fit it";

const offersOf = (
	view: RunView,
	onDraft: (id: string) => void,
	armedId: string | undefined,
	arm: (configId: string) => void
): readonly ConfigChipProps[] =>
	view.offers.map((offer) => {
		const armed = armedId === offer.config.id;
		const deal = {
			priceKb: offer.priceKb,
			affordable: offer.installable && offer.refusal === null,
			scale: offer.scale,
			armed,
			// The rung an install rents is a cost no button can state, so the first
			// press states it and the second agrees to it. An install that stays
			// inside the rung already rented has nothing to state and commits at once.
			onInstall:
				offer.scale === null || armed
					? () => onDraft(offer.config.id)
					: () => arm(offer.config.id),
		};
		return offer.heldLevel === null
			? offerChipFor(offer.config, deal)
			: upgradeChipFor(offer.config, offer.heldLevel, deal);
	});

/**
 * A config with no focus category has no coverage gate to answer, so the figure
 * it reports is never read; zero keeps the deal one shape either way.
 */
const focusCoverageOf = (view: RunView, config: Config): number =>
	config.focusCategory === undefined
		? 0
		: (view.coverageByCategory[config.focusCategory] ?? 0);

const controlsOf = (
	view: RunView,
	handlers: Pick<ShopViewProps, "onRebuild" | "onExtend" | "onPlantPin">
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
	onVendorLock,
	onContinue,
}: ShopViewProps) => {
	const [openInfo, setOpenInfo] = useState<string | undefined>(undefined);
	const [openUpgrades, setOpenUpgrades] = useState<string | undefined>(
		undefined
	);
	const [armedId, setArmedId] = useState<string | undefined>(undefined);

	// One panel at a time across both columns: the chip already ranks upgrades
	// over info, and two open panels would argue about which the player meant.
	const toggleInfo = (name: string) => {
		setOpenUpgrades(undefined);
		setOpenInfo(name === openInfo ? undefined : name);
	};

	const toggleUpgrades = (name: string) => {
		setOpenInfo(undefined);
		setOpenUpgrades(name === openUpgrades ? undefined : name);
	};

	const armed = view.offers.find((offer) => offer.config.id === armedId);
	// Only ever self-inflicted, and only after a bill the balance could not
	// cover: the run is held to the space it actually paid for until it fits.
	const overSpace = view.overflowSlots > 0;
	const needsVendor = view.vendorLock.offered;

	return (
		<ShopScreen
			header={shopHeaderFor(
				view.gatePayout.clearedGateNumber,
				view.storage,
				view.swatchGates
			)}
			nextGate={nextGateFor(
				view.gatePayout.clearedGateNumber,
				view.gateStake.unitsHeld,
				view.gateStake.perAnswer.coveragePerCorrect
			)}
			controls={controlsOf(view, { onRebuild, onExtend, onPlantPin })}
			build={{
				configs: view.configs.map((config) =>
					buildChipFor(
						config,
						() => onSell(config.id),
						{
							locked: view.vendorLock.lockedConfigId === config.id,
							onLock:
								view.vendorLock.offered && config.vendorLocks !== true
									? () => onVendorLock(config.id)
									: undefined,
						},
						{
							storageKb: view.storage,
							coveragePct: focusCoverageOf(view, config),
							onBuy: () => onUpgrade(config.id),
						}
					)
				),
				weight: {
					held: view.buildSpace.space,
					perGateKb: view.buildSpace.perGateKb,
					...(view.buildSpace.nextWeight === undefined ||
					view.buildSpace.nextPerGateKb === undefined
						? {}
						: {
								next: {
									weight: view.buildSpace.nextWeight,
									kb: view.buildSpace.nextPerGateKb,
								},
							}),
					...(armed?.scale == null
						? {}
						: {
								preview: {
									weight: view.buildSpace.weight + armed.slots,
									held: armed.scale.to,
									perGateKb: armed.scale.perGateKb,
								},
							}),
				},
				openInfo,
				onToggleInfo: toggleInfo,
				openUpgrades,
				onToggleUpgrades: toggleUpgrades,
			}}
			registry={{
				offers: offersOf(view, onDraft, armedId, setArmedId),
				slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
				openInfo,
				onToggleInfo: toggleInfo,
				openUpgrades,
				onToggleUpgrades: toggleUpgrades,
			}}
			footer={{
				action: {
					label: TO_PREP,
					icon: "gate",
					onPress: overSpace || needsVendor ? undefined : onContinue,
				},
				refusal: overSpace
					? `${view.overflowSlots} ${WEIGHT} ${OVER_MARK} ${view.buildSpace.coveredSpace} ${OVER_REMEDY}`
					: needsVendor
						? VENDOR_REMEDY
						: undefined,
			}}
		/>
	);
};
