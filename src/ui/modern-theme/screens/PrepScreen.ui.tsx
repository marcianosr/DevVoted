import { Fragment, type ReactNode } from "react";

import { Action } from "../Action.ui";
import { AUDIT, type AuditId } from "../audits";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Dot } from "../Dot.ui";
import { Entry } from "../Entry.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { Glyph } from "../Glyph.ui";
import { Slot } from "../Slot.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import { Tooltip } from "../Tooltip.ui";
import { plural, signed } from "../format";

const SCREEN = "flex flex-col bg-theme-faint";

// Copied from ShopScreen: prep and the shop are one place the player walks
// between, so the two bodies should not sit differently on the page.
const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const STAKE = "border-b border-edge lg:border-b-0 lg:border-r";

const PROSE = "flex flex-col gap-1";
const FIGURES = "flex items-center gap-2";
const STACKED = "flex flex-col gap-0.5";
const STRUCK = "line-through";

const MULTIPLIERS = "flex flex-wrap items-center gap-1.5";
const SEPARATOR = "text-xs text-zinc-700";

const PREFETCH = "flex flex-col gap-2";
const DRAW = "flex flex-wrap items-center gap-1.5";

const FOOTER =
	"flex flex-wrap items-center gap-4 border-t border-edge px-5 py-4";
const ONWARD = "ml-auto flex flex-wrap items-center gap-4";

const BULLET = <Dot tone="muted" />;

export type PrepConfig = {
	id: string;
	label: string;
	note?: ReactNode;
	summary?: string;
	explainer?: string;
};

export type PrepSlot = { id: string; gate?: number };

export type PrepAudit = {
	/** The name and the icon come off the id, so an audit cannot be called one
	 * thing here and another in the Dex. The wording of its effect stays local:
	 * prep says what it does to THIS gate, the Dex states the general rule. */
	id: AuditId;
	description: string;
	suppressed?: boolean;
};

export type PrepReward = {
	coveragePerCorrect: number;
	storageKbPerCorrect: number;
	matchingMultiplier?: number;
	streakMultiplier: number;
	gateRewardKb: number;
};

export type PrepBill = {
	id: string;
	label: string;
	kb: number;
	billedOnMiss: boolean;
};

export type PrepScreenProps = {
	gate: GateHeaderProps;
	gateName: string;
	pollCount: number;
	coverageDemand: number;
	coverageHeld: number;
	removeOnMiss: number;
	missIsFatal: boolean;
	configs: readonly PrepConfig[];
	slots: readonly PrepSlot[];
	audits: readonly PrepAudit[];
	reward: PrepReward;
	bills: readonly PrepBill[];
	shortfallKb?: number;
	prefetch?: { thisGate: readonly string[]; nextGate: readonly string[] };
	startLock?: string;
	onBackToShop?: () => void;
	onCommunity?: () => void;
	onStart?: () => void;
	theme?: string;
};

const multipliersOn = (reward: PrepReward) => {
	const streak = {
		id: "streak",
		value: reward.streakMultiplier,
		note: "per streak step",
	};
	if (reward.matchingMultiplier === undefined) return [streak];
	return [
		{
			id: "matching",
			value: reward.matchingMultiplier,
			note: "on a matching poll",
		},
		streak,
	];
};

const Multipliers = ({ reward }: { reward: PrepReward }) => (
	<span className={MULTIPLIERS}>
		{multipliersOn(reward).map((multiplier, index) => (
			<Fragment key={multiplier.id}>
				{index > 0 ? (
					<span aria-hidden className={SEPARATOR}>
						·
					</span>
				) : null}
				<Delta multiplier={multiplier.value} />
				<Text size="xxs" tone="muted">
					{multiplier.note}
				</Text>
			</Fragment>
		))}
	</span>
);

const Draw = ({
	label,
	categories,
}: {
	label: string;
	categories: readonly string[];
}) => {
	if (categories.length === 0) return null;

	return (
		<p className={DRAW}>
			<Text size="meta" tone="muted">
				{label}
			</Text>
			{categories.map((category, position) => (
				<Chip key={`${category}-${position}`} tone="muted">
					{category}
				</Chip>
			))}
		</p>
	);
};

export const PrepScreen = ({
	gate,
	gateName,
	pollCount,
	coverageDemand,
	coverageHeld,
	removeOnMiss,
	missIsFatal,
	configs,
	slots,
	audits,
	reward,
	bills,
	shortfallKb,
	prefetch,
	startLock,
	onBackToShop,
	onCommunity,
	onStart,
	theme,
}: PrepScreenProps) => {
	const width = configs.length + slots.length;
	const billedKb = bills.reduce((total, bill) => total + bill.kb, 0);
	const onMissKb = bills
		.filter((bill) => bill.billedOnMiss)
		.reduce((total, bill) => total + bill.kb, 0);

	const locked = startLock !== undefined;

	const demands: FoldItem[] = [
		{
			id: "polls",
			content: (
				<Entry leading={BULLET} label={`Answer all ${pollCount} polls`} />
			),
		},
		{
			id: "coverage",
			content: (
				<Entry
					leading={BULLET}
					label={`Earn ${coverageDemand}% coverage in this window`}
				/>
			),
		},
	];

	const rewards: FoldItem[] = [
		{
			id: "correct",
			content: (
				<Entry
					leading={BULLET}
					label={
						<span className={STACKED}>
							<Text size="meta">Correct answer</Text>
							<Multipliers reward={reward} />
						</span>
					}
					value={
						<span className={FIGURES}>
							<Delta coverage={reward.coveragePerCorrect} />
							{reward.storageKbPerCorrect > 0 ? (
								<Delta kb={reward.storageKbPerCorrect} />
							) : null}
						</span>
					}
				/>
			),
		},
		{
			id: "clear",
			content: (
				<Entry
					leading={BULLET}
					label="Gate cleared"
					value={<Delta kb={reward.gateRewardKb} />}
				/>
			),
		},
		{
			id: "swatch",
			content: (
				<Entry
					leading={BULLET}
					label="Swatch earned"
					// Dashed and uncoloured: the badge is the gate's, and the gate has
					// not handed it over yet.
					value={<Swatch size="pip" state="pending" />}
				/>
			),
		},
	];

	const subscriptions: FoldItem[] = bills.map((bill) => ({
		id: bill.id,
		content: (
			<Entry
				leading={BULLET}
				label={bill.label}
				value={
					<span className={FIGURES}>
						<Delta kb={bill.kb} />
						<Text size="meta" tone="muted">
							{bill.billedOnMiss ? "pass or fail" : "on clear"}
						</Text>
					</span>
				}
			/>
		),
	}));

	if (bills.length > 1)
		subscriptions.push({
			id: "total",
			content: (
				<Entry
					leading={BULLET}
					label="Total this gate"
					value={
						<span className={FIGURES}>
							<Delta kb={billedKb} />
							<Text size="meta" tone="muted">
								{signed(onMissKb)} KB on a miss
							</Text>
						</span>
					}
				/>
			),
		});

	const pipeline: FoldItem[] = [
		...configs.map((config) => ({
			id: config.id,
			content: (
				<Entry
					mark="idle"
					label={config.label}
					value={config.note}
					summary={config.summary}
					explainer={config.explainer}
				/>
			),
		})),
		...slots.map((slot) => ({
			id: slot.id,
			content: <Slot gate={slot.gate} />,
		})),
	];

	const startButton = onStart ? (
		<Action
			label={startLock ?? `Start ${gateName} gate →`}
			size="lg"
			emphasis="loud"
			disabled={locked}
			onUse={onStart}
		/>
	) : null;

	return (
		<article data-gate-theme={theme} className={SCREEN}>
			<GateHeader {...gate} />

			<div className={BODY}>
				<section className={`${COLUMN} ${STAKE}`}>
					<Fold
						title="Clear the gate"
						value={
							<Text size="meta" tone="muted">
								{coverageHeld} / {coverageDemand}%
							</Text>
						}
						items={demands}
					>
						<div className={PROSE}>
							<Text as="p" size="meta" tone="muted">
								A miss removes {plural(removeOnMiss, "config")}, then you shop
								and run it again on {plural(pollCount, "fresh poll")}.
							</Text>
							{missIsFatal ? (
								<Text as="p" size="meta" tone="cinnabar">
									That removal takes your whole pipeline. A miss here ends the
									run.
								</Text>
							) : null}
						</div>
					</Fold>

					{audits.length ? (
						<Fold
							title="Audit"
							defaultOpen={false}
							value={
								<Text size="meta" tone="saffron">
									{audits.length}
								</Text>
							}
							items={audits.map((audit) => ({
								id: audit.id,
								content: (
									<Entry
										leading={
											<Glyph
												name={AUDIT[audit.id].glyph}
												className={
													audit.suppressed ? "text-zinc-500" : "text-saffron"
												}
											/>
										}
										dimmed={audit.suppressed}
										label={
											audit.suppressed ? (
												<span className={STRUCK}>{AUDIT[audit.id].label}</span>
											) : (
												AUDIT[audit.id].label
											)
										}
										notes={
											<>
												<Text size="meta" tone="muted">
													{audit.description}
												</Text>
												{/* Suppressed, never hidden: the fraud stays on the
												    receipt (ADR-028). */}
												{audit.suppressed ? (
													<Chip tone="celadon">reported passing</Chip>
												) : null}
											</>
										}
									/>
								),
							}))}
						/>
					) : null}

					<Fold title="Rewards" items={rewards} />

					{bills.length ? (
						<Fold
							title="Subscriptions"
							defaultOpen={false}
							value={<Delta kb={billedKb} />}
							items={subscriptions}
						>
							{shortfallKb ? (
								<Text as="p" size="meta" tone="cinnabar">
									{shortfallKb} KB short. What you cannot pay lapses.
								</Text>
							) : null}
						</Fold>
					) : null}
				</section>

				<section className={COLUMN}>
					<Fold
						title="Your pipeline"
						value={
							<Text size="meta" tone="muted">
								{configs.length} / {width}
							</Text>
						}
						items={pipeline}
					>
						<Text as="p" size="meta" tone="muted">
							Change your build in the shop.
						</Text>
					</Fold>

					{prefetch ? (
						<Fold title="Prefetch">
							<div className={PREFETCH}>
								<Draw label="this gate" categories={prefetch.thisGate} />
								<Draw label="next gate" categories={prefetch.nextGate} />
							</div>
						</Fold>
					) : null}
				</section>
			</div>

			<div className={FOOTER}>
				{onBackToShop ? (
					<Action label="← Back to shop" onUse={onBackToShop} />
				) : null}
				{onCommunity ? (
					<Action label="Community →" onUse={onCommunity} />
				) : null}
				<div className={ONWARD}>
					{locked ? (
						<Tooltip hint="Today's polls are spent. This gate opens when the next window does.">
							{startButton}
						</Tooltip>
					) : (
						startButton
					)}
				</div>
			</div>
		</article>
	);
};
