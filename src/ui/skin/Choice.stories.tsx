import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Choice } from "./Choice.ui";
import { Foldable } from "./Foldable.ui";

// Game-design reason: an option the shop has blocked still has to be readable —
// the player needs to see what they cannot pick, and why, before they commit.
type Option = { id: string; label: string; blocked?: string };

const OPTIONS: Option[] = [
	{ id: "slice-neg", label: "arr.slice(-2)" },
	{ id: "splice-neg", label: "arr.splice(-2)" },
	{
		id: "slice-pos",
		label: "arr.slice(2)",
		blocked: "blocked by ESLint · 16 KB",
	},
	{ id: "at-neg", label: "arr.at(-2)" },
];

const OptionList = ({ multiple = false }: { multiple?: boolean }) => {
	const [picked, setPicked] = useState<readonly string[]>([]);

	const toggle = (id: string, checked: boolean) => {
		if (multiple) {
			setPicked((current) =>
				checked ? [...current, id] : current.filter((held) => held !== id)
			);
			return;
		}
		setPicked(checked ? [id] : []);
	};

	return (
		<Foldable
			title="Which one returns the last two?"
			subtitle={multiple ? "pick all that apply" : "pick one"}
			items={OPTIONS.map((option) => ({
				id: option.id,
				content: (
					<Choice
						name="answer"
						multiple={multiple}
						label={option.label}
						checked={picked.includes(option.id)}
						disabled={Boolean(option.blocked)}
						note={option.blocked}
						onChange={(checked) => toggle(option.id, checked)}
					/>
				),
			}))}
		/>
	);
};

const meta: Meta<typeof OptionList> = {
	component: OptionList,
	title: "Skin/Choice",
	decorators: [
		(Story) => (
			<div className="w-[26rem]">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof OptionList>;

export const SingleAnswer: Story = { args: { multiple: false } };

export const MultipleChoice: Story = { args: { multiple: true } };
