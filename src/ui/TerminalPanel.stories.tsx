import type { Meta, StoryObj } from "@storybook/react";

import { Paragraph } from "~/ui/typography/Paragraph.component";
import { TerminalPanel, TerminalSection } from "./TerminalPanel.ui";

const meta: Meta<typeof TerminalPanel> = {
	component: TerminalPanel,
	title: "Layout/TerminalPanel",
};
export default meta;

type Story = StoryObj<typeof TerminalPanel>;

export const Default: Story = {
	args: {
		title: "Shop",
		children: (
			<>
				<TerminalSection label="Install configs">
					<Paragraph tone="muted">git ts rb …</Paragraph>
				</TerminalSection>
				<TerminalSection label="Storage">
					<Paragraph tone="muted">512KB · 640KB · 768KB</Paragraph>
				</TerminalSection>
			</>
		),
	},
};
