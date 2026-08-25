import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { gateStorageBreakdown } from "~/modules/run/gate/domain/gateReward.model";
import {
	themeColorOf,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { formatKb } from "~/shared/lib/storage";
import { Badge } from "~/ui/Badge.component";
import { Button } from "~/ui/Button.component";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { TextTone } from "~/ui/typography/textTone";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { SwatchLabel } from "~/modules/run/gate/presentation/SwatchLabel.ui";
import { GateStakeRewards } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";

type RewardScreenProps = {
	clearedGate: number;
	gateReward: number;
	answered: readonly AnsweredPoll[];
	configs: readonly Config[];
	storage: number;
	capKb: number;
	faucetThisGateKb?: number;
	interestThisGateKb?: number;
	extraPickThisGateKb?: number;
	billKb?: number;
	planDowngraded?: boolean;
	/** The config Dependabot bumped at this clear — announced here because the
	 * run log never shows in the live game. */
	autoUpgraded?: Config;
	/** Configs that faded to ×1 at this clear and deleted themselves
	 * (Deprecated) — announced here for the same reason, and nowhere else: they
	 * are gone from the pipeline, so no chip elsewhere can carry the news. */
	deletedConfigs?: readonly Config[];
	/** Configs whose subscription this clear could not cover (Freemium). Their own
	 * announcement rather than a line in `deletedConfigs`: the player's next move
	 * differs — a faded config is spent, a lapsed one is still worth re-drafting. */
	lapsedConfigs?: readonly Config[];
	/** KB the build's subscriptions took at this clear. */
	subscriptionBillKb?: number;
	/** The gate this clear opens onto, so the shop that follows has a target. */
	nextStake?: GateStake;
	onReviewAnswers?: () => void;
	onContinue?: () => void;
};

/**
 * The screen's one label treatment: letter-spaced caps, stepped back from the
 * figure it introduces. Three of them appear here at two sizes, which is what
 * makes it a component rather than a repeated className.
 */
const Eyebrow = ({
	children,
	size = "xs",
	tone = "muted",
}: {
	children: ReactNode;
	size?: "xs" | "sm";
	tone?: TextTone;
}) => (
	<Paragraph size={size} tone={tone} className="uppercase tracking-[0.3em]">
		{children}
	</Paragraph>
);

/**
 * A name and the KB beside it. The name is a `ReactNode` because a config row
 * puts a whole `ConfigChip` there — same object the shop and the pipeline show,
 * carrying its own rarity colour, so a config is recognisable here by the shape
 * it already has rather than by a second styling of its label.
 */
const LedgerRow = ({
	name,
	value,
	tone = "default",
	className,
}: {
	name: ReactNode;
	value: string;
	tone?: TextTone;
	className?: string;
}) => (
	<div
		className={clsx("flex items-center justify-between gap-6 py-3", className)}
	>
		<Paragraph as="dt" size="sm" tone={tone}>
			{name}
		</Paragraph>
		<Paragraph as="dd" size="sm" tone={tone} className="tabular-nums">
			{value}
		</Paragraph>
	</div>
);

/**
 * The KB math behind the headline: what the gate paid by itself, what each
 * config added on top, and a total that is the same number again. The total is
 * the point of the panel — a player who cannot tell whether a config is earning
 * its slot gets the answer here, per config, in the currency they spend.
 *
 * ADR-026 §3 kept the clear free of the per-config *pipeline* report (statuses,
 * roles, coverage) and that still holds; this is only the storage arithmetic.
 */
const StorageLedger = ({
	baseKb,
	rows,
	totalKb,
}: ReturnType<typeof gateStorageBreakdown>) => (
	<dl className="w-full divide-y divide-edge rounded-xl border border-edge px-5 text-left">
		<LedgerRow name="base reward" value={formatKb(baseKb)} />
		{rows.map((row) => (
			<LedgerRow
				key={row.key}
				name={<ConfigChip config={row.config} />}
				value={`+${formatKb(row.kb)}`}
				tone="viridian"
			/>
		))}
		<LedgerRow name="total" value={formatKb(totalKb)} className="font-bold" />
	</dl>
);

/**
 * The clear is a payoff, not a report (ADR-026): the gate's name, the storage it
 * paid, and a route straight into spending it. The ledger under the figure is
 * the one piece of attribution the payoff keeps — it explains the number rather
 * than replacing it with a table.
 */
export const RewardScreen = ({
	clearedGate,
	gateReward,
	answered,
	configs,
	storage,
	capKb,
	faucetThisGateKb,
	interestThisGateKb,
	extraPickThisGateKb,
	billKb,
	planDowngraded,
	autoUpgraded,
	deletedConfigs,
	lapsedConfigs,
	subscriptionBillKb,
	nextStake,
	onReviewAnswers,
	onContinue,
}: RewardScreenProps) => {
	const breakdown = gateStorageBreakdown({
		configs,
		answered,
		gateReward,
		faucetThisGateKb,
		interestThisGateKb,
		extraPickThisGateKb,
	});
	const swatch = swatchForGate(clearedGate);

	return (
		<div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-12 text-center">
			<div
				{...swatchTheme(swatch && themeColorOf(swatch))}
				className="flex items-center gap-1.5"
			>
				{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
				<Eyebrow size="sm">
					{swatch ? (
						<span className={swatchNameClass(swatch.finish)}>
							{swatch.gateName}
						</span>
					) : (
						`Gate ${clearedGate}`
					)}{" "}
					gate · cleared
				</Eyebrow>
			</div>

			<div className="flex flex-col items-center gap-1">
				<p className="text-4xl font-extrabold tracking-tight text-gradient-green sm:text-5xl">
					+{breakdown.totalKb}KB
				</p>
				<Eyebrow size="sm">storage earned</Eyebrow>
			</div>

			<StorageLedger {...breakdown} />

			{swatch ? (
				<div className="flex flex-wrap items-center justify-center gap-2">
					{/* Decorative: the sentence beside it already says "unlocked". The
					    design system's StatusDot is a *check* verdict, which this is
					    not, so it would speak "passed" to a screen reader. */}
					<span aria-hidden className="text-viridian">
						✓
					</span>
					<Paragraph as="span" size="sm" tone="viridian">
						unlocked
					</Paragraph>
					<SwatchLabel swatch={swatch} label={swatch.name} />
					<Badge tone="muted" size="pill">
						cosmetic
					</Badge>
				</div>
			) : null}

			{autoUpgraded ? (
				<div className="flex flex-wrap items-center justify-center gap-2">
					<ConfigChip
						config={autoUpgraded}
						badge={
							<Badge tone="legendary" size="corner" pulse>
								upgraded
							</Badge>
						}
					/>
					<Paragraph as="span" size="sm" tone="muted">
						Dependabot merged this upgrade — free.
					</Paragraph>
				</div>
			) : null}

			{deletedConfigs?.map((config) => (
				<div
					key={config.id}
					className="flex flex-wrap items-center justify-center gap-2"
				>
					<ConfigChip
						config={config}
						badge={
							<Badge tone="neutral" size="corner">
								deleted
							</Badge>
						}
					/>
					<Paragraph as="span" size="sm" tone="muted">
						Faded to ×1 — deleted from the pipeline.
					</Paragraph>
				</div>
			))}

			{lapsedConfigs?.map((config) => (
				<div
					key={config.id}
					className="flex flex-wrap items-center justify-center gap-2"
				>
					<ConfigChip
						config={config}
						badge={
							<Badge tone="neutral" size="corner">
								lapsed
							</Badge>
						}
					/>
					<Paragraph as="span" size="sm" tone="muted">
						Bill unpaid — the plan lapsed and freed its slot.
					</Paragraph>
				</div>
			))}

			<StorageGauge usedKb={storage} capKb={capKb} layout="wide" />

			<Paragraph tone="muted">
				Spend storage on configs, upgrades, and patches.
			</Paragraph>

			{billKb !== undefined && billKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Storage plan billed −{billKb}KB this window.
				</Paragraph>
			) : null}
			{subscriptionBillKb !== undefined && subscriptionBillKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Subscriptions billed −{subscriptionBillKb}KB this gate.
				</Paragraph>
			) : null}
			{planDowngraded ? (
				<Paragraph size="sm" tone="cinnabar">
					Storage bill unpaid — downgraded to the free tier.
				</Paragraph>
			) : null}

			{/* Left-aligned inside a centred screen: the ledger reads the same here
			    as it will in the shop this button opens. Only the payout shows — the
			    demand and game-over rules belong to the gate ahead, not this clear. */}
			{nextStake ? (
				<div className="w-full text-left">
					<GateStakeRewards stake={nextStake} lead="Next up" />
				</div>
			) : null}

			{(answered.length > 0 && onReviewAnswers) || onContinue ? (
				<div className="flex items-center gap-3">
					{onContinue ? (
						<Button onClick={onContinue}>Enter shop →</Button>
					) : null}
					{answered.length > 0 && onReviewAnswers ? (
						<Button variant="neutral" onClick={onReviewAnswers}>
							Review answers
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
};
