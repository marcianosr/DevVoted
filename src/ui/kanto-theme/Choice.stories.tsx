import type { Meta, StoryObj } from "@storybook/react";

import { Choice } from "./Choice.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const LETTERS = ["A", "B", "C", "D"];

const Poll = ({
	question,
	answers,
	picked,
	struck,
}: {
	question: string;
	answers: string[];
	picked?: number;
	struck?: number;
}) => (
	<Screen theme="cerulean" width="narrow">
		<Typography variant="headline">{question}</Typography>
		<div className="flex flex-col">
			{answers.map((answer, index) => (
				<Choice
					key={answer}
					letter={LETTERS[index] ?? "?"}
					picked={index === picked}
					crossedOut={index === struck}
				>
					{answer}
				</Choice>
			))}
		</div>
	</Screen>
);

const meta: Meta<typeof Choice> = {
	component: Choice,
	title: "Kanto/Choice",
	argTypes: {
		picked: { control: "boolean" },
		crossedOut: { control: "boolean" },
	},
	args: { letter: "A", children: "at(-1)" },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Choice {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Choice>;

export const Default: Story = {};

export const Picked: Story = { args: { picked: true } };

export const CrossedOut: Story = {
	args: { children: "party.pop()", crossedOut: true, onPick: () => {} },
};

export const Linted: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Poll
			question="Which reads the last Pokémon in the party?"
			answers={["party.at(-1)", "party.slice(-1)", "party.pop()", "party[-1]"]}
			struck={2}
		/>
	),
};

export const ShortCode: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Poll
			question="Which reads the last Pokémon in the party?"
			answers={["party.at(-1)", "party.slice(-1)", "party.pop()", "party[-1]"]}
			picked={0}
		/>
	),
};

export const ShortProse: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Poll
			question="Which Kanto gym hands out the Boulder Badge?"
			answers={[
				"Pewter City",
				"Viridian City",
				"Cerulean City",
				"Saffron City",
			]}
			picked={0}
		/>
	),
};

export const LongProse: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Poll
			question="Why does Professor Oak hand out the Pokédex before a partner?"
			answers={[
				"Because the Pokédex is the assignment and the partner is only the means of completing it, which is why he gives one to a rival as well.",
				"Because a partner without a record of what it has met cannot be trained, so the order of the two gifts is fixed by the mechanics.",
				"Because the Pokédex is the cheaper gift and Oak is funding the expedition out of his own grant money.",
			]}
		/>
	),
};

export const Sealed: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<div className="flex flex-col">
				<Choice letter="A">party.at(-1)</Choice>
				<Choice letter="B" picked>
					party.slice(-1)
				</Choice>
				<Choice letter="C">party.pop()</Choice>
				<Choice letter="D" seal={{ price: "4 KB", onUnseal: () => {} }} />
			</div>
		</Screen>
	),
};

export const SealedUnaffordable: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<div className="flex flex-col">
				<Choice letter="C" seal={{ price: "32 KB" }} />
				<Choice letter="D" seal={{ price: "4 KB" }} />
			</div>
		</Screen>
	),
};

export const ProseWithCode: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Poll
			question="How would you find the heaviest Pokémon on the team?"
			answers={[
				"party.reduce((a, b) => (a.weight > b.weight ? a : b)), which throws on an empty party unless you seed it with a starting value.",
				"party.sort((a, b) => b.weight - a.weight)[0], which quietly reorders the party you were handed rather than reading from it.",
				"Math.max(...party.map((p) => p.weight)), which gives you the weight but loses the Pokémon that carried it.",
			]}
			picked={0}
		/>
	),
};
