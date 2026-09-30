import type { InstallScale } from "~/modules/run/run/application/runView.viewmodel";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	isUpgradable,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	type BuildUpgradeDeal,
	infoFor,
	nextUpgradeCostOf,
	refundChipFor,
	registryUpgradesFor,
	rollOddsLabel,
	upgradesFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	offerOddsOf,
	sellRefundIn,
} from "~/modules/run/shop/domain/draft.model";
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
	type AuditId,
	auditAt,
	auditLabelOf,
} from "~/modules/run/gate/domain/audit.model";
import { kbLabel, formatStorage } from "~/shared/lib/storage";

import type {
	ChipInstall,
	ChipQuote,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { BalancePreview } from "~/ui/kanto-theme/Balance.ui";
import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import {
	COPY as INCIDENT_DESK_COPY,
	type IncidentDeskProps,
} from "~/ui/kanto-theme/IncidentDesk.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";

const SHORT_TRAIL = "short";
const NEW_RUN_WORD = "new run";
const CARRY_SEPARATOR = "·";
const CLEARED_TRAIL = "cleared";
const SHOP_WORD = "Shop";
const AFTER_COPY = {
	install: "after install",
	upgrade: "after upgrade",
	uninstall: "after uninstall",
} as const satisfies Record<ChipQuote, string>;

const SPEND_COLOR: KantoColor = "vermillion";
const REFUND_COLOR: KantoColor = "viridian";

export const shortfallOf = (priceKb: number, balanceKb: number): string =>
	`${kbLabel(priceKb - balanceKb)} ${SHORT_TRAIL}`;

export type PointedPrice = { label: string; deltaKb: number };

type PointHandler = (pointed?: PointedPrice) => void;

const quotingOf = (
	deltas: Partial<Record<ChipQuote, number>>,
	onPoint?: PointHandler
) => {
	if (onPoint === undefined) return {};

	return {
		onQuote: (quote?: ChipQuote) => {
			const deltaKb = quote === undefined ? undefined : deltas[quote];
			if (deltaKb === undefined || quote === undefined) return onPoint();
			return onPoint({ label: AFTER_COPY[quote], deltaKb });
		},
	};
};

export type OfferDeal = {
	priceKb: number;
	affordable: boolean;
	onInstall?: () => void;
	onPoint?: PointHandler;
	scale?: InstallScale | null;
	armed?: boolean;
};

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
	...quotingOf({ install: -deal.priceKb }, deal.onPoint),
});

export const upgradeChipFor = (
	offer: Config,
	heldLevel: number,
	{ priceKb, affordable, onInstall, onPoint }: OfferDeal
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
		...quotingOf({ upgrade: -priceKb }, onPoint),
	};
};

export type BuildChipOptions = {
	installed: readonly Config[];
	onUninstall?: () => void;
	vendorLock?: VendorLockChip;
	deal?: BuildUpgradeDeal;
	onPoint?: PointHandler;
};

const buildDeltasOf = (
	config: Config,
	refundKb: number
): Partial<Record<ChipQuote, number>> => ({
	...(refundKb === 0 ? {} : { uninstall: refundKb }),
	upgrade: -nextUpgradeCostOf(config),
});

export const buildChipFor = (
	config: Config,
	{ installed, onUninstall, vendorLock, deal, onPoint }: BuildChipOptions
): ConfigChipProps => {
	const refundKb = sellRefundIn(installed, config);

	return {
		name: config.label,
		...refundChipFor(config, refundKb),
		...(deal === undefined || !isUpgradable(config)
			? {}
			: { upgrades: upgradesFor(config, deal) }),
		...vendorChipFor(vendorLock, onUninstall),
		...quotingOf(buildDeltasOf(config, refundKb), onPoint),
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

const shopTitleFor = (cleared: number): string => {
	const next = gateSwatchAt(cleared + 1);
	return next === undefined ? SHOP_WORD : `${next.gateName} ${SHOP_WORD}`;
};

const afterOf = (
	balanceKb: number,
	pointed: PointedPrice | undefined
): BalancePreview | undefined => {
	if (pointed === undefined) return undefined;
	const after = balanceKb + pointed.deltaKb;
	if (after < 0) return undefined;

	return {
		label: pointed.label,
		figure: kbLabel(after),
		color: pointed.deltaKb < 0 ? SPEND_COLOR : REFUND_COLOR,
	};
};

export const shopHeaderFor = (
	cleared: number,
	balanceKb: number,
	swatchGates: readonly number[] = [],
	pointed?: PointedPrice,
	heldAudit?: AuditId
): HeaderProps => {
	const preview = afterOf(balanceKb, pointed);

	return {
		...(heldAudit === undefined
			? {}
			: { held: auditLabelOf(heldAudit, cleared) }),
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

const INCIDENT_COPY = {
	buy: "Buy",
	replace: "Replace held",
	rule: "hold 1 · targets your gate or ahead",
	reach: (count: number) =>
		count === 1 ? "1 rival has room" : `${count} rivals have room`,
	noReach: "nobody in reach",
	refresh: "Refresh",
	refreshDetail: "deals another incident · doubles this shop",
	shopClosed: "the shop is read-only this gate",
	deskShut: "the desk is not dealing",
	reachUnknown: "reach unknown",
} as const;

export type IncidentDeal = {
	offer: AuditId;
	gate: number;
	heldAudit: AuditId | null;
	rivalsInReach: number | null;
	balanceKb: number;
	costKb: number;
	refreshCostKb: number;
	refreshRungsKb: readonly number[];
	refreshes: number;
	shopLocked: boolean;
	onBuy?: () => void;
	onRefresh?: () => void;
};

const buyRefusalOf = (deal: IncidentDeal): string | undefined => {
	if (deal.shopLocked) return INCIDENT_COPY.shopClosed;
	if (deal.onBuy === undefined) return INCIDENT_COPY.deskShut;
	if (deal.rivalsInReach === 0) return INCIDENT_COPY.noReach;
	if (deal.balanceKb < deal.costKb)
		return shortfallOf(deal.costKb, deal.balanceKb);
	return undefined;
};

const refreshRefusalOf = (deal: IncidentDeal): string | undefined => {
	if (deal.shopLocked) return INCIDENT_COPY.shopClosed;
	if (deal.onRefresh === undefined) return INCIDENT_COPY.deskShut;
	if (deal.balanceKb < deal.refreshCostKb)
		return shortfallOf(deal.refreshCostKb, deal.balanceKb);
	return undefined;
};

export const shopAuditsFor = (
	audits: readonly { readonly id: AuditId }[],
	gate: number
): readonly AuditProps[] => audits.map(({ id }) => auditPropsOf(id, gate));

const auditPropsOf = (id: AuditId, gate: number): AuditProps => {
	const audit = auditAt(id, gate);
	return {
		code: audit.code,
		name: audit.name,
		cue: audit.description,
	};
};

export const incidentDeskFor = (deal: IncidentDeal): IncidentDeskProps => {
	const buyRefusal = buyRefusalOf(deal);
	const refreshRefusal = refreshRefusalOf(deal);

	return {
		audit: auditPropsOf(deal.offer, deal.gate),
		buy: {
			label:
				deal.heldAudit === null ? INCIDENT_COPY.buy : INCIDENT_COPY.replace,
			price: kbLabel(deal.costKb),
			...(buyRefusal === undefined && deal.onBuy !== undefined
				? { onPress: deal.onBuy }
				: { refusal: buyRefusal }),
		},
		...(deal.heldAudit === null
			? {}
			: {
					discards: INCIDENT_DESK_COPY.held(
						auditLabelOf(deal.heldAudit, deal.gate)
					),
				}),
		rule: INCIDENT_COPY.rule,
		reach:
			deal.rivalsInReach === null
				? INCIDENT_COPY.reachUnknown
				: deal.rivalsInReach === 0
					? INCIDENT_COPY.noReach
					: INCIDENT_COPY.reach(deal.rivalsInReach),
		refresh: {
			label: INCIDENT_COPY.refresh,
			price: kbLabel(deal.refreshCostKb),
			detail: INCIDENT_COPY.refreshDetail,
			rungs: deal.refreshRungsKb.map(kbLabel),
			atRung: Math.min(deal.refreshes, deal.refreshRungsKb.length - 1),
			...(refreshRefusal === undefined && deal.onRefresh !== undefined
				? { onPress: deal.onRefresh }
				: { refusal: refreshRefusal }),
		},
	};
};

export const carryLabelOf = (bytes: number): string =>
	`${NEW_RUN_WORD} ${CARRY_SEPARATOR} ${formatStorage(bytes)}`;
