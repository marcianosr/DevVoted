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
		<TerminalPanel title="Build Summary">
			<div data-testid="gate-stake-receipt" className="flex flex-col gap-1.5">
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
				<div className="flex flex-col gap-1">
					<Title as="h3">Objective</Title>
					<ul className="flex flex-col list-disc pl-4 marker:text-zinc-500">
						<li>
							<Paragraph tone="muted">Clear your pipeline</Paragraph>
						</li>
						<li>
							<Paragraph tone="muted">
								Answer {pollsPerGate} polls this window
							</Paragraph>
						</li>
					</ul>
				</div>
				<hr className="border-t border-zinc-800" />
				<div className="flex flex-col gap-1">
					<Title as="h3">On clear</Title>
					<ul className="flex flex-col list-disc pl-4 marker:text-zinc-500">
						<GainRow
							label="storage"
							current={`+${modifiers.gateReward}KB`}
							preview={preview && `+${preview.gateReward}KB`}
						/>
						<GainRow
							label="coverage"
							current={coverageValue(modifiers)}
							preview={preview && coverageValue(preview)}
						/>
					</ul>
				</div>
				<hr className="border-t border-zinc-800" />
				<div className="flex flex-col gap-1">
					<Title as="h3">On fail</Title>
					<ul className="flex flex-col list-disc pl-4 marker:text-zinc-500">
						<li>
							<Paragraph as="span" tone="cinnabar" className="font-bold">
								{stripLabel(stripsOnFailure, configCount)}
							</Paragraph>
						</li>
						{billKb !== undefined && billKb > 0 ? (
							<li>
								<Paragraph tone="muted">
									<Paragraph as="span" tone="cinnabar" className="font-bold">
										−{billKb}KB
									</Paragraph>{" "}
									storage bill — pass or fail
								</Paragraph>
							</li>
						) : null}
					</ul>
				</div>
			</div>
		</TerminalPanel>
	);
};
