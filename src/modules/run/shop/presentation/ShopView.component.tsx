import { WEIGHT } from "~/shared/lib/copy";
import {
	INSTALLED_CARDS_OPEN,
	OFFERED_CARDS_OPEN,
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";
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
import { buildReadingOf } from "~/modules/run/build/application/newRunScreen.viewmodel";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	isServiceUnlocked,
	isSoldInShop,
	REGISTRY_CONTROL_LIST,
	REGISTRY_CONTROLS,
	unlockCaptionOf,
	type ShopSoldId,
	type ShopSoldSpec,
} from "~/modules/run/shop/domain/registryControl.model";
import { kbLabel } from "~/shared/lib/storage";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import {
	ShopScreen,
	type ShopServiceRow,
} from "~/ui/kanto-theme/ShopScreen.ui";

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onRebuild: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onAbandon: () => void;
	onVendorLock: (configId: string) => void;
	onContinue: () => void;
};

const {
	rebuild: REBUILD,
	extend: EXTEND,
	abandon: ABANDON,
	pin: PIN,
} = REGISTRY_CONTROLS;

const TO_PREP = "To prep";
const ABANDON_CONFIRM = "press again to end the run";
const SEPARATOR = "·";
const OVER_MARK = "over the";
const OVER_REMEDY = "the bill covered · sell or drop to fit it";

const offersOf = (
	view: RunView,
	onDraft: (id: string) => void,
	armedId: string | undefined,
	arm: (configId: string) => void,
	point: (configId: string | undefined) => void
): readonly ConfigChipProps[] =>
	view.offers.map((offer) => {
		const armed = armedId === offer.config.id;
		const deal = {
			priceKb: offer.priceKb,
			affordable: offer.installable && offer.refusal === null,
			scale: offer.scale,
			armed,
			onHover: () => point(offer.config.id),
			onLeave: () => point(undefined),
			onInstall:
				offer.scale === null || armed
					? () => onDraft(offer.config.id)
					: () => arm(offer.config.id),
		};
		return offer.heldLevel === null
			? offerChipFor(offer.config, deal)
			: upgradeChipFor(offer.config, offer.heldLevel, deal);
	});

const focusCoverageOf = (view: RunView, config: Config): number =>
	config.focusCategory === undefined
		? 0
		: (view.coverageByCategory[config.focusCategory] ?? 0);

type ServiceHandlers = Pick<
	ShopViewProps,
	"onRebuild" | "onExtend" | "onPlantPin" | "onAbandon"
> & {
	abandonArmed: boolean;
	onArmAbandon: () => void;
};

const stagedRowFor = (
	control: ShopSoldSpec,
	view: RunView,
	handlers: ServiceHandlers
): ShopServiceRow | undefined => {
	const { shopControls, storage } = view;
	const cleared = view.gatePayout.clearedGateNumber;
	const rows: Record<ShopSoldId, () => ShopServiceRow | undefined> = {
		rebuild: () =>
			shopControls.rebuildAvailable
				? {
						id: REBUILD.id,
						...controlRowFor(
							REBUILD.glyph,
							REBUILD.title,
							REBUILD.detail,
							shopControls.rebuildCost,
							storage,
							shopControls.canRebuild ? handlers.onRebuild : undefined
						),
					}
				: undefined,
		extend: () =>
			shopControls.extendAvailable
				? {
						id: EXTEND.id,
						...controlRowFor(
							EXTEND.glyph,
							EXTEND.title,
							EXTEND.detail,
							shopControls.extendCost,
							storage,
							shopControls.canExtend ? handlers.onExtend : undefined
						),
					}
				: undefined,
		hotReload: () => undefined,
		returnPolicy: () => undefined,
		abandon: () => ({
			id: ABANDON.id,
			glyph: ABANDON.glyph,
			title: ABANDON.title,
			detail: handlers.abandonArmed ? ABANDON_CONFIRM : ABANDON.detail,
			onPress: handlers.abandonArmed
				? handlers.onAbandon
				: handlers.onArmAbandon,
		}),
		pin: () =>
			shopControls.pinAvailable
				? {
						id: PIN.id,
						...controlRowFor(
							PIN.glyph,
							`${PIN.title} ${SEPARATOR} gate ${cleared + 1}`,
							PIN.detail,
							shopControls.pinCost,
							storage,
							shopControls.canPin ? handlers.onPlantPin : undefined
						),
					}
				: undefined,
	};
	return rows[control.id]();
};

const lockedRowFor = (control: ShopSoldSpec): ShopServiceRow | undefined => {
	const unlock = unlockCaptionOf(control);
	return unlock === undefined
		? undefined
		: {
				id: control.id,
				locked: true,
				glyph: control.glyph,
				title: control.title,
				detail: control.detail,
				unlock,
			};
};

const controlsOf = (
	view: RunView,
	handlers: ServiceHandlers
): readonly ShopServiceRow[] =>
	REGISTRY_CONTROL_LIST.filter(isSoldInShop).flatMap((control) => {
		const row = isServiceUnlocked(control, view.unlockedServiceIds)
			? stagedRowFor(control, view, handlers)
			: lockedRowFor(control);
		return row === undefined ? [] : [row];
	});

export const ShopView = ({
	view,
	onDraft,
	onSell,
	onUpgrade,
	onRebuild,
	onExtend,
	onPlantPin,
	onAbandon,
	onVendorLock,
	onContinue,
}: ShopViewProps) => {
	const [buildFlips, setBuildFlips] = useState<ReadonlySet<string>>(new Set());
	const [offerFlips, setOfferFlips] = useState<ReadonlySet<string>>(new Set());
	const [abandonArmed, setAbandonArmed] = useState(false);
	const [openUpgrades, setOpenUpgrades] = useState<string | undefined>(
		undefined
	);
	const [armedId, setArmedId] = useState<string | undefined>(undefined);
	const [pointedId, setPointedId] = useState<string | undefined>(undefined);

	const buildNames = view.configs.map((config) => config.label);
	const offerNames = view.offers.map((offer) => offer.config.label);

	const buildOpen = disclosedIn(buildNames, buildFlips, INSTALLED_CARDS_OPEN);
	const offersOpen = disclosedIn(offerNames, offerFlips, OFFERED_CARDS_OPEN);

	const toggleBuild = (name: string) =>
		setBuildFlips(toggleDisclosure(buildFlips, name));

	const toggleOffer = (name: string) =>
		setOfferFlips(toggleDisclosure(offerFlips, name));

	const toggleAllBuild = () =>
		setBuildFlips(
			discloseAll(
				buildNames,
				buildOpen.size < buildNames.length,
				INSTALLED_CARDS_OPEN
			)
		);

	const toggleAllOffers = () =>
		setOfferFlips(
			discloseAll(
				offerNames,
				offersOpen.size < offerNames.length,
				OFFERED_CARDS_OPEN
			)
		);

	const toggleUpgrades = (name: string) =>
		setOpenUpgrades(name === openUpgrades ? undefined : name);

	const armed = view.offers.find((offer) => offer.config.id === armedId);
	const pointed = view.offers.find((offer) => offer.config.id === pointedId);
	const disarming = (press: () => void) => () => {
		setAbandonArmed(false);
		press();
	};
	const overSpace = view.overflowSlots > 0;
	const needsVendor = view.vendorLock.offered;

	return (
		<ShopScreen
			header={shopHeaderFor(
				view.gatePayout.clearedGateNumber,
				view.storage,
				view.swatchGates,
				pointed?.priceKb
			)}
			nextGate={nextGateFor(
				view.gatePayout.clearedGateNumber,
				view.gateStake.unitsHeld
			)}
			controls={controlsOf(view, {
				onRebuild: disarming(onRebuild),
				onExtend: disarming(onExtend),
				onPlantPin: disarming(onPlantPin),
				onAbandon,
				abandonArmed,
				onArmAbandon: () => setAbandonArmed(true),
			})}
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
				openInfo: buildOpen,
				onToggleInfo: toggleBuild,
				onToggleAll: toggleAllBuild,
				openUpgrades,
				onToggleUpgrades: toggleUpgrades,
			}}
			registry={{
				offers: offersOf(view, onDraft, armedId, setArmedId, setPointedId),
				slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
				openInfo: offersOpen,
				onToggleInfo: toggleOffer,
				onToggleAll: toggleAllOffers,
				openUpgrades,
				onToggleUpgrades: toggleUpgrades,
			}}
			footer={{
				action: {
					label: TO_PREP,
					swatch: {
						state: "current",
						swatch: gateSwatchAt(view.gatePayout.clearedGateNumber + 1),
					},
					onPress: overSpace || needsVendor ? undefined : onContinue,
				},
				note: buildReadingOf({
					configs: view.configs.length,
					held: view.buildSpace.weight,
					slots: view.buildSpace.space,
				}),
				refusal: overSpace
					? `${view.overflowSlots} ${WEIGHT} ${OVER_MARK} ${view.buildSpace.coveredSpace} ${OVER_REMEDY}`
					: needsVendor
						? VENDOR_REMEDY
						: undefined,
			}}
		/>
	);
};
