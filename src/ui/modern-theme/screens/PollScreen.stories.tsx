import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";

import { Token } from "../Code.ui";
import { AuditAlerts } from "../Audits.ui";
import { BuildTrack } from "../BuildTrack.ui";
import {
	PollScreen,
	type PollOption,
	type PollScreenProps,
} from "./PollScreen.ui";

const meta: Meta<typeof PollScreen> = {
	component: PollScreen,
	title: "Modern/Screens/Poll",
};
export default meta;

type Story = StoryObj<typeof PollScreen>;

const track = (open: boolean, onToggle: () => void) => (
	<BuildTrack
		slots={7}
		maxSlots={24}
		open={open}
		onToggle={onToggle}
		configs={[
			{
				id: "ts",
				label: ".ts",
				slots: 1,
				status: { kind: "offline", audit: "Dependency Outage" },
			},
			{
				id: "intellisense",
				label: "Intellisense",
				slots: 4,
				status: { kind: "online" },
				figure: { kind: "multiplier", value: 1.5 },
			},
			{
				id: "eslint",
				label: "ESLint",
				slots: 1,
				status: { kind: "online" },
				action: {
					label: "cross out",
					on: "ESLint",
					cost: "8 KB",
					onUse: () => {},
				},
			},
		]}
	/>
);

const notices = (
	<AuditAlerts
		audits={[
			{
				id: "dependency-outage",
				description: ".ts is offline for this gate",
			},
		]}
	/>
);

const question = (
	<>
		{"Don't ask me why these polls all rhyme — to lift the final two from "}
		<Token tone="theme">arr</Token>
		{
			" in TypeScript time, which line returns them, and leaves the source sublime?"
		}
	</>
);

const code = [
	<>
		{"const arr = ["}
		<Token tone="vermillion">{'"init","lint","test","build","ship"'}</Token>
		{"] as const;"}
	</>,
	<>
		{"const tail = "}
		<Token tone="muted">{"/* ??? */"}</Token>
		{";"}
	</>,
];

const answers = [
	{ id: "slice-negative", label: "arr.slice(-2)", blocked: false },
	{ id: "splice", label: "arr.splice(-2)", blocked: false },
	{ id: "slice-positive", label: "arr.slice(2)", blocked: true },
	{ id: "at", label: "arr.at(-2)", blocked: false },
];

const base: Omit<PollScreenProps, "options"> = {
	theme: "lavender",
	gate: {
		title: "Gate 4 · Lavender",
		audits: ["dependency-outage"],
		storage: { balanceKb: 184 },
		track: { gates: ALL_SWATCHES, cleared: 4 },
		coverage: { held: 38.6, projected: 23.1, required: 60 },
	},
	trail: [
		{ id: "1", label: "1", state: "done", verdict: "correct" },
		{ id: "2", label: "2", state: "done", verdict: "partial" },
		{ id: "3", label: "3", state: "current" },
		{ id: "4", label: "4", state: "todo" },
		{ id: "5", label: "5", state: "todo" },
	],
	trailLabel: "Polls in this gate",
	question,
	category: { label: "typescript" },
	meta: [
		{ label: "scores", figure: "×1.1", tone: "celadon" },
		{ label: "4 options" },
		{ label: "wrong costs", figure: "0.3", tone: "cinnabar" },
		{ label: "Gate retry cost:", figure: "Remove 1 config", tone: "cinnabar" },
	],
	byline: { author: "matthijsgroen", role: "Frontend developer" },
	code,
	notices,
};

const InteractivePoll = ({
	trackStartsOpen = false,
	...overrides
}: Partial<PollScreenProps> & { trackStartsOpen?: boolean }) => {
	const [picked, setPicked] = useState<string | null>(null);
	const [trackOpen, setTrackOpen] = useState(trackStartsOpen);

	const options: PollOption[] = answers.map((answer) => ({
		id: answer.id,
		name: "answer",
		label: answer.label,
		checked: picked === answer.id,
		blocked: answer.blocked,
		note: answer.blocked ? "blocked · ESLint" : undefined,
		onChange: () => setPicked(answer.id),
	}));

	return (
		<PollScreen
			{...base}
			options={options}
			build={track(trackOpen, () => setTrackOpen((open) => !open))}
			onSubmit={() => {}}
			submitLock={picked ? undefined : "Pick an answer"}
			{...overrides}
		/>
	);
};

const gateStory = (gate: number): Story => {
	const { gateName, theme } = GATE_SWATCHES[gate];

	return {
		name: gateName,
		render: () => (
			<InteractivePoll
				theme={theme}
				gate={{
					title: `Gate ${gate} · ${gateName}`,
					audits: ["dependency-outage"],
					storage: { balanceKb: 184 },
					track: { gates: ALL_SWATCHES, cleared: gate },
					coverage: { held: 38.6, projected: 23.1, required: 60 },
				}}
			/>
		),
	};
};

export const Lavender = gateStory(4);

export const Pallet = gateStory(0);
export const Boulder = gateStory(1);
export const Cascade = gateStory(2);
export const Thunder = gateStory(3);
export const Rainbow = gateStory(5);
export const Soul = gateStory(6);
export const Marsh = gateStory(7);
export const Seafoam = gateStory(8);
export const Volcano = gateStory(9);
export const Earth = gateStory(10);
export const Elite = gateStory(11);
export const Champion = gateStory(12);

export const WithoutCode: Story = {
	render: () => (
		<InteractivePoll
			code={undefined}
			question="Which array method returns a copy without mutating the source?"
		/>
	),
};

export const WithoutBuild: Story = {
	render: () => <InteractivePoll build={undefined} notices={undefined} />,
};

export const TrackOpenOnNarrowScreens: Story = {
	render: () => <InteractivePoll trackStartsOpen />,
};
