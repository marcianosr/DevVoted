import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { PollAnsweringScreen } from "./PollAnsweringScreen.ui";
import type { PollAnsweringOption } from "./PollOptionList.ui";
import { withGateTheme } from "./story-utils";

const meta: Meta<typeof PollAnsweringScreen> = {
	component: PollAnsweringScreen,
	title: "Polls/PollAnsweringScreen",
	decorators: [withGateTheme("marsh")],
};
export default meta;

type Story = StoryObj<typeof PollAnsweringScreen>;

const baseOptions: PollAnsweringOption[] = [
	{ id: "1", text: "`Array.prototype.at(-1)`" },
	{ id: "2", text: "`Array.prototype.slice(-1)[0]`" },
	{ id: "3", text: "`Array.prototype.pop()`" },
	{ id: "4", text: "`Array.prototype.last()`" },
];

const eslintOptions: PollAnsweringOption[] = baseOptions.map((option) =>
	option.id === "3"
		? {
				...option,
				disabled: true,
				removedByConfig: {
					name: "ESLint",
					rarity: "uncommon",
					description:
						"Disables 1 wrong option when answering JavaScript/TypeScript polls.",
				},
			}
		: option
);

const InteractiveScreen = ({ options }: { options: PollAnsweringOption[] }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	return (
		<PollAnsweringScreen
			question="Which method returns the last element of an array?"
			answerType="single"
			activeConfigs={[
				{
					id: "prettier",
					name: "Prettier",
					description: "Reveals how many correct answers you have selected.",
					rarity: "rare",
				},
			]}
			options={options}
			selectedIds={selectedIds}
			onToggle={(id) => setSelectedIds([id])}
			submit={{
				canSubmit: selectedIds.length > 0,
				isSubmitting: false,
				submitted: false,
				hint: "Pick an option to continue.",
				onSubmit: () => {},
			}}
		/>
	);
};

export const Default: Story = {
	render: () => <InteractiveScreen options={baseOptions} />,
};

export const WithEslint: Story = {
	render: () => <InteractiveScreen options={eslintOptions} />,
};
