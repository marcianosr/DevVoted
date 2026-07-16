import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { StatBadge } from "./StatBadge.ui";

type RunSummaryProps = {
	won: boolean;
	gatesCleared: number;
	coverage: number;
	storage: number;
};

/** End-of-run outcome: summit or death, with the run's final stats. */
export const RunSummary = ({
	won,
	gatesCleared,
	coverage,
	storage,
}: RunSummaryProps) => (
	<div className="flex flex-col gap-6">
		<div
			className={`rounded-xl border p-6 ${won ? "border-viridian bg-viridian/30" : "border-cinnabar bg-cinnabar/30"}`}
		>
			<Title>{won ? "You summited! 🟢" : "Run over. 💥"}</Title>
			<Paragraph>
				{won
					? "You cleared every gate with your build intact."
					: "Your pipeline was stripped bare and broke."}
			</Paragraph>
		</div>
		<div className="flex flex-wrap gap-8">
			<StatBadge label="Gates cleared" value={gatesCleared} />
			<StatBadge label="Coverage" value={`${coverage}%`} />
			<StatBadge label="Storage" value={`${storage}KB`} />
		</div>
	</div>
);
