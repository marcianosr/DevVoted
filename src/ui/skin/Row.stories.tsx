import type { Meta, StoryObj } from "@storybook/react";

import { Definitions } from "./Definitions.ui";
import { Entry } from "./Entry.ui";
import { Row } from "./Row.ui";
import { Subtitle } from "./Subtitle.ui";

// Game-design reason: one row shape across the run means a player learns to read
// a line once — an option, a config and a poll record all scan the same way.
const Sizes = () => (
	<div className="w-[26rem] space-y-6">
		<div className="border border-edge bg-surface divide-y divide-edge">
			<Row spacing="tight">tight — facts folded under a row</Row>
			<Row spacing="compact">compact — a pipeline line</Row>
			<Row spacing="spacious">spacious — a row you pick or read</Row>
		</div>

		<div className="border border-edge bg-surface divide-y divide-edge">
			<Row spacing="compact" trailing={<Subtitle>+16 KB</Subtitle>}>
				with a trailing cell
			</Row>
			<Row spacing="compact" dimmed trailing={<Subtitle>offline</Subtitle>}>
				dimmed
			</Row>
		</div>
	</div>
);

// The same row, standalone: no Foldable, no <li>, nothing wrapping it.
const Standalone = () => (
	<div className="w-[26rem] space-y-6">
		<div className="border border-edge bg-surface">
			<Definitions
				items={[
					{ term: "Category", detail: "typescript" },
					{ term: "Answer type", detail: "single" },
				]}
			/>
		</div>

		<div className="border border-edge bg-surface">
			<Entry
				mark="pass"
				label="Intellisense"
				detail="×1.5 on 2 answers"
				value="firing"
				valueTone="muted"
			/>
		</div>
	</div>
);

const meta: Meta<typeof Sizes> = {
	component: Sizes,
	title: "Skin/Row",
};
export default meta;

type Story = StoryObj<typeof Sizes>;

export const Spacings: Story = {};

export const OutsideAFoldable: StoryObj<typeof Standalone> = {
	render: () => <Standalone />,
};
