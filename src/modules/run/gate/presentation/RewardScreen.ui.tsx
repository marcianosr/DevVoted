import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
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
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";

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

			<StorageGauge usedKb={storage} capKb={capKb} layout="wide" />

			<Paragraph tone="muted">
				Spend storage on configs, upgrades, and patches.
			</Paragraph>

			{billKb !== undefined && billKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Storage plan billed −{billKb}KB this window.
				</Paragraph>
			) : null}
			{planDowngraded ? (
				<Paragraph size="sm" tone="cinnabar">
					Storage bill unpaid — downgraded to the free tier.
				</Paragraph>
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
