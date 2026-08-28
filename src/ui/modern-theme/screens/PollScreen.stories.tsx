import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";

import { Token } from "../Code.ui";
import { Audits } from "../Audits.ui";
import { Coverage } from "../Coverage.ui";
import { Delta } from "../Delta.ui";
import { Entry } from "../Entry.ui";
import { Family, type ConfigFamily } from "../Family.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import type { MarkVerdict } from "../Mark.ui";

import { Stake } from "../Stake.ui";
import { Text } from "../Text.ui";
import type { ModernTone } from "../tones";
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

const NONE = (
	<Text size="meta" tone="muted">
		—
	</Text>
);

type PipelineConfig = {
	id: string;
	label: string;
	family: ConfigFamily;
	mark: MarkVerdict;
	multiplier?: number;
	kb?: number;
	costKb?: number;
	dimmed?: boolean;
	offline?: boolean;
	summary: string;
	explainer: string;
	defaultOpen?: boolean;
};

const configs: readonly PipelineConfig[] = [
	{
		id: ".ts",
		label: ".ts",
		family: "category",
		mark: "idle",
		dimmed: true,
		offline: true,
		summary: "Common · offline this gate",
		explainer:
			"TS polls pay 1.25× coverage. An audit has it switched off until the gate clears.",
	},
	{
		id: "Intellisense",
		label: "Intellisense",
		family: "multiplier",
		mark: "pass",
		multiplier: 1.5,
		summary: "Uncommon · firing on 2 answers",
		explainer: "All coverage earns ×1.5.",
	},
	{
		id: "AGENTS.md",
		label: "AGENTS.md",
		family: "multiplier",
		mark: "pass",
		multiplier: 2,
		summary: "Rare · firing on 2 answers",
		explainer: "All coverage earns ×2.",
	},
	{
		id: "ESLint",
		label: "ESLint",
		family: "tool",
		mark: "warn",
		costKb: 16,
		summary: "Common · blocking 1 option on poll 3",
		explainer:
			"Strikes out one wrong answer per gate and charges 16 KB for the hint.",
		defaultOpen: true,
	},
	{
		id: "IndexedDB",
		label: "IndexedDB",
		family: "storage",
		mark: "pass",
		kb: 16,
		summary: "Common · 2 correct so far",
		explainer: "+8 KB storage per correct answer, up to 320 KB a run.",
	},
	{
		id: "Freemium",
		label: "Freemium",
		family: "storage",
		mark: "fail",
		kb: -128,
		summary: "Legendary · bills when this gate clears",
		explainer:
			"Every draft costs half price; each gate clear bills 8·2^gate KB.",
	},
];

const pipeline: FoldItem[] = configs.map((config) => ({
	id: config.id,
	content: (
		<Entry
			label={config.label}
			mark={config.mark}
			notes={<Family family={config.family} />}
			dimmed={config.dimmed}
			{...(config.costKb === undefined
				? {
						value: config.offline ? (
							<Text size="meta" tone="muted">
								offline
							</Text>
						) : config.multiplier !== undefined ? (
							<Delta multiplier={config.multiplier} />
						) : config.kb === undefined ? (
							NONE
						) : (
							<Delta kb={config.kb} />
						),
					}
				: {
						actions: [
							{
								label: "Use",
								on: config.label,
								cost: `${config.costKb} KB`,
								onUse: () => {},
							},
						],
					})}
			summary={config.summary}
			explainer={config.explainer}
			defaultOpen={config.defaultOpen}
		/>
	),
}));

const netKb = configs.reduce((total, config) => total + (config.kb ?? 0), 0);

const SEVERITY = [
	"fail",
	"warn",
	"pass",
	"idle",
] as const satisfies readonly MarkVerdict[];

const STATUS_TONE = {
	fail: "cinnabar",
	warn: "saffron",
	pass: "celadon",
	idle: "muted",
} as const satisfies Record<MarkVerdict, ModernTone>;

const worstMark =
	SEVERITY.find((mark) => configs.some((config) => config.mark === mark)) ??
	"idle";

const rail = (
	<>
		<Coverage held={38.6} projected={23.1} required={60} defaultOpen={false} />
		<Fold
			title="Pipeline"
			value={
				<Text size="meta" tone={STATUS_TONE[worstMark]}>
					{netKb < 0 ? "−" : "+"}
					{Math.abs(netKb)} KB
				</Text>
			}
			items={pipeline}
		/>
		<Audits
			audits={[
				{
					id: "dependency-outage",
					description: ".ts is offline for this gate",
				},
			]}
			defaultOpen
		/>
		<Stake removeOnMiss={1} coveragePerWrong={-0.3} />
	</>
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
	meta: ["scores ×1.1", "4 options"],
	byline: { author: "matthijsgroen", role: "Frontend developer" },
	code,
	rail,
};

const InteractivePoll = ({
	railStartsOpen = true,
	...overrides
}: Partial<PollScreenProps> & { railStartsOpen?: boolean }) => {
	const [picked, setPicked] = useState<string | null>(null);
	const [railOpen, setRailOpen] = useState(railStartsOpen);

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
			railOpen={railOpen}
			onToggleRail={() => setRailOpen((open) => !open)}
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

export const WithoutRail: Story = {
	render: () => <InteractivePoll rail={undefined} />,
};

export const RailFolded: Story = {
	render: () => <InteractivePoll railStartsOpen={false} />,
};
