import { COMMUNITY, NEW_BADGE, NEW_RUN_PRICE, WEIGHT } from "~/shared/lib/copy";
import type { Disclosure } from "~/shared/hooks/useDisclosure.hook";
import type {
	InstallScale,
	RunView,
	ShopOffer,
} from "~/modules/run/run/application/runView.viewmodel";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	DRAFT_COST_PER_SLOT_KB,
	isUpgradable,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { buildReadingOf } from "~/modules/run/build/application/newRunScreen.viewmodel";
import { carries } from "~/modules/run/run/domain/warmBoot.model";
import {
	BUILD_SPACE_RUNGS,
	INCIDENT_REFRESH_COST_KB,
} from "~/modules/run/run/domain/rules.model";
import {
	type CarriedServiceSpec,
	isCarriedService,
	isServiceUnlocked,
	isSoldInShop,
	REGISTRY_CONTROL_LIST,
	REGISTRY_CONTROLS,
	type ShopSoldId,
	type ShopSoldSpec,
} from "~/modules/run/shop/domain/registryControl.model";
import {
	type BuildUpgradeDeal,
	infoFor,
	nextUpgradeCostOf,
	idleUpgraderBadgesFor,
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
	VENDOR_REMEDY,
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
import { kbLabel, formatStorage, shortfallOf } from "~/shared/lib/storage";

import type {
	ChipInstall,
	ChipQuote,
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import { RECURRING_GLYPH, upkeepLabelOf } from "~/ui/kanto-theme/upkeep";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { BalancePreview } from "~/ui/kanto-theme/Balance.ui";
import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import {
	COPY as INCIDENT_DESK_COPY,
	type IncidentDeskProps,
} from "~/ui/kanto-theme/IncidentDesk.ui";
import type { RegistryControlProps } from "~/ui/kanto-theme/RegistryControl.ui";
import type {
	ShopScreenProps,
	ShopServiceRow,
} from "~/ui/kanto-theme/ShopScreen.ui";

const REGISTRY_TITLE = "Registry";
const REGISTRY_SUBTITLE = "Improve your build this run!";
const AFTER_COPY = {
	install: "after install",
	upgrade: "after upgrade",
	uninstall: "after uninstall",
} as const satisfies Record<ChipQuote, string>;

const SPEND_COLOR: KantoColor = "vermillion";
const REFUND_COLOR: KantoColor = "viridian";

export { shortfallOf };

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
	upkeepNowKb?: number;
	armed?: boolean;
	onCancel?: () => void;
	isNew?: boolean;
};

const BILL_COLOR: KantoColor = "saffron";

const raisedBillOf = ({ scale, upkeepNowKb = 0 }: OfferDeal): number =>
	scale === null || scale === undefined
		? 0
		: Math.max(0, scale.perGateKb - upkeepNowKb);

const billBadgesOf = (deal: OfferDeal): ConfigChipBadge[] => {
	const raised = raisedBillOf(deal);
	return raised === 0
		? []
		: [
				{
					label: `${RECURRING_GLYPH} +${upkeepLabelOf(raised)}`,
					color: BILL_COLOR,
				},
			];
};

const offerInstallFor = ({
	priceKb,
	affordable,
	onInstall,
	scale,
	armed,
	onCancel,
}: OfferDeal): ChipInstall => ({
	price: kbLabel(priceKb),
	disabled: !affordable,
	onPress: onInstall,
	...(scale === null || scale === undefined ? {} : { scale, armed, onCancel }),
});

export const offerChipFor = (
	config: Config,
	deal: OfferDeal
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	badges: [
		...(deal.isNew === true ? [{ ...NEW_BADGE }] : []),
		...billBadgesOf(deal),
	],
	skipped: !deal.affordable,
	install: offerInstallFor(deal),
	info: infoFor(config),
	...quotingOf({ install: -deal.priceKb }, deal.onPoint),
});

export const upgradeChipFor = (
	offer: Config,
	heldLevel: number,
	{ priceKb, affordable, onInstall, onPoint, scale }: OfferDeal
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
			...(scale === null || scale === undefined ? {} : { scale }),
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
	const vendor = vendorChipFor(vendorLock, onUninstall);

	return {
		name: config.label,
		...refundChipFor(config, refundKb),
		...(deal === undefined || !isUpgradable(config)
			? {}
			: { upgrades: upgradesFor(config, deal) }),
		...vendor,
		badges: [...vendor.badges, ...idleUpgraderBadgesFor(config, installed)],
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
		swatch: gateSwatchAt(cleared + 1),
		swatches: swatchTrackFor(swatchGates, cleared + 1),
		funds: {
			...fundsOf(balanceKb, BALANCE_WORD),
			...(preview === undefined ? {} : { preview }),
		},
		title: REGISTRY_TITLE,
		subtitle: REGISTRY_SUBTITLE,
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
	NEW_RUN_PRICE(formatStorage(bytes));

const {
	rebuild: REBUILD,
	skipShop: SKIP,
	extend: EXTEND,
	abandon: ABANDON,
	pin: PIN,
} = REGISTRY_CONTROLS;

const TO_PREP = "To prep";
const ABANDON_CONFIRM = "press again to end the run";
const SEPARATOR = "·";
const OVER_MARK = "over the";
const OVER_REMEDY = "the bill covered · sell or drop to fit it";
const REGISTRY_TOUCHED = "registry touched";
const SHOP_SKIPPED = "skipped";
const SKIPPED_SHUT =
	"You skipped this shop. The registry stays shut until the next one.";

export type ShopScreenHandlers = {
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onRebuild: () => void;
	onSkip: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onAbandon: () => void;
	onVendorLock: (configId: string) => void;
	onBuyIncident?: () => void;
	onRefreshIncident?: () => void;
	onContinue: () => void;
	onCommunity?: () => void;
};

export type ShopScreenUi = {
	build: Disclosure;
	offers: Disclosure;
	openUpgrades?: string;
	onToggleUpgrades: (name: string) => void;
	armedId?: string;
	onArm: (configId?: string) => void;
	pointed?: PointedPrice;
	onPoint: (pointed?: PointedPrice) => void;
	abandonArmed: boolean;
	onArmAbandon: () => void;
	onDisarm: () => void;
};

export type ShopScreenFrame = {
	view: RunView;
	rivalsInReach?: number | null;
	on: ShopScreenHandlers;
	ui: ShopScreenUi;
};

const isUnlockedThisRun = (view: RunView, configId: string): boolean =>
	view.unlockedThisRun.some((unlock) => unlock.configId === configId);

const offersOf = (
	view: RunView,
	onDraft: (id: string) => void,
	armedId: string | undefined,
	arm: (configId?: string) => void,
	onPoint: (pointed?: PointedPrice) => void
): readonly ConfigChipProps[] =>
	view.offers.map((offer) => {
		const armed = armedId === offer.config.id;
		const deal = {
			priceKb: offer.priceKb,
			affordable: offer.installable && offer.refusal === null,
			scale: offer.scale,
			upkeepNowKb: view.buildSpace.perGateKb,
			armed,
			onCancel: () => arm(),
			onPoint,
			isNew: isUnlockedThisRun(view, offer.config.id),
			onInstall:
				offer.scale === null || armed
					? () => onDraft(offer.config.id)
					: () => arm(offer.config.id),
		};
		return offer.heldLevel === null
			? offerChipFor(offer.config, deal)
			: upgradeChipFor(offer.config, offer.heldLevel, {
					...deal,
					onInstall: () => onDraft(offer.config.id),
				});
	});

const isUpgradeOffer = (offer: ShopOffer): boolean => offer.heldLevel !== null;

const upgradeOfferNamed = (
	view: RunView,
	name: string
): ShopOffer | undefined =>
	view.offers.find(
		(offer) => isUpgradeOffer(offer) && offer.config.label === name
	);

const registryUpgradeToggleOf =
	(view: RunView, armed: ShopOffer | undefined, arm: (id?: string) => void) =>
	(name: string) => {
		const pressed = upgradeOfferNamed(view, name);
		arm(
			pressed === undefined || pressed === armed ? undefined : pressed.config.id
		);
	};

const focusCoverageOf = (view: RunView, config: Config): number =>
	config.focusCategory === undefined
		? 0
		: (view.coverageByCategory[config.focusCategory] ?? 0);

type ServiceHandlers = Pick<
	ShopScreenHandlers,
	"onRebuild" | "onSkip" | "onExtend" | "onPlantPin" | "onAbandon"
> & {
	leaveBlocked: boolean;
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
		skipShop: () => ({
			id: SKIP.id,
			glyph: SKIP.glyph,
			title: SKIP.title,
			detail: SKIP.detail,
			price: `+${kbLabel(shopControls.skipPayoutKb)}`,
			refusal: skipRefusalOf(shopControls),
			onPress:
				shopControls.canSkip && !handlers.leaveBlocked
					? handlers.onSkip
					: undefined,
		}),
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

const uncarriedRowFor = (control: CarriedServiceSpec): ShopServiceRow => ({
	id: control.id,
	carried: false,
	carry: carryLabelOf(control.carryBytes),
	glyph: control.glyph,
	title: control.title,
	detail: control.detail,
});

const serviceRowFor = (
	control: ShopSoldSpec,
	view: RunView,
	handlers: ServiceHandlers
): ShopServiceRow | undefined => {
	if (!isServiceUnlocked(control, view.unlockedServiceIds)) return undefined;
	if (isCarriedService(control) && !carries(view, control.id))
		return uncarriedRowFor(control);
	const row = stagedRowFor(control, view, handlers);
	if (row === undefined) return undefined;
	return view.unlockedServiceIdsThisRun.includes(control.id)
		? { ...row, isNew: true }
		: row;
};

const skipRefusalOf = ({
	canSkip,
	shopSkipped,
}: RunView["shopControls"]): string | undefined => {
	if (shopSkipped) return SHOP_SKIPPED;
	return canSkip ? undefined : REGISTRY_TOUCHED;
};

const controlsOf = (
	view: RunView,
	handlers: ServiceHandlers
): readonly ShopServiceRow[] =>
	REGISTRY_CONTROL_LIST.filter(isSoldInShop).flatMap((control) => {
		const row = serviceRowFor(control, view, handlers);
		return row === undefined ? [] : [row];
	});

export const shopScreenPropsFor = ({
	view,
	rivalsInReach = null,
	on,
	ui,
}: ShopScreenFrame): ShopScreenProps => {
	const armed = view.offers.find((offer) => offer.config.id === ui.armedId);
	const armedUpgrade =
		armed !== undefined && isUpgradeOffer(armed) ? armed : undefined;
	const disarming = (press: () => void) => () => {
		ui.onDisarm();
		press();
	};
	const overSpace = view.overflowSlots > 0;
	const needsVendor = view.vendorLock.offered;

	return {
		...(view.shopControls.shopSkipped ? { shut: SKIPPED_SHUT } : {}),
		header: {
			...shopHeaderFor(
				view.gatePayout.clearedGateNumber,
				view.storage,
				view.swatchGates,
				ui.pointed,
				view.heldAudit?.auditId
			),
		},
		audits: shopAuditsFor(
			view.gateStake.audits.filter((audit) => !audit.suppressed),
			view.gatesCleared
		),
		...(view.incidentOffer === null
			? {}
			: {
					incidents: incidentDeskFor({
						offer: view.incidentOffer,
						gate: view.gatesCleared,
						heldAudit: view.heldAudit?.auditId ?? null,
						rivalsInReach,
						balanceKb: view.storage,
						costKb: view.shopControls.incidentCost,
						refreshCostKb: view.shopControls.incidentRefreshCost,
						refreshRungsKb: INCIDENT_REFRESH_COST_KB,
						refreshes: view.incidentRefreshes,
						shopLocked: view.shopControls.shopLocked,
						...(on.onBuyIncident === undefined
							? {}
							: { onBuy: disarming(on.onBuyIncident) }),
						...(on.onRefreshIncident === undefined
							? {}
							: { onRefresh: disarming(on.onRefreshIncident) }),
					}),
				}),
		controls: controlsOf(view, {
			onRebuild: disarming(on.onRebuild),
			onSkip: disarming(on.onSkip),
			leaveBlocked: overSpace || needsVendor,
			onExtend: disarming(on.onExtend),
			onPlantPin: disarming(on.onPlantPin),
			onAbandon: on.onAbandon,
			abandonArmed: ui.abandonArmed,
			onArmAbandon: ui.onArmAbandon,
		}),
		build: {
			configs: view.configs.map((config) =>
				buildChipFor(config, {
					installed: view.configs,
					onUninstall: () => on.onSell(config.id),
					vendorLock: {
						locked: view.vendorLock.lockedConfigId === config.id,
						onLock:
							view.vendorLock.offered && config.vendorLocks !== true
								? () => on.onVendorLock(config.id)
								: undefined,
					},
					deal: {
						storageKb: view.storage,
						coveragePct: focusCoverageOf(view, config),
						onBuy: () => on.onUpgrade(config.id),
					},
					onPoint: ui.onPoint,
				})
			),
			weight: {
				held: view.buildSpace.space,
				perGateKb: view.buildSpace.perGateKb,
				rungs: BUILD_SPACE_RUNGS,
				...(armed?.scale == null || armedUpgrade !== undefined
					? {}
					: {
							preview: {
								name: armed.config.label,
								slots: armed.slots,
								held: armed.scale.to,
							},
						}),
			},
			openInfo: ui.build.open,
			onToggleInfo: ui.build.toggle,
			onToggleAll: ui.build.toggleAll,
			openUpgrades: ui.openUpgrades,
			onToggleUpgrades: ui.onToggleUpgrades,
		},
		registry: {
			offers: offersOf(view, on.onDraft, ui.armedId, ui.onArm, ui.onPoint),
			slotPrice: kbLabel(DRAFT_COST_PER_SLOT_KB),
			openInfo: ui.offers.open,
			onToggleInfo: ui.offers.toggle,
			onToggleAll: ui.offers.toggleAll,
			openUpgrades: armedUpgrade?.config.label,
			onToggleUpgrades: registryUpgradeToggleOf(view, armedUpgrade, ui.onArm),
		},
		footer: {
			asides:
				on.onCommunity === undefined
					? []
					: [{ label: COMMUNITY, icon: "community", onPress: on.onCommunity }],
			action: {
				label: TO_PREP,
				swatch: {
					state: "current",
					swatch: gateSwatchAt(view.gatePayout.clearedGateNumber + 1),
				},
				onPress: overSpace || needsVendor ? undefined : on.onContinue,
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
		},
	};
};
