import { Fragment, useState, type ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "../Avatar.ui";
import { Coverage } from "../Coverage.ui";
import { Entry } from "../Entry.ui";
import { Foldable } from "../Foldable.ui";
import { Stake } from "../Stake.ui";
import type { FoldableItem } from "../Foldable.ui";
import type { GateHeaderProps } from "../GateHeader.ui";
import type { SwatchTrackItem } from "../SwatchTrack.ui";
import { Token } from "../Code.ui";
import { Subtitle } from "../Subtitle.ui";
import type { Definition } from "../Definitions.ui";
import type { TrailItem } from "../Trail.ui";
import { PollScreen } from "./PollScreen.ui";

// Game-design reason: this is the screen a player spends the run in. Seeing the
// trail, the poll's provenance, the question and the options at once is the only
// way to judge whether answering feels like reading a diff or filling a form.
const trail: readonly TrailItem[] = [
	{
		id: "poll-1",
		label: "poll 1",
		state: "answered",
		verdict: "pass",
	},
	{
		id: "poll-2",
		label: "poll 2",
		state: "answered",
		verdict: "pass",
	},
	{ id: "poll-3", label: "poll 3", state: "current" },
	{ id: "poll-4", label: "poll 4", state: "disabled" },
	{ id: "poll-5", label: "poll 5", state: "disabled" },
];

const record: readonly Definition[] = [
	{
		term: "Poll",
		detail: (
			<>
				lift-the-final-two <Subtitle>#0412</Subtitle>
			</>
		),
	},
	{
		term: "Written by",
		detail: (
			<>
				<Avatar name="Matthijs" /> @matthijsgroen{" "}
				<Subtitle>· contributor · 14 published</Subtitle>
			</>
		),
	},
	{ term: "Category", detail: "typescript" },
	{ term: "Answer type", detail: "single" },
	{
		term: "Difficulty",
		detail: (
			<>
				×1.1 <Subtitle>4 options</Subtitle>
			</>
		),
	},
	// {
	// 	term: "Request URL",
	// 	detail: "devvoted://seed/2026-08-20/poll-3",
	// 	tone: "muted",
	// },
];

const question: readonly ReactNode[] = [
	"Don't ask me why these polls all rhyme —",
	<Fragment key="lift">
		to lift the final two from <Token tone="theme">arr</Token> in TypeScript
		time,
	</Fragment>,
	"which line returns them, and leaves the source sublime?",
];

const STRINGS = ["init", "lint", "test", "build", "ship"];

const code: readonly ReactNode[] = [
	<Token key="comment" tone="muted">
		{"// arr: readonly string[]"}
	</Token>,
	<Fragment key="arr">
		<Token tone="cerulean">const</Token> arr = [
		{STRINGS.map((value, index) => (
			<Fragment key={value}>
				<Token tone="viridian">{`"${value}"`}</Token>
				{index < STRINGS.length - 1 ? ", " : ""}
			</Fragment>
		))}
		] <Token tone="saffron">as const</Token>;
	</Fragment>,
	<Fragment key="tail">
		<Token tone="cerulean">const</Token> tail ={" "}
		<Token tone="muted">{"/* ??? */"}</Token>;{"  "}
		<Token tone="muted">{'// ["build", "ship"]'}</Token>
	</Fragment>,
];

const LADDER = [
	{ gate: 1, name: "Pallet Swatch", theme: "pallet", coverage: 10 },
	{ gate: 2, name: "Cascade Swatch", theme: "cascade", coverage: 25 },
	{ gate: 3, name: "Boulder Swatch", theme: "boulder", coverage: 35 },
	{ gate: 4, name: "Lavender Swatch", theme: "lavender", coverage: 50 },
	{ gate: 5, name: "Thunder Swatch", theme: "thunder", coverage: 55 },
	{ gate: 6, name: "Rainbow Swatch", theme: "rainbow", coverage: 60 },
	{ gate: 7, name: "Volcano Swatch", theme: "volcano", coverage: 75 },
	{ gate: 8, name: "Soul Swatch", theme: "soul", coverage: 80 },
	{ gate: 9, name: "Marsh Swatch", theme: "marsh", coverage: 85 },
	{ gate: 10, name: "Earth Swatch", theme: "earth", coverage: 90 },
	{ gate: 11, name: "Seafoam Swatch", theme: "seafoam", coverage: 92 },
	{ gate: 12, name: "Elite Swatch", theme: "elite", coverage: 95 },
	{ gate: 13, name: "Champion Swatch", theme: "champion", coverage: 98 },
];

const ladder: readonly SwatchTrackItem[] = LADDER.map((rung) => ({
	id: rung.theme,
	theme: rung.theme,
	gate: `gate ${rung.gate}`,
	name: rung.name,
	state: rung.gate < 4 ? "earned" : rung.gate === 4 ? "current" : "locked",
	earn:
		rung.gate < 4
			? `Earned by clearing gate ${rung.gate}`
			: `Clear gate ${rung.gate} to earn it`,
	requirement: `Needs ${rung.coverage}% coverage in its window`,
}));

const gate: GateHeaderProps = {
	title: "Gate 4 · Lavender",
	detail: "60% required · 1 audit",
	streak: { multiplier: 3, lit: 3, total: 4 },
	gates: ladder,
	count: "4 of 13",
};

const pipeline: readonly FoldableItem[] = [
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
		id: "freemium",
		content: (
			<Entry
				mark="fail"
				dot="saffron"
				label="Freemium"
				detail="bills when this gate clears"
				value="-128 KB"
				valueTone="cinnabar"
				facts={[
					{
						term: "next gate",
						detail: "256 KB at gate 5 — more than that gate pays.",
						tone: "cinnabar",
					},
				]}
			/>
		),
	},
];

const rail = (
	<>
		<Foldable title="Pipeline" items={pipeline} bordered={false} />
		<Foldable title="Coverage" bordered={false}>
			<Coverage now={38.6} projected={23.1} required={60} />
		</Foldable>
		<Foldable
			title="Stake"
			tone="cinnabar"
			bordered={false}
			defaultOpen={false}
		>
			<Stake
				configs={["kept", "kept", "kept", "kept", "kept", "peeled", "peeled"]}
				summary="2 of 7 configs go, your pick. Fatal at 2 left."
				consequence="No payout, no interest. The gate runs again on tomorrow's five, and the audit rolls fresh."
			/>
		</Foldable>
	</>
);

const OPTIONS = [
	{ id: "slice-neg", label: "arr.slice(-2)" },
	{ id: "splice-neg", label: "arr.splice(-2)" },
	{
		id: "slice-pos",
		label: "arr.slice(2)",
		blocked: "blocked by ESLint · 16 KB",
	},
	{ id: "at-neg", label: "arr.at(-2)" },
];

const Screen = ({ picked: initial }: { picked?: string }) => {
	const [picked, setPicked] = useState(initial);

	return (
		<PollScreen
			gate={gate}
			trail={trail}
			trailLabel="Gate 4 progress"
			record={record}
			question={question}
			code={code}
			rail={rail}
			options={OPTIONS.map((option) => ({
				id: option.id,
				name: "answer",
				label: option.label,
				checked: picked === option.id,
				disabled: Boolean(option.blocked),
				note: option.blocked,
				onChange: () => setPicked(option.id),
			}))}
		/>
	);
};

const meta: Meta<typeof Screen> = {
	component: Screen,
	title: "Skin/Screens/Poll",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="min-h-screen bg-zinc-950 p-8">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Screen>;

export const Unanswered: Story = {};

export const Picked: Story = { args: { picked: "splice-neg" } };
