import type { Meta, StoryObj } from "@storybook/react";

import { FoldableRow, type Fold } from "./FoldableRow.ui";

// Game-design reason: the fold is how a pipeline row answers "what does this
// config do?" without leaving the table — tap to a one-liner, tap back open.
const meta: Meta<typeof FoldableRow> = {
	component: FoldableRow,
	title: "UI/FoldableRow",
	decorators: [
		// Rows are subgrids — they only lay out inside the pipeline's
		// three-column parent grid (mirrors PipelineTable).
		(Story) => (
			<div className="grid w-96 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof FoldableRow>;

const summaryCells = ({ expanded, toggle, marker }: Fold) => (
	<>
		<span className="col-start-1 row-start-1">●</span>
		<span className="col-start-2 row-start-1">
			<button type="button" aria-expanded={expanded} onClick={toggle}>
				.js
			</button>
		</span>
		<span className="col-start-3 row-start-1 flex items-center gap-3">
			+0.5%
			{marker}
		</span>
	</>
);

// Narrow the preview under 640px to see the default fold flip: the detail shuts
// itself on a phone and the caret turns to point at what is left to open.
const detailBlock = ({ detailClass }: Fold) => (
	<span
		className={`col-span-2 col-start-2 row-start-2 mt-1.5 flex-col gap-1 border-l border-edge-strong pl-3 ${detailClass}`}
	>
		<span>Answer a JavaScript poll correctly.</span>
		<span>Then all coverage earns ×1.5.</span>
	</span>
);

export const FoldsOnTap: Story = {
	args: { summary: summaryCells, detail: detailBlock },
};

export const WholeRowActivates: Story = {
	args: {
		summary: summaryCells,
		detail: detailBlock,
		onActivate: () => {},
		className: "rounded-lg border-1 border-dashed border-celadon px-3",
	},
};

export const AlwaysOpen: Story = {
	args: { summary: summaryCells, detail: detailBlock, foldable: false },
};
