import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { PollOptionList } from "./PollOptionList.ui";
import type { PollAnsweringOption } from "./PollOptionList.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollOptionList> = {
	component: PollOptionList,
	title: "Polls/PollOptionList",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollOptionList>;

const options: PollAnsweringOption[] = [
	{ id: "1", text: "`Array.prototype.at(-1)`" },
	{ id: "2", text: "`Array.prototype.slice(-1)[0]`" },
	{ id: "3", text: "`Array.prototype.pop()`", disabled: true },
	{ id: "4", text: "`Array.prototype.last()`" },
];

const InteractiveList = ({ multiple }: { multiple: boolean }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	return (
		<PollOptionList
			options={options}
			selectedIds={selectedIds}
			answerType={multiple ? "multiple" : "single"}
			onToggle={(id) =>
				setSelectedIds((current) => {
					if (!multiple) return [id];
					return current.includes(id)
						? current.filter((value) => value !== id)
						: [...current, id];
				})
			}
		/>
	);
};

export const SingleSelect: Story = {
	render: () => <InteractiveList multiple={false} />,
};

export const MultipleSelect: Story = {
	render: () => <InteractiveList multiple={true} />,
};
