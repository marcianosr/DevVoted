import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { StatBadge } from "./StatBadge.ui";

type RunSummaryProps = {
	won: boolean;
	gatesCleared: number;
	coverage: number;
	storage: number;
	onRestart: () => void;
};

/** End-of-run outcome: summit or death, with the run's final stats. */
export const RunSummary = ({
	won,
	gatesCleared,
	coverage,
	storage,
	onRestart,
}: RunSummaryProps) => (
	<div className="flex flex-col gap-6">
		<div
			className={`rounded-xl border p-6 ${won ? "border-viridian bg-viridian/10" : "border-cinnabar bg-cinnabar/10"}`}
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
		<button
			type="button"
			onClick={onRestart}
			className="self-start rounded-lg bg-cerulean px-6 py-3 font-bold text-black transition hover:brightness-110"
		>
			Play again →
		</button>
	</div>
);
