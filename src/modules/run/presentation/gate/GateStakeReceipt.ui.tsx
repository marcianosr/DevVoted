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
	/** The storage plan's recurring bill — omitted (or 0) on the free tier. */
	billKb?: number;
};

const stripLabel = (strips: number, configCount: number): string =>
	gateStake(strips, configCount).fatal
		? "strip all — run over"
		: `strip ${strips} config${strips === 1 ? "" : "s"}`;

/** A gain the gate pays out, read inline with its label: "+32KB storage this gate". */
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
		<Paragraph as="span" size="sm">
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
	stripsOnFailure,
	configCount,
	modifiers,
	preview,
	billKb,
}: GateStakeReceiptProps) => (
	<section
		data-testid="gate-stake-receipt"
		className="flex flex-col gap-2 rounded border border-zinc-800 px-4 py-3"
	>
		<div className="flex flex-col gap-2">
			<Title>Gate rewards</Title>
			<ul className="flex flex-col">
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
