import { Button } from "~/ui/Button.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { StatBadge } from "../run/StatBadge.ui";

type GameOverScreenProps = {
	won: boolean;
	gatesCleared: number;
	victoryGate: number;
	coverage: number;
	storage: number;
	lootCollected: number;
	onClimbAgain: () => void;
};

export const GameOverScreen = ({
	won,
	gatesCleared,
	victoryGate,
	coverage,
	storage,
	lootCollected,
	onClimbAgain,
}: GameOverScreenProps) => (
	<div className="flex flex-col gap-6">
		<div
			className={`rounded-xl border p-6 ${won ? "border-viridian bg-celadon/30" : "border-cinnabar bg-cinnabar/30"}`}
		>
			<Title>{won ? "You summited! 🟢" : "Run over. 💥"}</Title>
			<Paragraph>
				{won
					? "You cleared every gate with your build intact."
					: `Your build broke at gate ${gatesCleared + 1}. The climb is over.`}
			</Paragraph>
		</div>

		<div className="flex flex-wrap gap-8">
			<StatBadge
				label="Gates cleared"
				value={`${gatesCleared} / ${victoryGate}`}
			/>
			<StatBadge label="Coverage" value={`${coverage}%`} />
			<StatBadge label="Storage" value={`${storage}KB`} />
		</div>

		<div className="flex flex-col gap-1 rounded-xl border border-saffron bg-saffron/10 p-5">
			<Subtitle>Loot collected</Subtitle>
			<Paragraph>
				<span className="text-xl font-bold text-saffron">
					+{lootCollected}KB
				</span>{" "}
				archived to your vault — a head start on your next run.
			</Paragraph>
		</div>

		<Button
			variant="primary"
			className="self-start rounded-lg text-sm"
			onClick={onClimbAgain}
		>
			Climb again →
		</Button>
	</div>
);
