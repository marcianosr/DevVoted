import type { BuildSpaceView } from "~/modules/run/run/application/runView.viewmodel";
import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	infoFor,
	upgradesFor,
} from "~/modules/run/config/application/configChip.viewmodel";
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
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { NextGateProps } from "~/ui/kanto-theme/NextGate.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type { BuildSpaceProps } from "~/ui/kanto-theme/BuildSpace.ui";
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
const LOCK_IN = "lock in";
const LOCKED_IN = "locked in";
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
};

/**
 * The price rides the Install button rather than a badge beside it, so the one
 * install affordance reads the same here as it does on the new-run hand.
 */
const offerInstallFor = (
	priceKb: number,
	affordable: boolean,
	onInstall?: () => void
): ChipInstall => ({
	price: kbLabel(priceKb),
	disabled: !affordable,
	onPress: onInstall,
});

export const offerChipFor = (
	config: Config,
	{ priceKb, affordable, onInstall }: OfferDeal
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [],
	skipped: !affordable,
	install: offerInstallFor(priceKb, affordable, onInstall),
	info: infoFor(config),
});

export const upgradeChipFor = (
	config: Config,
	onBuy?: () => void
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level,
	badges: [],
	upgrades: { ...upgradesFor(config), onBuy },
	info: infoFor(config),
});

export type VendorLockChip = {
	readonly locked: boolean;
	readonly onLock?: () => void;
};

/**
 * A locked config loses its uninstall press outright rather than wearing a
 * disabled one, and the badge left behind is what states why. The kit's `hint`
 * reaches the DOM only as an aria-label, so a refusal carried there is a
 * refusal nobody can see.
 */
const vendorBadgesFor = (
	vendorLock: VendorLockChip | undefined
): ConfigChipBadge[] => {
	if (vendorLock === undefined) return [];
	if (vendorLock.locked) return [{ label: LOCKED_IN, color: "saffron" }];
	if (vendorLock.onLock === undefined) return [];
	return [{ label: LOCK_IN, onPress: vendorLock.onLock }];
};

export const buildChipFor = (
	config: Config,
	onUninstall?: () => void,
	vendorLock?: VendorLockChip
): ConfigChipProps => ({
	name: config.label,
	...chipFor(config),
	badges: vendorBadgesFor(vendorLock),
	onUninstall: vendorLock?.locked === true ? undefined : onUninstall,
});

export const buildSpacePropsFor = (
	space: BuildSpaceView,
	onPick: (rung: number) => void
): BuildSpaceProps | undefined => {
	if (!space.offered) return undefined;

	return {
		held: space.space,
		weight: space.weight,
		rungs: space.rungs.map((rung) => ({
			weight: rung.weight,
			kb: rung.perGateKb,
			onPick: rung.pickable ? () => onPick(rung.rung) : undefined,
		})),
	};
};

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
