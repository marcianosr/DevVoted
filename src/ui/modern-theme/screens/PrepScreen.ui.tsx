import { Fragment, type ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Audits, type AuditRow } from "../Audits.ui";
import { Chip } from "../Chip.ui";
import { Delta } from "../Delta.ui";
import { Dot } from "../Dot.ui";
import { Entry } from "../Entry.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { Stake } from "../Stake.ui";
import type { Rarity } from "../rarity";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { SpotTrack } from "../SpotTrack.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import { Tooltip } from "../Tooltip.ui";
import { signed } from "../format";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const STAKE = "border-b border-edge lg:border-b-0 lg:border-r";

const ORDINAL = "w-4 shrink-0 text-right tabular-nums";

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
	rarity?: Rarity;
	spots: number;
	minified?: boolean;
	note?: ReactNode;
	summary?: ReactNode;
	explainer?: string;
};

export type PrepAudit = AuditRow;

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
	coveragePerWrong: number;
	configs: readonly PrepConfig[];
	spots: number;
	maxSpots?: number;
	fits?: Rarity | null;
	audits: readonly PrepAudit[];
	reward: PrepReward;
	bills: readonly PrepBill[];
	shortfallKb?: number;
	prefetch?: { thisGate: readonly string[]; nextGate: readonly string[] };
	startLock?: string;
	onBackToShop?: () => void;
	onCommunity?: () => void;
	onStart?: () => void;
	theme?: SwatchTheme;
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
	coveragePerWrong,
	configs,
	spots,
	maxSpots,
	fits,
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
	const spotsUsed = configs.reduce((total, config) => total + config.spots, 0);
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
					label="Correct answer"
					notes={
						<>
							<Delta coverage={reward.coveragePerCorrect} />
							{reward.storageKbPerCorrect > 0 ? (
								<Delta kb={reward.storageKbPerCorrect} />
							) : null}
							<Multipliers reward={reward} />
						</>
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
					notes={<Delta kb={reward.gateRewardKb} />}
				/>
			),
		},
		{
			id: "swatch",
			content: (
				<Entry
					leading={BULLET}
					label="Swatch earned"
					notes={<Swatch size="pip" state="pending" />}
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
				notes={
					<>
						<Delta kb={bill.kb} />
						{bill.billedOnMiss ? null : (
							<Text size="meta" tone="muted">
								on clear
							</Text>
						)}
					</>
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
					notes={
						<>
							<Delta kb={billedKb} />
							<Text size="meta" tone="muted">
								{signed(onMissKb)} KB on a miss
							</Text>
						</>
					}
				/>
			),
		});

	const pipeline: FoldItem[] = [
		...configs.map((config, index) => ({
			id: config.id,
			content: (
				<Entry
					leading={
						<Text size="meta" tone="muted" className={ORDINAL}>
							{index + 1}
						</Text>
					}
					label={config.label}
					rarity={config.rarity}
					value={config.note}
					summary={config.summary}
					explainer={config.explainer}
				/>
			),
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
		<Screen theme={theme}>
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
					/>

					{audits.length ? <Audits audits={audits} defaultOpen /> : null}

					<Fold title="Rewards" items={rewards} />

					<Stake
						removeOnMiss={removeOnMiss}
						coveragePerWrong={coveragePerWrong}
						missIsFatal={missIsFatal}
					/>

					{bills.length ? (
						<Fold
							title="Subscriptions"
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
								{spotsUsed} of {spots} spots
							</Text>
						}
						note={
							<SpotTrack
								configs={configs}
								spots={spots}
								maxSpots={maxSpots}
								fits={fits}
							/>
						}
						items={pipeline}
					>
						{onBackToShop ? (
							<Action label="Change build in shop" onUse={onBackToShop} />
						) : null}
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
		</Screen>
	);
};
