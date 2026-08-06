import { cva } from "class-variance-authority";
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

const titleWithAccent = cva("border-l-4 pl-4 flex flex-col gap-2", {
	variants: {
		won: {
			true: "border-l-viridian text-viridian",
			false: "border-l-cinnabar text-cinnabar",
		},
	},
});

const sectionWithAccent = cva("border-l-4 pl-4 flex flex-col gap-2", {
	variants: {
		variant: {
			success: "border-l-viridian",
			warning: "border-l-saffron",
		},
	},
});

export const GameOverScreen = ({
	won,
	gatesCleared,
	victoryGate,
	coverage,
	storage,
	lootCollected,
	onClimbAgain,
}: GameOverScreenProps) => (
	<div className="flex flex-col gap-8">
		<div className={titleWithAccent({ won })}>
			<Title>{won ? "You summited! 🟢" : "Run over. 💥"}</Title>
			<Paragraph>
				{won
					? "You cleared every gate with your build intact."
					: `Your build broke at gate ${gatesCleared}. The climb is over.`}
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

		<div className={sectionWithAccent({ variant: "warning" })}>
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
