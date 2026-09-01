import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { Change } from "./Change.ui";
import { Dot } from "./Dot.ui";
import { Slots } from "./Slots.ui";
import { Press } from "./Press.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const noop = () => {};

const meta: Meta<typeof Row> = {
	component: Row,
	title: "Terminal/Row",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Row>;

export const Config: Story = {
	args: {
		leading: <Slots family="focus" slots={1} />,
		name: ".js",
		detail: "JS polls ×1.25",
		trailing: <Press label="upgrade ↑" onUse={noop} />,
	},
};

export const WithStatusDot: Story = {
	args: {
		leading: (
			<>
				<Dot variant="on" />
				<Slots family="risk" slots={1} />
			</>
		),
		name: "Deprecated",
		detail: "all coverage ×2.5 · gone in 3 clears",
		trailing: <Text tone="muted">2</Text>,
	},
};

export const Versioned: Story = {
	args: {
		leading: <Slots family="focus" slots={1} />,
		name: ".js",
		tag: <Badge tone="muted">v2</Badge>,
		detail: "JS polls ×1.5",
		trailing: <Text tone="muted">3</Text>,
	},
};

export const Upgrading: Story = {
	args: {
		leading: <Slots family="defense" slots={1} />,
		name: "ESLint",
		tag: <Change from="v1" to="v2" />,
		detail: "Cross out a wrong answer",
		trailing: <Change from="×1.75" to="×2" />,
	},
};

export const Dimmed: Story = {
	args: {
		leading: <Slots family="amplify" slots={1} />,
		name: "Overclock",
		detail: "first answer ×4, every later one ×0.5",
		dimmed: true,
	},
};

export const NameOnly: Story = {
	args: { name: "answer all 5 polls" },
};
