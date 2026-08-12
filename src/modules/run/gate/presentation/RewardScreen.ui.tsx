import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { gateStorageGained } from "~/modules/run/gate/domain/gateReward.model";
import {
	hasThemeColor,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { Button } from "~/ui/Button.component";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
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
	billKb?: number;
	planDowngraded?: boolean;
	onReviewAnswers?: () => void;
	onContinue?: () => void;
};

/**
 * The clear is a payoff, not a report (ADR-026): one storage number, landed at
 * the moment it can teach, routed straight into spending it. The per-config
 * attribution this screen used to carry lives on in the failed gate's report
 * (GateRewardReport), where the player needs to know what fell short.
 */
export const RewardScreen = ({
	clearedGate,
	gateReward,
	answered,
	configs,
	storage,
	capKb,
	faucetThisGateKb,
	billKb,
	planDowngraded,
	onReviewAnswers,
	onContinue,
}: RewardScreenProps) => {
	const storageKb = gateStorageGained(
		configs,
		answered,
		gateReward,
		faucetThisGateKb
	);
	const swatch = swatchForGate(clearedGate);

	return (
		<div className="flex flex-col items-center gap-4 py-12 text-center">
			<div
				{...(swatch && hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
				className="flex items-center gap-1.5"
			>
				{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
				<Paragraph
					size="sm"
					tone="muted"
					className="uppercase tracking-[0.3em]"
				>
					{swatch ? (
						<span className={swatchNameClass(swatch.finish)}>
							{swatch.gateName}
						</span>
					) : (
						`Gate ${clearedGate}`
					)}{" "}
					gate · cleared
				</Paragraph>
			</div>

			<div className="flex flex-col items-center gap-2">
				<div className="flex flex-col items-center gap-1">
					<p className="text-4xl font-extrabold tracking-tight text-gradient-green sm:text-5xl">
						+{storageKb}KB
					</p>
					<Paragraph
						size="sm"
						tone="muted"
						className="uppercase tracking-[0.3em]"
					>
						storage earned
					</Paragraph>
				</div>

				<StorageGauge usedKb={storage} capKb={capKb} />

				{swatch ? (
					<Paragraph size="sm" tone="muted">
						<SwatchLabel swatch={swatch} label={swatch.name} /> unlocked
					</Paragraph>
				) : null}
			</div>

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
				<div className="mt-4 flex items-center gap-3">
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
