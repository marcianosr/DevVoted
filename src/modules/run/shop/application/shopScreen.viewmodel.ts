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
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type {
	HeaderFundsPreview,
	HeaderProps,
} from "~/ui/kanto-theme/Header.ui";
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
const AFTER_INSTALL = "after install";
const AFTER_INSTALL_COLOR: KantoColor = "vermillion";

export const shortfallOf = (priceKb: number, balanceKb: number): string =>
	`${kbLabel(priceKb - balanceKb)} ${SHORT_TRAIL}`;

export type OfferDeal = {
	priceKb: number;
	affordable: boolean;
	onInstall?: () => void;
	onHover?: () => void;
	onLeave?: () => void;
	scale?: InstallScale | null;
	armed?: boolean;
};

const pointersOf = ({ onHover, onLeave }: OfferDeal) => ({
	...(onHover === undefined ? {} : { onHover }),
	...(onLeave === undefined ? {} : { onLeave }),
});

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
	...pointersOf(deal),
});

export const upgradeChipFor = (
	offer: Config,
	heldLevel: number,
	{ priceKb, affordable, onInstall }: OfferDeal
): ConfigChipProps => {
	const share = offerOddsOf(heldLevel, offer);

	return {
		name: offer.label,
		slots: slotsOf(offer),
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

const shopTitleFor = (cleared: number): string => {
	const next = gateSwatchAt(cleared + 1);
	return next === undefined ? SHOP_WORD : `${next.gateName} ${SHOP_WORD}`;
};

const afterInstallOf = (
	balanceKb: number,
	priceKb: number | undefined
): HeaderFundsPreview | undefined => {
	if (priceKb === undefined) return undefined;
	if (priceKb > balanceKb) return undefined;

	return {
		label: AFTER_INSTALL,
		figure: kbLabel(balanceKb - priceKb),
		color: AFTER_INSTALL_COLOR,
	};
};

export const shopHeaderFor = (
	cleared: number,
	balanceKb: number,
	swatchGates: readonly number[] = [],
	pointedPriceKb?: number
): HeaderProps => {
	const preview = afterInstallOf(balanceKb, pointedPriceKb);

	return {
		swatch: gateSwatchAt(cleared),
		swatches: swatchTrackFor(swatchGates, cleared + 1),
		funds: {
			...fundsOf(balanceKb, BALANCE_WORD),
			...(preview === undefined ? {} : { preview }),
		},
		title: shopTitleFor(cleared),
		note: `gate ${cleared} ${CLEARED_TRAIL}`,
	};
};

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
