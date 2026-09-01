import { useState } from "react";

import {
	type Config,
	describeConfig,
	givesOf,
	headlineFigureOf,
	isUpgradable,
	largestSizeFitting,
	slotsOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import type {
	RunView,
	ShopOffer,
	StoragePlanOption,
} from "~/modules/run/run/application/runView.viewmodel";
import { MAX_SLOTS } from "~/modules/run/run/domain/rules.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	offerRefusalText,
	shopExitLock,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import { ShopScreen } from "~/ui/modern-theme/screens/ShopScreen.ui";
import { Action } from "~/ui/modern-theme/Action.ui";
import { Delta } from "~/ui/modern-theme/Delta.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";
import { Entry } from "~/ui/modern-theme/Entry.ui";
import { Fold, type FoldItem } from "~/ui/modern-theme/Fold.ui";
import { Glyph } from "~/ui/modern-theme/Glyph.ui";
import { Lock } from "~/ui/modern-theme/Lock.ui";
import { Mark } from "~/ui/modern-theme/Mark.ui";
import type { StoragePlanRow } from "~/ui/modern-theme/StoragePlan.ui";
import { PriceTag, type PriceTagState } from "~/ui/modern-theme/PriceTag.ui";
import { SlotTrack } from "~/ui/modern-theme/SlotTrack.ui";
import { ConfigFacts } from "~/modules/run/config/presentation/ConfigFacts.ui";
import { Text } from "~/ui/modern-theme/Text.ui";
import { capLabel, plural } from "~/ui/modern-theme/format";

const offerFacts = (config: Config) => <ConfigFacts config={config} />;

const ownedFacts = (configs: readonly Config[], config: Config) => (
	<ConfigFacts config={config} refundKb={sellRefundIn(configs, config)} />
);

const tagStateFor = (offer: ShopOffer): PriceTagState => {
	if (offer.owned) return "owned";
	if (!offer.refusal) return "buyable";
	return offer.refusal.reason === "no-room" ? "unavailable" : "unaffordable";
};

const notEnoughData = (verb: string) => `Can't ${verb}, not enough data`;

const refusalHintFor = (offer: ShopOffer): string | undefined => {
	if (offer.owned) return "Already installed";
	if (!offer.refusal) return undefined;
	return offer.refusal.reason === "no-room"
		? `Needs ${offer.refusal.slots} slots, ${offer.refusal.freeSlots} free`
		: notEnoughData("install");
};

const lockFor = (
	view: RunView,
	offer: ShopOffer,
	onLock: (configId: string) => void
) => {
	const label = offer.config.label;
	if (!view.shopControls.lockAvailable) return undefined;
	if (view.shopControls.lockedOfferIds.includes(offer.config.id))
		return (
			<Lock
				on={label}
				state="locked"
				onToggle={() => onLock(offer.config.id)}
			/>
		);
	if (!view.shopControls.canLock)
		return <Lock on={label} state="unavailable" />;
	return (
		<Lock
			on={label}
			state="unlocked"
			cost={`${view.shopControls.lockCost} KB`}
			onToggle={() => onLock(offer.config.id)}
		/>
	);
};

const previewNotes = (view: RunView, offer: ShopOffer) => {
	const coverageDelta =
		Math.round(
			(offer.previewPerAnswer.coveragePerCorrect -
				view.perAnswer.coveragePerCorrect) *
				10
		) / 10;
	const storageDelta =
		offer.previewPerAnswer.storageKbPerCorrect -
		view.perAnswer.storageKbPerCorrect;

	return (
		<>
			{coverageDelta !== 0 ? <Delta coverage={coverageDelta} /> : null}
			{storageDelta !== 0 ? <Delta kb={storageDelta} /> : null}
		</>
	);
};

const PIN = "flex flex-wrap items-center justify-between gap-3";

const extendRow = (view: RunView, onExtend: () => void): readonly FoldItem[] =>
	view.shopControls.extendAvailable
		? [
				{
					id: "extend",
					content: (
						<Entry
							leading={<Glyph name="extend" framed />}
							label={
								<Text size="meta" tone="muted">
									one more offer, here and every shop after
								</Text>
							}
							value={
								<PriceTag
									kb={view.shopControls.extendCost}
									on="another offer"
									label="extend"
									state={view.shopControls.canExtend ? "ready" : "unaffordable"}
									hint={
										view.shopControls.canExtend
											? undefined
											: notEnoughData("buy")
									}
									onUse={onExtend}
								/>
							}
						/>
					),
				},
			]
		: [];

const trackBars = (configs: readonly Config[]) =>
	configs.map((config) => ({
		id: config.id,
		label: config.label,
		slots: slotsOf(config),
		minified: config.minified,
	}));

const offerRows = (
	view: RunView,
	onDraft: (configId: string) => void,
	onLock: (configId: string) => void
): readonly FoldItem[] =>
	view.offers.map((offer) => ({
		id: offer.config.id,
		content: (
			<Entry
				label={offer.config.label}
				slots={slotsOf(offer.config)}
				sizeHint={`takes ${slotsOf(offer.config)} of ${view.slots} slots`}
				leading={
					offer.owned ? (
						<Mark variant="pass" hint="Already installed" />
					) : (
						lockFor(view, offer, onLock)
					)
				}
				gives={givesOf(offer.config) ?? offer.config.description}
				notes={previewNotes(view, offer)}
				value={
					<PriceTag
						kb={offer.priceKb}
						on={offer.config.label}
						state={tagStateFor(offer)}
						hint={refusalHintFor(offer)}
						onUse={() => onDraft(offer.config.id)}
					/>
				}
				summary={offerFacts(offer.config)}
				explainer={
					offer.refusal
						? offerRefusalText(offer.refusal)
						: offer.config.description
				}
			/>
		),
	}));

const upgradeShortfalls = (
	view: RunView,
	config: Config
): readonly string[] => {
	const level = config.level ?? 1;
	const category = config.focusCategory;
	const cost = upgradeStorageCost(level);
	const required = upgradeCoverageRequired(level);
	const held = category ? (view.coverageByCategory[category] ?? 0) : 0;

	return [
		...(view.storage >= cost
			? []
			: [`Costs ${cost} KB, you have ${view.storage} KB.`]),
		...(category === undefined || held >= required
			? []
			: [
					`Unlocks at ${required}% ${getCategoryMetadata(category).name} coverage, you have ${held}%.`,
				]),
	];
};

const upgradeHint = (view: RunView, config: Config): string => {
	const nextVersion = (config.level ?? 1) + 1;
	const preview = `v${nextVersion}: ${describeConfig({ ...config, level: nextVersion })}`;

	return [preview, ...upgradeShortfalls(view, config)].join(" ");
};

const upgradeAction = (
	view: RunView,
	config: Config,
	onUpgrade: (configId: string) => void
) => {
	const ready = upgradeShortfalls(view, config).length === 0;

	return {
		label: "Upgrade",
		on: config.label,
		cost: `${upgradeStorageCost(config.level ?? 1)} KB`,
		hint: upgradeHint(view, config),
		disabled: !ready,
		emphasis: ready ? ("prismatic" as const) : ("quiet" as const),
		onUse: () => onUpgrade(config.id),
	};
};

const buildRows = (
	view: RunView,
	onUpgrade: (configId: string) => void,
	onSell: (configId: string) => void
): readonly FoldItem[] => [
	...view.configs.map((config) => {
		const refundKb = sellRefundIn(view.configs, config);

		return {
			id: config.id,
			content: (
				<Entry
					label={config.label}
					slots={slotsOf(config)}
					sizeHint={`takes ${slotsOf(config)} of ${view.slots} slots`}
					{...(view.newConfigIds.includes(config.id)
						? { mark: "warn" as const }
						: {})}
					notes={<Figure figure={headlineFigureOf(config)} />}
					actions={[
						...(isUpgradable(config)
							? [upgradeAction(view, config, onUpgrade)]
							: []),
						...(view.atMinimumWidth
							? []
							: [
									{
										label: "Uninstall",
										on: config.label,
										hint: `Refunds ${refundKb} KB`,
										emphasis: "danger" as const,
										onUse: () => onSell(config.id),
									},
								]),
					]}
					summary={ownedFacts(view.configs, config)}
					explainer={config.description}
				/>
			),
		};
	}),
];

const planTerms = (option: StoragePlanOption): string =>
	option.perGateKb === 0 ? "free" : `${option.perGateKb} KB a gate`;

const planRows = (
	view: RunView,
	onSetPlan: (tier: number) => void
): readonly StoragePlanRow[] =>
	view.storagePlan.options.map((option) => ({
		id: `plan-${option.tier}`,
		label: capLabel(option.capKb),
		terms: planTerms(option),
		free: option.perGateKb === 0,
		held: option.held,
		...(option.burnsKb > 0 ? { warns: `burns ${option.burnsKb} KB` } : {}),
		pick: { onUse: () => onSetPlan(option.tier) },
	}));

const offerCountFor = (view: RunView): string => {
	const locked = view.shopControls.lockedOfferIds.length;
	const offers = plural(view.offers.length, "offer");
	return locked === 0 ? offers : `${offers} · ${locked} locked`;
};

type SlotDealName = "buy" | "cash";

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onLock: (configId: string) => void;
	onRebuild: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onBuySlot: () => void;
	onCashSlot: () => void;
	onSetStoragePlan: (tier: number) => void;
	onContinue: () => void;
};

export const ShopView = ({
	view,
	onDraft,
	onSell,
	onUpgrade,
	onLock,
	onRebuild,
	onExtend,
	onPlantPin,
	onBuySlot,
	onCashSlot,
	onSetStoragePlan,
	onContinue,
}: ShopViewProps) => {
	const [armedDeal, setArmedDeal] = useState<SlotDealName | null>(null);
	const disarm = () => setArmedDeal(null);
	const armThenUse = (deal: SlotDealName, use: () => void) => () => {
		if (armedDeal !== deal) {
			setArmedDeal(deal);
			return;
		}
		disarm();
		use();
	};

	const nextGate = view.gateStake.gateNumber;
	const gateName = swatchForGate(nextGate)?.gateName ?? "";
	const held = view.shopControls.lockedOfferIds
		.map(
			(id) => view.offers.find((offer) => offer.config.id === id)?.config.label
		)
		.filter((label): label is string => label !== undefined);

	return (
		<ShopScreen
			theme={view.gateTheme}
			gate={{
				title: `${gateName} shop`,
				nextGate: `gate ${nextGate}`,
				storage: { balanceKb: view.storage },
			}}
			notice={
				view.shopControls.shopLocked
					? `Shop closed. 405 Method Not Allowed audits the build you already have, so nothing can be bought, sold or switched before gate ${nextGate}.`
					: undefined
			}
			offers={[
				...offerRows(view, onDraft, onLock),
				...extendRow(view, onExtend),
			]}
			offerCount={offerCountFor(view)}
			draftAction={
				view.shopControls.rebuildAvailable ? (
					<Action
						label="rebuild"
						cost={`${view.shopControls.rebuildCost} KB`}
						icon={<Glyph name="rebuild" />}
						disabled={!view.shopControls.canRebuild}
						onUse={onRebuild}
					/>
				) : undefined
			}
			draftNote={
				held.length ? (
					<Text size="meta" tone="muted">
						{held.join(", ")} is locked and stays
					</Text>
				) : undefined
			}
			controls={
				view.shopControls.pinAvailable ? (
					<Fold
						title="git tag"
						subtitle="next run"
						icon={<Glyph name="tag" />}
						defaultOpen={false}
						value={
							<Text size="meta" tone="muted">
								not tagged · {view.shopControls.pinCost} KB
							</Text>
						}
					>
						<div className={PIN}>
							<Text as="p" size="meta" tone="muted">
								If this run dies, the next one checks out at{" "}
								<Text size="meta" tone="theme">
									gate {nextGate}
								</Text>{" "}
								instead of gate 0. One per run.
							</Text>
							<PriceTag
								kb={view.shopControls.pinCost}
								on="a git tag"
								label="buy"
								state={view.shopControls.canPin ? "buyable" : "unaffordable"}
								hint={
									view.shopControls.canPin ? undefined : notEnoughData("buy")
								}
								onUse={onPlantPin}
							/>
						</div>
					</Fold>
				) : undefined
			}
			storagePlan={{
				rows: planRows(view, onSetStoragePlan),
				cap: capLabel(view.storagePlan.capKb),
				terms:
					view.storagePlan.perGateKb === 0
						? "free"
						: `${view.storagePlan.perGateKb} KB a gate`,
			}}
			build={buildRows(view, onUpgrade, onSell)}
			slots={`${view.slotsUsed} of ${view.slots} slots`}
			track={
				<SlotTrack
					configs={trackBars(view.configs)}
					slots={view.slots}
					maxSlots={MAX_SLOTS}
					fits={largestSizeFitting(view.slotsFree)}
					buy={{
						...view.slotDeals.buy,
						armed: armedDeal === "buy",
						onUse: armThenUse("buy", onBuySlot),
						onDismiss: disarm,
					}}
					cash={{
						...view.slotDeals.cash,
						armed: armedDeal === "cash",
						onUse: armThenUse("cash", onCashSlot),
						onDismiss: disarm,
					}}
				/>
			}
			onContinue={onContinue}
			exitLock={shopExitLock(view.overflowSlots)}
		/>
	);
};
