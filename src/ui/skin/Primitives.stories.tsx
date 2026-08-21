import type { Meta, StoryObj } from "@storybook/react";

import { Chevron } from "./Chevron.ui";
import { Subtitle } from "./Subtitle.ui";
import { Title } from "./Title.ui";

// Game-design reason: these three carry every heading the run surfaces wear, so
// the reskin's readability stands or falls here rather than in any one screen.
const Row = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div className="flex items-baseline gap-4 border-b border-edge p-2">
		<span className="w-24 shrink-0 text-xs text-zinc-500">{label}</span>
		{children}
	</div>
);

const Primitives = () => (
	<div className="w-[26rem] bg-surface">
		<Row label="h1">
			<Title as="h1">Pipeline</Title>
		</Row>
		<Row label="h2">
			<Title as="h2">Pipeline</Title>
		</Row>
		<Row label="h3">
			<Title as="h3">Pipeline</Title>
		</Row>
		<Row label="muted">
			<Subtitle>4 firing · 1 offline · 3 billed</Subtitle>
		</Row>
		<Row label="default">
			<Subtitle tone="default">4 firing · 1 offline · 3 billed</Subtitle>
		</Row>
		<Row label="chevron shut">
			<details className="group/foldable">
				<summary className="list-none [&::-webkit-details-marker]:hidden">
					<Chevron />
				</summary>
			</details>
		</Row>
		<Row label="chevron open">
			<details open className="group/foldable">
				<summary className="list-none [&::-webkit-details-marker]:hidden">
					<Chevron />
				</summary>
			</details>
		</Row>
	</div>
);

const meta: Meta<typeof Primitives> = {
	component: Primitives,
	title: "Skin/Primitives",
};
export default meta;

type Story = StoryObj<typeof Primitives>;

export const All: Story = {};
