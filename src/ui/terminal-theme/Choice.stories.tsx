import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { Choice } from "./Choice.ui";

const noop = () => {};

const meta: Meta<typeof Choice> = {
	component: Choice,
	title: "Terminal/Choice",
	decorators: [
		(Story) => (
			<div data-swatch-theme="lavender" className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Choice>;

export const Pickable: Story = {
	args: { letter: "A", label: "at(−1)", onPick: noop },
};

export const Selected: Story = {
	args: { letter: "A", label: "at(−1)", selected: true, onPick: noop },
};

export const SelectedWithNote: Story = {
	args: {
		letter: "A",
		label: "at(−1)",
		selected: true,
		note: <Badge tone="celadon">62% picked this</Badge>,
		onPick: noop,
	},
};

export const Expected: Story = {
	args: {
		letter: "A",
		label: "at(−1)",
		state: "expected",
		note: <Badge tone="viridian">expected · you picked</Badge>,
	},
};

export const Dimmed: Story = {
	args: { letter: "B", label: "pop()", state: "dimmed" },
};

/** What a linter leaves behind: struck through, and no longer pickable. */
export const CrossedOut: Story = {
	args: {
		letter: "B",
		label: "pop()",
		state: "crossedOut",
		note: "crossed out",
	},
};

/** 451 sealed this answer. The text is gone, the row is still pickable, and
 * the press buys the words back. */
export const Sealed: Story = {
	args: {
		letter: "C",
		label: "?????",
		seal: {
			price: "4 KB",
			hint: "Unseal this answer for 4 KB",
			onUnseal: noop,
		},
		onPick: noop,
	},
};

/** No handler, no press: the balance cannot cover the fee. */
export const SealedAndUnaffordable: Story = {
	args: {
		letter: "C",
		label: "?????",
		seal: {
			price: "4 KB",
			hint: "Unseal this answer for 4 KB — not enough storage",
		},
		onPick: noop,
	},
};

/** A sealed answer you gambled on anyway. */
export const SealedAndPicked: Story = {
	args: {
		letter: "C",
		label: "?????",
		selected: true,
		seal: {
			price: "4 KB",
			hint: "Unseal this answer for 4 KB",
			onUnseal: noop,
		},
		onPick: noop,
	},
};
