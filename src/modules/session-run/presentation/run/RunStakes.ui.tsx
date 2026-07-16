import { GradientText } from "~/ui/typography/GradientText.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type RunStakesProps = {
	gateReward: number;
};

export const RunStakes = ({ gateReward }: RunStakesProps) => (
	<div className="rounded-xl border border-zinc-700 p-4">
		<Title as="h3" size="sm">
			Run stakes
		</Title>
		<ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-white marker:text-pewter">
			<li>
				<Paragraph size="sm">
					Fail a gate: you{" "}
					<Paragraph size="sm" as="span" tone="vermillion">
						remove 1 config
					</Paragraph>{" "}
					and try again, deeper gates require you to remove more
				</Paragraph>
			</li>
			<li>
				<Paragraph size="sm">
					Clear the gate by letting your pipelines succeed and receive rewards{" "}
					<GradientText className="font-black">
						+{gateReward}KB storage
					</GradientText>
				</Paragraph>
			</li>
		</ul>
	</div>
);
