import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type BuildSummaryProps = {
	demands: readonly string[];
	rewardMultiplier: number;
};

/** A pre-answer summary of what the current build's gate demands, and what a clear pays. */
export const BuildSummary = ({
	demands,
	rewardMultiplier,
}: BuildSummaryProps) => (
	<div className="rounded-lg bg-zinc-900 p-4">
		<Subtitle className="mb-2">Your gate will demand</Subtitle>
		<ul className="flex flex-col gap-1">
			{demands.map((demand) => (
				<li key={demand}>
					<Paragraph>• {demand}</Paragraph>
				</li>
			))}
		</ul>
		{rewardMultiplier > 1 ? (
			<Paragraph className="mt-2">
				Clear pays{" "}
				<span className="font-bold text-saffron">
					×{rewardMultiplier} storage
				</span>
			</Paragraph>
		) : null}
	</div>
);
