import type { ReactNode } from "react";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type RunStakesProps = {
	gateReward: number;
};

type StakeRowProps = {
	label: string;
	tone: Extract<ParagraphTone, "viridian" | "cinnabar">;
	children: ReactNode;
};

const StakeRow = ({ label, tone, children }: StakeRowProps) => (
	<div className="flex gap-3">
		<Paragraph
			as="span"
			size="sm"
			tone={tone}
			className="w-20 shrink-0 font-bold"
		>
			{label}
		</Paragraph>
		<Paragraph size="sm">{children}</Paragraph>
	</div>
);

export const RunStakes = ({ gateReward }: RunStakesProps) => (
	<div className="rounded-xl border border-zinc-700 p-4">
		<Title as="h3" size="sm">
			Run rules
		</Title>
		<div className="mt-3 flex flex-col gap-3">
			<StakeRow label="Success:" tone="viridian">
				Complete every pipeline requirement to earn{" "}
				<Paragraph
					as="span"
					size="sm"
					tone="gradient"
					className="font-extrabold"
				>
					+{gateReward}KB
				</Paragraph>{" "}
				storage.
			</StakeRow>
			<StakeRow label="Failure:" tone="cinnabar">
				<Paragraph
					as="span"
					tone="vermillion"
					size="sm"
					className="font-extrabold"
				>
					Remove 1 config
				</Paragraph>
				, then retry the gate. Later gates have harsher penalties.
			</StakeRow>
		</div>
	</div>
);
