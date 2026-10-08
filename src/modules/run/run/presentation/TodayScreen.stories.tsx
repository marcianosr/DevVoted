import type { Meta, StoryObj } from "@storybook/react";

import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const noop = () => {};

const READOUT = { runNumber: 14, gate: 3, gates: 12 };

const faces = (names: readonly string[]) => names.map((name) => ({ name }));

const ROOM = [
	"Giovanni",
	"Marciano",
	"Sam",
	"Lotte",
	"Pieter",
	"Aisha",
	"Kenji",
	"Noor",
	"Femke",
	"Ravi",
	"Bram",
	"Elif",
	"Tom",
	"Yara",
] as const;

const COMMUNITY = {
	count: 5,
	detail: "today",
	faces: faces(ROOM.slice(0, 5)),
	overflow: 0,
	href: "/run/community",
} satisfies TodayScreenProps["community"];

const RUN_SO_FAR = {
	earned: "+64 KB",
	rows: [
		{
			gate: 0,
			swatch: gateSwatchAt(0),
			band: { id: "perfect", label: "PERFECT" },
			kb: "+32 KB",
		},
		{
			gate: 1,
			swatch: gateSwatchAt(1),
			band: { id: "healthy", label: "HEALTHY" },
			kb: "+19 KB",
		},
		{
			gate: 2,
			swatch: gateSwatchAt(2),
			band: { id: "ok", label: "OK" },
			kb: "+13 KB",
		},
	],
	next: {
		gate: 3,
		swatch: gateSwatchAt(3),
		note: "next",
		quote: {
			band: { id: "ok", label: "OK" },
			kb: "+40 KB",
			started: true,
			share: "40%",
		},
	},
} satisfies TodayScreenProps["runSoFar"];

const BUILD = {
	rows: [
		{
			id: "code-coverage",
			name: "Code Coverage",
			description: "Every correct answer adds coverage.",
			slots: 2,
			version: 2,
		},
		{
			id: "ts",
			name: ".ts",
			description: "TypeScript polls earn extra.",
			slots: 1,
			version: 1,
		},
		{
			id: "build-artifacts",
			name: "Build Artifacts",
			description: "A cleared gate banks a little more.",
			slots: 1,
			version: 1,
		},
	],
	weight: "4 / 6",
	held: 6,
	free: 2,
	shopHref: "/run/shop",
	openInfo: new Set<string>(),
	onToggleInfo: noop,
} satisfies TodayScreenProps["build"];

const SHUT_SHOP = {
	label: "Shop",
	hint: "Shop · the shop opens when you clear a gate",
	open: false,
	onPress: noop,
} satisfies TodayScreenProps["shop"];

const base: TodayScreenProps = {
	swatch: gateSwatchAt(3),
	headline: {
		readout: READOUT,
		title: "Vermilion",
		clock: null,
		subtext: "5 polls ready · prep first",
		mark: { kind: "polls", count: 5 },
	},
	press: {
		kind: "resume",
		label: "Continue to Vermilion",
		mark: "polls",
		pollsLeft: 5,
		onPress: noop,
	},
	shop: {
		label: "Shop",
		open: true,
		detail: "open until you start",
		onPress: noop,
	},
	incidents: [],
	community: COMMUNITY,
	runSoFar: RUN_SO_FAR,
	build: BUILD,
};

const INCIDENT = {
	id: "not-found",
	code: 404,
	name: "Not Found",
	cue: "waits at Vermilion · it replaces one audit",
	sender: "@erika",
} as const;

const meta: Meta<typeof TodayScreen> = {
	component: TodayScreen,
	title: "Kanto/Screens/TodayScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof TodayScreen>;

export const Ready: Story = {
	render: () => <TodayScreen {...base} />,
};

export const Waiting: Story = {
	render: () => (
		<TodayScreen
			{...base}
			swatch={gateSwatchAt(2)}
			headline={{
				readout: { runNumber: 2, gate: 2, gates: 12 },
				title: "Cerulean opens in",
				clock: { main: "12h 09m", seconds: "59s" },
				subtext: "Today’s polls are done. Back tomorrow!",
				mark: { kind: "lock" },
			}}
			press={{
				kind: "shop",
				label: "To shop",
				note: "spend 35 KB",
				mark: "shop",
				onPress: noop,
			}}
			shop={null}
			runSoFar={{
				earned: "+83 KB",
				rows: [
					{
						gate: 0,
						swatch: gateSwatchAt(0),
						band: { id: "healthy", label: "HEALTHY" },
						kb: "+24 KB",
					},
					{
						gate: 1,
						swatch: gateSwatchAt(1),
						band: { id: "perfect", label: "PERFECT" },
						kb: "+59 KB",
					},
				],
				next: {
					gate: 2,
					swatch: gateSwatchAt(2),
					note: "opens tomorrow",
					quote: null,
				},
			}}
			build={{
				...BUILD,
				rows: [
					BUILD.rows[0],
					{
						id: "js",
						name: ".js",
						description: "JavaScript polls earn extra.",
						slots: 1,
						version: 1,
					},
					{
						id: "css",
						name: ".css",
						description: "CSS polls earn extra.",
						slots: 1,
						version: 1,
					},
				],
				weight: "4 / 4",
				held: 4,
				free: 0,
			}}
		/>
	),
};

export const WithIncident: Story = {
	render: () => <TodayScreen {...base} incidents={[INCIDENT]} />,
};

export const MidGate: Story = {
	render: () => (
		<TodayScreen
			{...base}
			headline={{
				...base.headline,
				subtext: "Poll 3 out of 5",
				mark: { kind: "polls", count: 3 },
			}}
			press={{ ...base.press, pollsLeft: 3 }}
			shop={SHUT_SHOP}
			build={{ ...BUILD, shopHref: undefined }}
		/>
	),
};

export const FreshPlayer: Story = {
	render: () => (
		<TodayScreen
			{...base}
			swatch={gateSwatchAt(0)}
			headline={{
				readout: null,
				title: "Pallet",
				clock: null,
				subtext: "5 polls ready · New polls in 7h 23m",
				mark: { kind: "polls", count: 5 },
			}}
			press={{
				kind: "start",
				label: "Start today’s climb",
				mark: "polls",
				pollsLeft: 5,
				onPress: noop,
			}}
			shop={SHUT_SHOP}
			runSoFar={null}
			build={null}
			community={{
				...COMMUNITY,
				count: 1,
				faces: faces(ROOM.slice(1, 2)),
			}}
		/>
	),
};

export const RunOver: Story = {
	render: () => (
		<TodayScreen
			{...base}
			swatch={gateSwatchAt(0)}
			headline={{
				readout: null,
				title: "Pallet",
				clock: null,
				subtext: "5 polls ready · New polls in 7h 23m",
				mark: { kind: "polls", count: 5 },
			}}
			press={{
				kind: "start",
				label: "Start today’s climb",
				mark: "polls",
				pollsLeft: 5,
				onPress: noop,
			}}
			shop={SHUT_SHOP}
			runSoFar={{ ...RUN_SO_FAR, next: null }}
			build={null}
		/>
	),
};

export const ManyPlayers: Story = {
	render: () => (
		<TodayScreen
			{...base}
			community={{
				...COMMUNITY,
				count: ROOM.length,
				faces: faces(ROOM.slice(0, 10)),
				overflow: ROOM.length - 10,
			}}
		/>
	),
};
