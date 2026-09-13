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
	swatchTrackTo,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type { SlotCash } from "~/ui/kanto-theme/SlotBox.ui";
import type { SlotOfferProps } from "~/ui/kanto-theme/SlotOffer.ui";
import {
	healthyAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";

const SEPARATOR = "·";
const GATE_COUNT = VICTORY_GATE;
const UNAFFORDABLE_COLOR = "pewter" as const;
const INSTALL_LEAD = "Install";
const SHORT_TRAIL = "short";

export const shortfallOf = (priceKb: number, balanceKb: number): string =>
	`${kbLabel(priceKb - balanceKb)} ${SHORT_TRAIL}`;

export type OfferDeal = {
	priceKb: number;
	affordable: boolean;
	onInstall?: () => void;
};

const offerBadgeFor = (
	config: Config,
	priceKb: number,
	affordable: boolean,
	onInstall?: () => void
): ConfigChipBadge => {
	const label = kbLabel(priceKb);
	if (!affordable || onInstall === undefined)
		return { label, color: UNAFFORDABLE_COLOR };

	return {
		label,
		hint: `${INSTALL_LEAD} ${config.label} ${SEPARATOR} ${label}`,
		onPress: onInstall,
	};
};

export const offerChipFor = (
	config: Config,
	{ priceKb, affordable, onInstall }: OfferDeal
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [offerBadgeFor(config, priceKb, affordable, onInstall)],
	skipped: !affordable,
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

export const buildChipFor = (
	config: Config,
	onUninstall?: () => void
): ConfigChipProps => ({
	name: config.label,
	badges: [],
	...chipFor(config),
	onUninstall,
});

export type SlotDeal = {
	costKb?: number;
	makes?: number;
	refusal?: string;
};

export const slotDealsFor = (
	capacity: number,
	balanceKb: number,
	buy: SlotDeal,
	cash: SlotDeal,
	onBuy: () => void,
	onCash: () => void
): { cash?: SlotCash; offer?: SlotOfferProps } => ({
	cash:
		cash.costKb === undefined
			? undefined
			: { refund: signedKbLabel(cash.costKb), onPress: onCash },
	offer:
		buy.costKb === undefined
			? undefined
			: {
					slot: capacity + 1,
					price: kbLabel(buy.costKb),
					refusal:
						buy.refusal ??
						(buy.costKb <= balanceKb
							? undefined
							: shortfallOf(buy.costKb, balanceKb)),
					onPress:
						buy.refusal === undefined && buy.costKb <= balanceKb
							? onBuy
							: undefined,
				},
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
	balanceKb: number
): HeaderProps => {
	const next = gateSwatchAt(cleared + 1);

	return {
		swatch: gateSwatchAt(cleared),
		gateCount: GATE_COUNT,
		swatches: swatchTrackTo(cleared + 1),
		funds: fundsOf(balanceKb, BALANCE_WORD),
		title: `Shop ${SEPARATOR} cleared ${gateSwatchAt(cleared).gateName}`,
		...(next === undefined
			? {}
			: {
					note: `next gate ${next.gate} ${SEPARATOR} ${next.gateName} ${SEPARATOR} to pass ${percentOf(healthyAt(next.gate))}%`,
				}),
	};
};
