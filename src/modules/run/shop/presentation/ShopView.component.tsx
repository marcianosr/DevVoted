import {
	type Config,
	describeConfig,
	headlineFigureOf,
	isUpgradable,
	rarityOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	storagePlanFor,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import type {
	RunView,
	ShopOffer,
	StoragePlanOption,
} from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { offerRefusalText } from "~/modules/run/shop/presentation/ShopScreen.ui";
import { ShopScreen } from "~/ui/modern-theme/screens/ShopScreen.ui";
import { Action } from "~/ui/modern-theme/Action.ui";
import { Chip } from "~/ui/modern-theme/Chip.ui";
import { Delta } from "~/ui/modern-theme/Delta.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";
import { Entry } from "~/ui/modern-theme/Entry.ui";
import { Fold, type FoldItem } from "~/ui/modern-theme/Fold.ui";
import { Glyph } from "~/ui/modern-theme/Glyph.ui";
import { Lock } from "~/ui/modern-theme/Lock.ui";
import { Mark } from "~/ui/modern-theme/Mark.ui";
import type { PlanProps } from "~/ui/modern-theme/Plan.ui";
import { PriceTag, type PriceTagState } from "~/ui/modern-theme/PriceTag.ui";
import { Slot } from "~/ui/modern-theme/Slot.ui";
import { ConfigFacts } from "~/modules/run/config/presentation/ConfigFacts.ui";
import { Text } from "~/ui/modern-theme/Text.ui";
import { capLabel, planOpensAt, plural } from "~/ui/modern-theme/format";

/**
 * An offer quotes no refund: it is not owned yet, and its price is already on
 * the row's own tag. An installed config quotes what this build would be paid
 * for it, which is the number the Uninstall press honours.
 */
const offerFacts = (config: Config) => <ConfigFacts config={config} />;

const ownedFacts = (configs: readonly Config[], config: Config) => (
	<ConfigFacts config={config} refundKb={sellRefundIn(configs, config)} />
);

// The two refusals are fixed by different things — sell something, or clear a
// slot — so they cannot share a colour. Red is "you are short"; grey is "there
// is nowhere to put it".
const tagStateFor = (offer: ShopOffer): PriceTagState => {
	if (offer.owned) return "owned";
	if (!offer.refusal) return "buyable";
	return offer.refusal.reason === "no-slot" ? "unavailable" : "unaffordable";
};

const notEnoughData = (verb: string) => `Can't ${verb}, not enough data`;

// The row's explainer says this at length, but only once the row is open.
const refusalHintFor = (offer: ShopOffer): string | undefined => {
	if (offer.owned) return "Already installed";
	if (!offer.refusal) return undefined;
	return offer.refusal.reason === "no-slot"
		? "Can't install, no free slot"
		: notEnoughData("install");
};

const lockFor = (
	view: RunView,
	offer: ShopOffer,
	onLock: (configId: string) => void
) => {
	const label = offer.config.label;
	if (!view.shopControls.lockAvailable)
		return <Lock on={label} state="unavailable" />;
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

/**
 * The slot Extend buys, drawn as the shelf's own next row. As a panel below the
 * list it read as a separate purchase; as a row it reads as the offer it is —
 * an empty place on this shelf, priced.
 */
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
				rarity={rarityOf(offer.config)}
				leading={
					offer.owned ? (
						<Mark variant="pass" hint="Already installed" />
					) : (
						lockFor(view, offer, onLock)
					)
				}
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

/**
 * Both gates on one upgrade, as sentences. Storage and category coverage are
 * independent — a Focus config can be earned but unaffordable, or affordable
 * but unearned — and the emptiness of this list is what makes the button live,
 * so the press and the hint can never disagree about why it is refused.
 */
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
		// The legendary ring is the reward for having met both gates, so it is
		// never worn by a button that would refuse the press.
		emphasis: ready ? ("prismatic" as const) : ("quiet" as const),
		onUse: () => onUpgrade(config.id),
	};
};

const pipelineRows = (
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
					rarity={rarityOf(config)}
					{...(view.newConfigIds.includes(config.id)
						? { mark: "warn" as const }
						: {})}
					notes={
						<>
							<Figure figure={headlineFigureOf(config)} />
							<Chip tone="celadon">worth {refundKb} KB</Chip>
						</>
					}
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
	...Array.from(
		{ length: Math.max(0, view.slots - view.configs.length) },
		(_, index) => ({
			id: `slot-${view.configs.length + index}`,
			content: <Slot />,
		})
	),
	...(view.nextSlotUnlock === null
		? []
		: [
				{
					id: "slot-next",
					content: (
						<Slot
							gate={view.nextSlotUnlock.gate}
							coverage={view.nextSlotUnlock.coverage}
						/>
					),
				},
			]),
];

const currentTier = (plans: readonly StoragePlanOption[]): number =>
	plans.find((plan) => plan.current)?.tier ?? 1;

const planRows = (
	view: RunView,
	onChangePlan: (tier: number) => void
): readonly PlanProps[] => {
	const held = storagePlanFor(currentTier(view.storagePlans));

	return storagePlanLadder(view.gatesCleared).map((plan) =>
		plan.fromGate > view.gatesCleared
			? {
					id: `tier-${plan.tier}`,
					locked: true,
					opensAt: planOpensAt(plan.fromGate),
				}
			: {
					id: `tier-${plan.tier}`,
					name: "storage-plan",
					cap: capLabel(plan.capKb),
					terms: plan.billKb === 0 ? "free" : `${plan.billKb} KB / gate`,
					free: plan.billKb === 0,
					figure:
						plan.capKb === held.capKb
							? `${plan.capKb - view.storage} free now`
							: `+${plan.capKb - held.capKb}`,
					selected: plan.capKb === held.capKb,
					onSelect: () => onChangePlan(plan.tier),
				}
	);
};

const offerCountFor = (view: RunView): string => {
	const locked = view.shopControls.lockedOfferIds.length;
	const offers = plural(view.offers.length, "offer");
	return locked === 0 ? offers : `${offers} · ${locked} locked`;
};

export type ShopViewProps = {
	view: RunView;
	onDraft: (configId: string) => void;
	onSell: (configId: string) => void;
	onUpgrade: (configId: string) => void;
	onLock: (configId: string) => void;
	onRebuild: () => void;
	onExtend: () => void;
	onPlantPin: () => void;
	onChangePlan: (tier: number) => void;
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
	onChangePlan,
	onContinue,
}: ShopViewProps) => {
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
				storage: {
					plan:
						view.storageBillKb === 0
							? "Free tier"
							: `${view.storageBillKb} KB / gate`,
					used: view.storage,
					cap: view.storageCap,
				},
			}}
			notice={
				view.shopControls.shopLocked
					? `Shop closed. Read-only audits the build you already have, so nothing can be bought, sold or switched before gate ${nextGate}.`
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
			storagePlans={{
				plans: planRows(view, onChangePlan),
				nextBillKb: view.storageBillKb,
			}}
			pipeline={pipelineRows(view, onUpgrade, onSell)}
			slots={`${view.configs.length} of ${view.slots} slots`}
			onContinue={onContinue}
		/>
	);
};
