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
import type { GatePayout } from "~/modules/run/run/application/gatePayout.viewmodel";

type RewardScreenProps = {
	payout: GatePayout;
	answered: readonly AnsweredPoll[];
	configs: readonly Config[];
	storage: number;
	nextStake?: GateStake;
	onReviewAnswers?: () => void;
	onContinue?: () => void;
};

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

export const RewardScreen = ({
	payout,
	answered,
	configs,
	storage,
	nextStake,
	onReviewAnswers,
	onContinue,
}: RewardScreenProps) => {
	const clearedGate = payout.clearedGateNumber;
	const breakdown = gateStorageBreakdown({
		configs,
		answered,
		gateReward: payout.gateRewardPaidKb,
		faucetThisGateKb: payout.faucetThisGateKb,
		interestThisGateKb: payout.interestThisGateKb,
		extraPickThisGateKb: payout.extraPickThisGateKb,
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

			{payout.autoUpgradedConfig ? (
				<div className="flex flex-wrap items-center justify-center gap-2">
					<ConfigChip
						config={payout.autoUpgradedConfig}
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

			{payout.deletedConfigs.map((config) => (
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
						Faded to ×1 — deleted from the build.
					</Paragraph>
				</div>
			))}

			{payout.lapsedConfigs.map((config) => (
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

			<StorageGauge usedKb={storage} layout="wide" />

			<Paragraph tone="muted">
				Spend storage on configs, upgrades, and patches.
			</Paragraph>

			{payout.subscriptionBillKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Subscriptions billed −{payout.subscriptionBillKb}KB this gate.
				</Paragraph>
			) : null}

			{payout.planDowngraded ? (
				<Paragraph size="sm" tone="cinnabar">
					Slot rent went unpaid — every rented slot went back.
				</Paragraph>
			) : null}

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
