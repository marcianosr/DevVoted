import { hasThemeColor, swatchForGate } from "~/modules/run/gate/swatch.model";
import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { gateStake } from "~/modules/run/rules.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
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
		? "strip all — run over"
		: `strip ${strips} config${strips === 1 ? "" : "s"}`;

const GainRow = ({
	label,
	current,
	preview,
}: {
	label: string;
	current: string;
	preview?: string;
}) => (
	<li>
		<Paragraph as="span" size="xs" tone="muted">
			{preview !== undefined && preview !== current ? (
				<>
					<span className="font-extrabold text-zinc-400">{current}</span>
					<span className="font-extrabold text-celadon"> → {preview}</span>
				</>
			) : (
				<span className="font-extrabold text-gradient-green">{current}</span>
			)}{" "}
			{label}
		</Paragraph>
	</li>
);

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
		<section
			data-testid="gate-stake-receipt"
			className="flex flex-col gap-3 rounded border border-zinc-800 px-4 py-3"
		>
			<div
				{...(swatch && hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
				className="flex items-center gap-2"
			>
				{swatch ? <SwatchMark finish={swatch.finish} size="sm" /> : null}
				<Title className={swatch ? swatchNameClass(swatch.finish) : undefined}>
					{gateName} gate
				</Title>
			</div>
			<div className="flex flex-col gap-2">
				<Title as="h2">Objectives</Title>
				<ul className="flex flex-col gap-1 list-disc pl-4 marker:text-zinc-500">
					<li>
						<Paragraph tone="muted">Make your pipeline succeed</Paragraph>
					</li>
					<li>
						<Paragraph tone="muted">
							Answer {pollsPerGate} polls this window
						</Paragraph>
					</li>
				</ul>
			</div>
			<hr className="border-t border-zinc-800" />
			<div className="flex flex-col gap-2">
				<Title as="h2">Rewards</Title>
				<ul className="flex flex-col gap-1 list-disc pl-4 marker:text-zinc-500">
					<GainRow
						label="storage this gate"
						current={`+${modifiers.gateReward}KB`}
						preview={preview && `+${preview.gateReward}KB`}
					/>
					<GainRow
						label="coverage this gate"
						current={coverageValue(modifiers)}
						preview={preview && coverageValue(preview)}
					/>
				</ul>
			</div>
			<hr className="border-t border-zinc-800" />
			<div className="flex flex-col gap-2">
				<Title as="h2">Penalty</Title>
				<ul className="flex flex-col gap-1 list-disc pl-4 marker:text-zinc-500">
					<li>
						<Paragraph tone="muted">
							When a pipeline fails,{" "}
							<Paragraph as="span" tone="cinnabar" className="font-bold">
								{stripLabel(stripsOnFailure, configCount)}
							</Paragraph>
						</Paragraph>
					</li>
					{billKb !== undefined && billKb > 0 ? (
						<li>
							<Paragraph tone="muted">
								Storage plan bills{" "}
								<Paragraph as="span" tone="cinnabar" className="font-bold">
									−{billKb}KB
								</Paragraph>{" "}
								when this window closes — pass or fail
							</Paragraph>
						</li>
					) : null}
				</ul>
			</div>
		</section>
	);
};
