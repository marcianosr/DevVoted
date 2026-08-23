import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip.ui";
import { Delta } from "./Delta.ui";
import { Pick } from "./Pick.ui";

const meta: Meta<typeof Pick> = {
	component: Pick,
	title: "Modern/Pick",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-2xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Pick>;

const Tickable = ({ start = false }: { start?: boolean }) => {
	const [checked, setChecked] = useState(start);

	return (
		<Pick
			label="AGENTS.md"
			checked={checked}
			onToggle={setChecked}
			notes={<Delta multiplier={2} />}
		/>
	);
};

export const Unpicked: Story = { render: () => <Tickable /> };

export const Picked: Story = { render: () => <Tickable start /> };

export const Bare: Story = {
	args: { label: ".ts", checked: false, onToggle: () => {} },
};

export const EveryNote: Story = {
	render: () => (
		<div className="flex flex-col">
			<Pick
				label=".ts"
				checked={false}
				onToggle={() => {}}
				notes={<Delta multiplier={1.25} />}
			/>
			<Pick
				label="ESLint"
				checked
				onToggle={() => {}}
				notes={<Chip tone="muted">lint</Chip>}
			/>
			<Pick
				label="IndexedDB"
				checked={false}
				onToggle={() => {}}
				notes={<Chip tone="celadon">+8 / correct</Chip>}
			/>
			<Pick
				label="Freemium"
				checked={false}
				onToggle={() => {}}
				notes={<Chip tone="cinnabar">−128 on clear</Chip>}
			/>
		</div>
	),
};
