import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { PollAnsweringScreen } from "./PollAnsweringScreen.ui";
import type { PollAnsweringOption } from "./PollOptionList.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollAnsweringScreen> = {
	component: PollAnsweringScreen,
	title: "Polls/PollAnsweringScreen",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollAnsweringScreen>;

const options: PollAnsweringOption[] = [
	{ id: "1", text: "`Array.prototype.at(-1)`" },
	{ id: "2", text: "`Array.prototype.slice(-1)[0]`" },
	{ id: "3", text: "`Array.prototype.pop()`", disabled: true },
	{ id: "4", text: "`Array.prototype.last()`" },
];

const InteractiveScreen = ({ eslintActive }: { eslintActive: boolean }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	return (
		<PollAnsweringScreen
			question="Which method returns the last element of an array?"
			answerType="single"
			activeConfigs={[{ id: "prettier", name: "Prettier", rarity: "rare" }]}
			options={options}
			selectedIds={selectedIds}
			onToggle={(id) => setSelectedIds([id])}
			submit={{
				canSubmit: selectedIds.length > 0,
				isSubmitting: false,
				submitted: false,
				eslintActive,
				hint: "Pick an option to continue.",
				onSubmit: () => {},
			}}
		/>
	);
};

export const Default: Story = {
	render: () => <InteractiveScreen eslintActive={false} />,
};

export const WithEslint: Story = {
	render: () => <InteractiveScreen eslintActive={true} />,
};
