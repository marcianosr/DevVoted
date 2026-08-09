import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { gateStake } from "~/modules/run/rules.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { coverageValue } from "./GateModifierStrip.ui";

type GateStakeReceiptProps = {
	stripsOnFailure: number;
	configCount: number;
	modifiers: PipelineModifiers;
	preview?: PipelineModifiers;
};

const stripLabel = (strips: number, configCount: number): string =>
	gateStake(strips, configCount).fatal
		? "strip all — run over"
		: `strip ${strips} config${strips === 1 ? "" : "s"}`;

const FIGURE = "text-xl font-extrabold tabular-nums";

const PreviewableStat = ({
	current,
	preview,
}: {
	current: string;
	preview?: string;
}) => {
	if (preview !== undefined && preview !== current)
		return (
			<span className={FIGURE}>
				<span className="text-zinc-400">{current}</span>
				<span className="text-celadon"> → {preview}</span>
			</span>
		);
	return <span className={`${FIGURE} text-gradient-green`}>{current}</span>;
};

const StakeRow = ({
	label,
	current,
	preview,
}: {
	label: string;
	current: string;
	preview?: string;
}) => (
	<li className="flex items-baseline justify-between gap-4">
		<Paragraph tone="muted">{label}</Paragraph>
		<PreviewableStat current={current} preview={preview} />
	</li>
);

export const GateStakeReceipt = ({
	stripsOnFailure,
	configCount,
	modifiers,
	preview,
}: GateStakeReceiptProps) => (
	<section
		data-testid="gate-stake-receipt"
		className="flex flex-col gap-2 rounded border border-zinc-800 px-4 py-3"
	>
		<div className="flex flex-col gap-2">
			<Title>Gate rewards</Title>
			<ul className="flex flex-col">
				<StakeRow
					label="Clear reward"
					current={`+${modifiers.gateReward}KB`}
					preview={preview && `+${preview.gateReward}KB`}
				/>
				<StakeRow
					label="Base reward"
					current={`×${modifiers.rewardMultiplier}`}
					preview={preview && `×${preview.rewardMultiplier}`}
				/>
				<StakeRow
					label="Coverage bonus"
					current={coverageValue(modifiers)}
					preview={preview && coverageValue(preview)}
				/>
			</ul>
		</div>
		<hr className="border-t border-zinc-800" />
		<div className="flex flex-col gap-2">
			<Title>Gate penalty</Title>
			<ul className="flex flex-col gap-1">
				<li>
					<Paragraph tone="muted">
						When a pipeline fails,{" "}
						<Paragraph as="span" tone="cinnabar" className="font-bold">
							{stripLabel(stripsOnFailure, configCount)}
						</Paragraph>
					</Paragraph>
				</li>
			</ul>
		</div>
	</section>
);
