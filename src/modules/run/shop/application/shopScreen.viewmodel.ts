import type { InstallScale } from "~/modules/run/run/application/runView.viewmodel";
import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	infoFor,
	registryUpgradesFor,
	rollOddsLabel,
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
import {
	SLICE_WINDOW,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
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
	coverageGainPercentFor,
	healthyAt,
	percentOf,
	runCoverageOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import { answersOwedFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";

const SEPARATOR = "·";
const SHORT_TRAIL = "short";
const CLEARED_TRAIL = "cleared";
const SLOTS_TRAIL = "slots after it closes";
const ALREADY_HELD_NOTE = "The run already holds this line.";
const OUT_OF_REACH_NOTE = `${SLICE_WINDOW} of the ${SLICE_WINDOW} right will not reach it.`;
const CLEARS_TRAIL = `of the ${SLICE_WINDOW} right clears it.`;
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
		version: offer.level,
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

export const buildChipFor = (
	config: Config,
	onUninstall?: () => void,
	vendorLock?: VendorLockChip
): ConfigChipProps => ({
	name: config.label,
	...chipFor(config),
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

export const shopHeaderFor = (
	cleared: number,
	balanceKb: number,
	swatchGates: readonly number[] = []
): HeaderProps => ({
	swatch: gateSwatchAt(cleared),
	swatches: swatchTrackFor(swatchGates, cleared + 1),
	funds: fundsOf(balanceKb, BALANCE_WORD),
	title: `Shop ${SEPARATOR} cleared ${gateSwatchAt(cleared).gateName}`,
	note: `gate ${cleared} ${CLEARED_TRAIL}`,
});

const owedNoteFor = (owed: number | undefined): string => {
	if (owed === undefined) return OUT_OF_REACH_NOTE;
	if (owed === 0) return ALREADY_HELD_NOTE;

	return `${owed} ${CLEARS_TRAIL}`;
};

export const nextGateFor = (
	cleared: number,
	unitsHeld: number,
	unitsPerCorrect: number
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
		note: owedNoteFor(
			answersOwedFor(
				demand,
				reading,
				coverageGainPercentFor(unitsPerCorrect, next.gate)
			)
		),
	};
};
