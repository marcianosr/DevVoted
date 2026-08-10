import { hasThemeColor, swatchForGate } from "~/modules/run/gate/swatch.model";
import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { gateStake } from "~/modules/run/rules.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { TerminalPanel } from "~/ui/TerminalPanel.ui";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { coverageValue } from "./GateModifierStrip.ui";

type GateStakeReceiptProps = {
	gateNumber: number;
	pollsPerGate: number;
	stripsOnFailure: number;
	configCount: number;
	modifiers: PipelineModifiers;
	preview?: PipelineModifiers;
	billKb?: number;
};

const stripLabel = (strips: number, configCount: number): string =>
	gateStake(strips, configCount).fatal
		? "Strip all — run over"
		: `Strip ${strips} config${strips === 1 ? "" : "s"}`;

const Arrow = () => (
	<span aria-hidden className="text-zinc-600">
		→
	</span>
);

const StageLabel = ({
	tone,
	children,
}: {
	tone: "viridian" | "cinnabar";
	children: string;
}) => (
	<Paragraph
		as="span"
		size="xs"
		tone={tone}
		className="uppercase tracking-wide opacity-70"
	>
		{children}
	</Paragraph>
);

/** One metric's value, diff-highlighted old→new when a hovered pick would change it. */
const MetricValue = ({
	current,
	preview,
}: {
	current: string;
	preview?: string;
}) => {
	if (preview !== undefined && preview !== current)
		return (
			<>
				<span className="text-zinc-400">{current}</span>
				<span className="text-celadon"> → {preview}</span>
			</>
		);
	return <span className="text-gradient-green">{current}</span>;
};

/**
 * The stake as one flowing sequence — polls → reward → fail consequence —
 * instead of separate headed sections (Marciano, 2026-08-10): the causal
 * chain a player actually cares about ("what do I answer, what do I get,
 * what do I lose") reads faster left-to-right than three stacked panels.
 */
export const GateStakeReceipt = ({
	gateNumber,
	pollsPerGate,
	stripsOnFailure,
	configCount,
	modifiers,
	preview,
	billKb,
}: GateStakeReceiptProps) => {
	const swatch = swatchForGate(gateNumber);
	const gateName = swatch?.gateName ?? `Gate ${gateNumber}`;
	return (
		<TerminalPanel title="Build Summary">
			<div data-testid="gate-stake-receipt" className="flex flex-col gap-3">
				<div
					{...(swatch && hasThemeColor(swatch)
						? swatchTheme(swatch.theme)
						: {})}
					className="flex items-center gap-2"
				>
					{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
					<Title
						className={swatch ? swatchNameClass(swatch.finish) : undefined}
					>
						{gateName} gate
					</Title>
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<Paragraph as="span" className="font-bold">
							{pollsPerGate} polls
						</Paragraph>
						<Arrow />
						<StageLabel tone="viridian">clear</StageLabel>
						<Paragraph as="span" className="font-bold">
							<MetricValue
								current={`+${modifiers.gateReward}KB`}
								preview={preview && `+${preview.gateReward}KB`}
							/>
							{" · "}
							<MetricValue
								current={coverageValue(modifiers)}
								preview={preview && coverageValue(preview)}
							/>
						</Paragraph>
						<Arrow />
						<StageLabel tone="cinnabar">fail</StageLabel>
						<Paragraph as="span" tone="cinnabar" className="font-bold">
							{stripLabel(stripsOnFailure, configCount)}
						</Paragraph>
					</div>
					{billKb !== undefined && billKb > 0 ? (
						<Paragraph tone="muted">
							<Paragraph as="span" tone="cinnabar" className="font-bold">
								−{billKb}KB
							</Paragraph>{" "}
							storage bill — pass or fail
						</Paragraph>
					) : null}
				</div>
			</div>
		</TerminalPanel>
	);
};
