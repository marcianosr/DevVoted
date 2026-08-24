import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import {
	storagePlanFor,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import { BASE_SLOTS } from "~/modules/run/pipeline/domain/pipeline.model";
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
import { Delta } from "~/ui/modern-theme/Delta.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";
import { Dot } from "~/ui/modern-theme/Dot.ui";
import { Entry } from "~/ui/modern-theme/Entry.ui";
import { Fold, type FoldItem } from "~/ui/modern-theme/Fold.ui";
import { Glyph } from "~/ui/modern-theme/Glyph.ui";
import { Lock } from "~/ui/modern-theme/Lock.ui";
import { Mark } from "~/ui/modern-theme/Mark.ui";
import type { PlanProps } from "~/ui/modern-theme/Plan.ui";
import { PriceTag, type PriceTagState } from "~/ui/modern-theme/PriceTag.ui";
import { Slot } from "~/ui/modern-theme/Slot.ui";
import { Text } from "~/ui/modern-theme/Text.ui";
import { capLabel, planOpensAt, plural } from "~/ui/modern-theme/format";

const rarityWord = (config: Config) => {
	const rarity = rarityOf(config);
	return `${rarity.charAt(0).toUpperCase()}${rarity.slice(1)}`;
};

const summaryFor = (config: Config) =>
	config.level === undefined
		? rarityWord(config)
		: `${rarityWord(config)} · level ${config.level}`;

const tagStateFor = (offer: ShopOffer): PriceTagState => {
	if (offer.owned) return "owned";
	return offer.refusal ? "unaffordable" : "buyable";
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
	if (!view.lockAvailable) return <Lock on={label} state="unavailable" />;
	if (view.lockedOfferIds.includes(offer.config.id))
		return (
			<Lock
				on={label}
				state="locked"
				onToggle={() => onLock(offer.config.id)}
			/>
		);
	if (!view.canLock) return <Lock on={label} state="unavailable" />;
	return (
		<Lock
			on={label}
			state="unlocked"
			cost={`${view.lockCost} KB`}
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
			<Dot rarity={rarityOf(offer.config)} />
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
	view.extendAvailable
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
									kb={view.extendCost}
									on="another offer"
									label="extend"
									state={view.canExtend ? "ready" : "unaffordable"}
									hint={view.canExtend ? undefined : notEnoughData("buy")}
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
				summary={summaryFor(offer.config)}
				explainer={
					offer.refusal
						? offerRefusalText(offer.refusal)
						: offer.config.description
				}
			/>
		),
	}));

const pipelineRows = (
	view: RunView,
	onUpgrade: (configId: string) => void,
	onSell: (configId: string) => void
): readonly FoldItem[] => [
	...view.configs.map((config) => ({
		id: config.id,
		content: (
			<Entry
				label={config.label}
				rarity={rarityOf(config)}
				mark={view.newConfigIds.includes(config.id) ? "warn" : "pass"}
				notes={
					<>
						<Dot rarity={rarityOf(config)} />
						{<Figure figure={headlineFigureOf(config)} />}
					</>
				}
				actions={[
					...(config.maxLevel !== undefined &&
					(config.level ?? 1) < config.maxLevel
						? [
								{
									label: "Upgrade",
									on: config.label,
									emphasis: "prismatic" as const,
									onUse: () => onUpgrade(config.id),
								},
							]
						: []),
					...(view.atMinimumWidth
						? []
						: [
								{
									label: "Uninstall",
									on: config.label,
									icon: <Glyph name="uninstall" />,
									cost: `+${sellRefundIn(view.configs, config)} KB`,
									emphasis: "danger" as const,
									onUse: () => onSell(config.id),
								},
							]),
				]}
				summary={summaryFor(config)}
				explainer={config.description}
			/>
		),
	})),
	...Array.from(
		{ length: Math.max(0, view.slots - view.configs.length) },
		(_, index) => ({
			id: `slot-${view.configs.length + index}`,
			content: <Slot />,
		})
	),
	...(view.nextSlotGate === null
		? []
		: [
				{
					id: "slot-next",
					content: <Slot gate={view.nextSlotGate} />,
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
	const locked = view.lockedOfferIds.length;
	const offers = plural(view.offers.length, "offer");
	return locked === 0 ? offers : `${offers} · ${locked} locked`;
};

const exitLockFor = (view: RunView): string | undefined => {
	if (view.canStart) return undefined;
	const needed = Math.min(view.slots, BASE_SLOTS);
	return `Fill ${plural(needed, "slot")} to continue`;
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
	const held = view.lockedOfferIds
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
				capNote: view.shopLocked
					? "Read-only: this shop is shut for the coming gate."
					: undefined,
			}}
			offers={[
				...offerRows(view, onDraft, onLock),
				...extendRow(view, onExtend),
			]}
			offerCount={offerCountFor(view)}
			draftAction={
				view.rebuildAvailable ? (
					<Action
						label="rebuild"
						cost={`${view.rebuildCost} KB`}
						icon={<Glyph name="rebuild" />}
						disabled={!view.canRebuild}
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
				view.pinAvailable ? (
					<Fold
						title="git tag"
						subtitle="next run"
						icon={<Glyph name="tag" />}
						defaultOpen={false}
						value={
							<Text size="meta" tone="muted">
								not tagged · {view.pinCost} KB
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
								kb={view.pinCost}
								on="a git tag"
								label="buy"
								state={view.canPin ? "buyable" : "unaffordable"}
								hint={view.canPin ? undefined : notEnoughData("buy")}
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
			exitLock={exitLockFor(view)}
		/>
	);
};
