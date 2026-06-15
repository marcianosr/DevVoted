import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown, DropdownItem, DropdownDivider } from "./Dropdown.component";

const meta: Meta<typeof Dropdown> = {
	component: Dropdown,
	title: "UI/Dropdown",
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
	args: {
		trigger: ({ isOpen }) => <span>{isOpen ? "▲ Menu" : "▼ Menu"}</span>,
		children: ({ close }) => (
			<>
				<DropdownItem onClick={close}>View profile</DropdownItem>
				<DropdownItem onClick={close}>Settings</DropdownItem>
				<DropdownDivider />
				<DropdownItem variant="danger" onClick={close}>
					Sign out
				</DropdownItem>
			</>
		),
	},
};

export const AlignLeft: Story = {
	args: {
		align: "left",
		trigger: () => <span>▼ Actions</span>,
		children: ({ close }) => <DropdownItem onClick={close}>Open</DropdownItem>,
	},
};
