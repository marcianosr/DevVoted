import type { Meta, StoryObj } from "@storybook/react";

import { Entry } from "./Entry.ui";
import { Foldable, type FoldableItem } from "./Foldable.ui";

// Game-design reason: the pipeline is the run's one persistent readout, so a
// config's state, its effect and what it will cost next have to sit on one line —
// and the line that owes an explanation has to be able to give it without
// pushing the other six off the screen.
const pipeline = (factsOpen: boolean): FoldableItem[] => [
	{
		id: "ts",
		content: (
			<Entry
				mark="skip"
				label=".ts"
				detail="not applied — offline"
				value="offline"
				valueTone="muted"
				dimmed
			/>
		),
	},
	{
		id: "intellisense",
		content: (
			<Entry
				mark="pass"
				label="Intellisense"
				detail="×1.5 on 2 answers"
				value="firing"
				valueTone="muted"
			/>
		),
	},
	{
		id: "agents",
		content: (
			<Entry
				mark="pass"
				dot="saffron"
				label="AGENTS.md"
				detail="×2 on 2 answers"
				value="firing"
				valueTone="muted"
			/>
		),
	},
	{
		id: "eslint",
		content: (
			<Entry
				mark="part"
				label="ESLint"
				detail="1 use on poll 3"
				value="-16 KB"
				valueTone="saffron"
				defaultOpen={factsOpen}
				facts={[
					{
						term: "next block",
						detail: "32 KB — the fee doubles per use",
						tone: "saffron",
					},
					{ term: "resets on", detail: "the next poll", tone: "muted" },
				]}
			/>
		),
	},
	{
		id: "indexeddb",
		content: (
			<Entry
				mark="pass"
				label="IndexedDB"
				detail="2 correct so far"
				value="+16 KB"
				valueTone="viridian"
			/>
		),
	},
	{
		id: "unit-tests",
		content: (
			<Entry
				mark="skip"
				label="Unit Tests"
				detail="dormant until the clear"
				value="+64 KB"
				valueTone="viridian"
				dimmed
			/>
		),
	},
	{
		id: "freemium",
		content: (
			<Entry
				mark="fail"
				dot="saffron"
				label="Freemium"
				detail="bills when this gate clears"
				value="-128 KB"
				valueTone="cinnabar"
				defaultOpen={factsOpen}
				facts={[
					{
						term: "next gate",
						detail: "256 KB at gate 5 — more than that gate pays.",
						tone: "cinnabar",
					},
					{
						term: "catch",
						detail: "Read-only shuts the shop before gate 5.",
						tone: "cinnabar",
					},
				]}
			/>
		),
	},
];

const Pipeline = ({ factsOpen = false }: { factsOpen?: boolean }) => (
	<Foldable
		title="Pipeline"
		subtitle="4 firing · 1 offline · 3 billed"
		items={pipeline(factsOpen)}
	/>
);

const meta: Meta<typeof Pipeline> = {
	component: Pipeline,
	title: "Skin/Entry",
	decorators: [
		(Story) => (
			<div className="w-[22rem]">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Pipeline>;

/** Seven rows on seven lines. ESLint and Freemium open on click. */
export const RunPipeline: Story = { args: { factsOpen: false } };

/** Both explanations out at once — the mock, and what a fresh player sees least. */
export const FactsUnfolded: Story = { args: { factsOpen: true } };
