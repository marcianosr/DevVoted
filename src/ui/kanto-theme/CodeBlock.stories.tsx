import type { Meta, StoryObj } from "@storybook/react";

import { CodeBlock } from "./CodeBlock.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";

const TYPESCRIPT = `type Settings = {
	theme: string;
	retries: number;
};

const draft: Partial<Settings> = { theme: "kanto" };`;

const CSS = `.pipeline {
	display: flex;
	gap: 0.75rem;
	color: oklch(from var(--theme-color) 0.94 0.014 h);
}`;

const JAVA = `record Gate(int number, String name) {
	boolean isFinal() {
		return number == 12;
	}
}`;

const LONG_LINE = `const demand = coverageHeld * multiplier + focusBonus + openerBonus + cacheBonus - decayPerClear * gatesCleared;`;

const meta: Meta<typeof CodeBlock> = {
	component: CodeBlock,
	title: "Kanto/CodeBlock",
	args: { children: TYPESCRIPT },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<CodeBlock {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {};

export const Stylesheet: Story = { args: { children: CSS } };

export const Java: Story = { args: { children: JAVA } };

export const LongLineScrolls: Story = { args: { children: LONG_LINE } };

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:11rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<CodeBlock>{CSS}</CodeBlock>
				</Screen>
			))}
		</div>
	),
};
