import type { InstallScale } from "~/modules/run/run/application/runView.viewmodel";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	isUpgradable,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	type BuildUpgradeDeal,
	chipFor,
	infoFor,
	registryUpgradesFor,
	rollOddsLabel,
	upgradesFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import { offerOddsOf } from "~/modules/run/shop/domain/draft.model";
import {
	type VendorLockChip,
	vendorChipFor,
} from "~/modules/run/build/application/vendorChip.viewmodel";
import {
	fundsOf,
	BALANCE_WORD,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";
import { kbLabel } from "~/shared/lib/storage";

import type {
	ChipInstall,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { NextGateProps } from "~/ui/kanto-theme/NextGate.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import {
	bandFor,
	healthyAt,
	percentOf,
	runCoverageOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";

const SHORT_TRAIL = "short";
const CLEARED_TRAIL = "cleared";
const SHOP_WORD = "Shop";
const SLOTS_TRAIL = "slots after it closes";
const OPENS_AT = "tomorrow";
const PERCENT = "%";

export const shortfallOf = (priceKb: number, balanceKb: number): string =>
	`${kbLabel(priceKb - balanceKb)} ${SHORT_TRAIL}`;

export type OfferDeal = {
	priceKb: number;
	affordable: boolean;
	onInstall?: () => void;
	/** Present only when this install would cross a rung (ADR-098). */
	scale?: InstallScale | null;
	armed?: boolean;
};

/**
 * The price rides the Install button rather than a badge beside it, so the one
 * install affordance reads the same here as it does on the new-run hand.
 *
 * An install that changes the standing bill arms first: the price on the press
 * is what the config costs once, and the rung it rents is what it costs every
 * gate after. Only the first of those fits on a button.
 */
const offerInstallFor = ({
	priceKb,
	affordable,
	onInstall,
	scale,
	armed,
}: OfferDeal): ChipInstall => ({
	price: kbLabel(priceKb),
	disabled: !affordable,
	onPress: onInstall,
	...(scale === null || scale === undefined ? {} : { scale, armed }),
});

export const offerChipFor = (
	config: Config,
	deal: OfferDeal
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [],
	skipped: !deal.affordable,
	install: offerInstallFor(deal),
	info: infoFor(config),
});

/**
 * A rolled upgrade sells through the same `draft` press as any offer, so the
 * deal is the install deal; the odds beside the pennant say how lucky the roll
 * was, at rest, because the kit's hints are aria-labels nobody can see.
 */
export const upgradeChipFor = (
	offer: Config,
	heldLevel: number,
	{ priceKb, affordable, onInstall }: OfferDeal
): ConfigChipProps => {
	const share = offerOddsOf(heldLevel, offer);

	return {
		name: offer.label,
		slots: slotsOf(offer),
		/**
		 * The version held, never the one on sale. A pennant means "this is what
		 * you have" on the Build panel, and reading the offered rung here made
		 * the same glyph mean "this is what is for sale" — so a v2 offer showed
		 * `v2` beside a press offering v2, which reads as already owning it. The
		 * press states the target; the pennant states the holding.
		 */
		version: heldLevel,
		detail: share === undefined ? undefined : rollOddsLabel(share),
		badges: [],
		skipped: !affordable,
		upgrades: registryUpgradesFor(offer, heldLevel, {
			price: kbLabel(priceKb),
			affordable,
			onBuy: onInstall,
		}),
		info: infoFor(offer),
	};
};

/**
 * An installed config sells its own next version here (ADR-097 decision 6): the
 * registry's rolled offer waives the coverage gate, this press does not, so the
 * two presses must not be the same one.
 */
export const buildChipFor = (
	config: Config,
	onUninstall?: () => void,
	vendorLock?: VendorLockChip,
	deal?: BuildUpgradeDeal
): ConfigChipProps => ({
	name: config.label,
	...chipFor(config),
	...(deal === undefined || !isUpgradable(config)
		? {}
		: { upgrades: upgradesFor(config, deal) }),
	...vendorChipFor(vendorLock, onUninstall),
});

export const controlRowFor = (
	glyph: string,
	title: string,
	detail: string,
	priceKb: number,
	balanceKb: number,
	onPress?: () => void
): RegistryControlProps => ({
	glyph,
	title,
	detail,
	price: kbLabel(priceKb),
	refusal: priceKb <= balanceKb ? undefined : shortfallOf(priceKb, balanceKb),
	onPress: priceKb <= balanceKb ? onPress : undefined,
});

/**
 * Named for the gate it is stocking for, not the one just cleared: the player
 * is here to spend on what comes next, and the swatch track beside the title
 * already points there. The summit has no next gate, so it keeps the bare word.
 */
const shopTitleFor = (cleared: number): string => {
	const next = gateSwatchAt(cleared + 1);
	return next === undefined ? SHOP_WORD : `${next.gateName} ${SHOP_WORD}`;
};

export const shopHeaderFor = (
	cleared: number,
	balanceKb: number,
	swatchGates: readonly number[] = []
): HeaderProps => ({
	swatch: gateSwatchAt(cleared),
	swatches: swatchTrackFor(swatchGates, cleared + 1),
	funds: fundsOf(balanceKb, BALANCE_WORD),
	title: shopTitleFor(cleared),
	note: `gate ${cleared} ${CLEARED_TRAIL}`,
});

export const nextGateFor = (
	cleared: number,
	unitsHeld: number
): NextGateProps | undefined => {
	const next = gateSwatchAt(cleared + 1);
	if (next === undefined) return undefined;

	const held = runCoverageOf(unitsHeld, next.gate);
	const demand = roundToOneDecimal(percentOf(healthyAt(next.gate)));
	const reading = roundToOneDecimal(percentOf(held));

	return {
		swatch: next,
		slots: `${scoringSlotsAt(next.gate)} ${SLOTS_TRAIL}`,
		demand: `${demand}${PERCENT}`,
		held: `${reading}${PERCENT}`,
		heldBand: bandFor(held, next.gate).id,
		opensAt: OPENS_AT,
	};
};
