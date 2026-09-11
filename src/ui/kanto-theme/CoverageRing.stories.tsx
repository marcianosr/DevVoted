import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { CoverageRing } from "./CoverageRing.ui";
import { Screen } from "./Screen.ui";

const LADDER = "flex flex-col gap-5";

const meta: Meta<typeof CoverageRing> = {
	component: CoverageRing,
	title: "Kanto/CoverageRing",
	argTypes: {
		held: { control: { type: "range", min: 0, max: 400, step: 0.1 } },
		demand: { control: { type: "range", min: 0, max: 375 } },
	},
	args: {
		held: 148,
		demand: 210,
		title: "Coverage toward Volcano",
		note: "Pick an answer to see where it puts you.",
	},
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<CoverageRing {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof CoverageRing>;

export const TowardVolcano: Story = {};

export const Untouched: Story = {
	args: { held: 0, note: "Nothing banked at this gate yet." },
};

export const EarlyGate: Story = {
	args: {
		held: 1.2,
		demand: 3,
		title: "Coverage toward Pallet",
		note: "A tenth still reads exactly.",
	},
};

export const Met: Story = {
	args: { held: 210, note: "The gate's bar is cleared." },
};

export const PastTheDemand: Story = {
	args: {
		held: 260,
		note: "The tick shows where the demand fell.",
	},
};

export const NoNote: Story = { args: { note: undefined } };

export const LongestReading: Story = {
	args: {
		held: 375.9,
		demand: 375,
		title: "Coverage toward the Champion",
		note: "The most digits the ring can ever hold.",
	},
};

export const Ladder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={LADDER}>
				<CoverageRing held={0} demand={210} title="Nothing held" />
				<CoverageRing held={1.2} demand={210} title="Barely started" />
				<CoverageRing held={148} demand={210} title="Part way" />
				<CoverageRing held={210} demand={210} title="Met" />
				<CoverageRing held={315} demand={210} title="Half again past it" />
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<CoverageRing
						held={148}
						demand={210}
						title={`Coverage in ${theme}`}
					/>
				</Screen>
			))}
		</div>
	),
};
