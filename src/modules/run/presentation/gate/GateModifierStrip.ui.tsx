import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { StatBadge } from "../run/StatBadge.ui";
import { Title } from "~/ui/typography/Title.component";

type GateModifierStripProps = {
	current: PipelineModifiers;
	/**
	 * The same modifiers recomputed with a previewed config added. Both the
	 * configure bench and the shop's offers feed this, so a config's effect on
	 * the gate reads identically whether it's free or bought.
	 */
	next?: PipelineModifiers;
};

type StatPair = { readonly value: string; readonly from?: string };

// While a config is previewed the strip reads old → new; an unchanged stat keeps
// its plain value (no arrow), so only what actually moves draws the eye.
const statPair = (current: string, next: string | undefined): StatPair =>
	next === undefined || next === current
		? { value: current }
		: { value: next, from: current };

// An identity multiplier means "no modifier equipped yet" — it reads muted so
// the stats that actually move are the ones that glow.
const multiplierTone = (pair: StatPair): "muted" | "gradient" =>
	pair.from === undefined && pair.value === "×1" ? "muted" : "gradient";

export const coverageValue = ({
	coverageMultiplier,
	coverageAdd,
}: PipelineModifiers) =>
	`×${coverageMultiplier}${coverageAdd > 0 ? ` +${coverageAdd}%` : ""}`;

export const GateModifierStrip = ({
	current,
	next,
}: GateModifierStripProps) => {
	const reward = statPair(
		`+${current.gateReward}KB`,
		next ? `+${next.gateReward}KB` : undefined
	);
	const rewardTimes = statPair(
		`×${current.rewardMultiplier}`,
		next ? `×${next.rewardMultiplier}` : undefined
	);
	const coverageTimes = statPair(
		coverageValue(current),
		next ? coverageValue(next) : undefined
	);

	return (
		<div className="flex flex-col gap-2 border-t border-zinc-700 pt-4">
			<Title as="h3">Gate modifiers</Title>
			<div className="flex flex-wrap gap-8">
				<StatBadge
					label="reward on clear"
					value={reward.value}
					from={reward.from}
					valueTone="gradient"
				/>
				<StatBadge
					label="reward ×"
					value={rewardTimes.value}
					from={rewardTimes.from}
					valueTone={multiplierTone(rewardTimes)}
				/>
				<StatBadge
					label="coverage ×"
					value={coverageTimes.value}
					from={coverageTimes.from}
					valueTone={multiplierTone(coverageTimes)}
				/>
			</div>
		</div>
	);
};
