import type { Meta, StoryObj } from "@storybook/react";

import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	TodayScreen,
	type TodayScreenProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const noop = () => {};

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
		band: { id: "ok", label: "OK" },
		started: true,
		share: "40%",
		kb: "+40 KB",
	},
} satisfies TodayScreenProps["runSoFar"];

const BUILD = {
	rows: [
		{ id: "code-coverage", name: "Code Coverage", slots: 2, version: 2 },
		{ id: "ts", name: ".ts", slots: 1, version: 1 },
		{ id: "build-artifacts", name: "Build Artifacts", slots: 1, version: 1 },
	],
	weight: "4 / 6",
	free: 2,
	shopHref: "/run/shop",
} satisfies TodayScreenProps["build"];

const base: TodayScreenProps = {
	swatch: gateSwatchAt(3),
	strip: {
		swatches: swatchTrackFor([0, 1, 2], 3),
		runNumber: 14,
		gate: 3,
		gates: 12,
		storage: 106,
	},
	press: {
		label: "Continue to Thunder",
		note: "5 polls ready · prep first",
		pollsLeft: 5,
		onPress: noop,
	},
	shop: {
		label: "Shop",
		open: true,
		detail: "open until you start",
		highlighted: false,
		onPress: noop,
	},
	incidents: [],
	runSoFar: RUN_SO_FAR,
	build: BUILD,
	community: {
		count: 38,
		detail: "players answered today",
		ahead: 4,
		aheadDetail: "at Thunder or ahead",
		href: "/run/community",
	},
};

const INCIDENT = {
	id: "not-found",
	code: 404,
	name: "Not Found",
	cue: "waits at Thunder · it replaces one audit",
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
			press={{
				label: "Thunder opens in 11h 16m",
				note: "today’s polls are done · come back tomorrow",
				pollsLeft: 5,
			}}
			shop={{ ...base.shop, detail: "spend 106 KB", highlighted: true }}
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
			press={{
				label: "Continue to Thunder",
				note: "Poll 3 out of 5",
				pollsLeft: 3,
				onPress: noop,
			}}
			shop={{
				label: "Shop",
				hint: "Shop · the shop opens when you clear a gate",
				open: false,
				highlighted: false,
				onPress: noop,
			}}
			build={{ ...BUILD, shopHref: undefined }}
		/>
	),
};

export const FreshPlayer: Story = {
	render: () => (
		<TodayScreen
			{...base}
			swatch={gateSwatchAt(0)}
			strip={null}
			press={{
				label: "Start today’s climb",
				note: "New polls in 7h 23m",
				pollsLeft: 5,
				onPress: noop,
			}}
			shop={{
				label: "Shop",
				hint: "Shop · the shop opens when you clear a gate",
				open: false,
				highlighted: false,
				onPress: noop,
			}}
			runSoFar={null}
			build={null}
			community={{
				count: 1,
				detail: "player answered today",
				ahead: null,
				aheadDetail: null,
				href: "/run/community",
			}}
		/>
	),
};

export const RunOver: Story = {
	render: () => (
		<TodayScreen
			{...base}
			press={{
				label: "Start today’s climb",
				note: "New polls in 7h 23m",
				pollsLeft: 5,
				onPress: noop,
			}}
			shop={{
				label: "Shop",
				hint: "Shop · the shop opens when you clear a gate",
				open: false,
				highlighted: false,
				onPress: noop,
			}}
			runSoFar={{ ...RUN_SO_FAR, next: null }}
			build={null}
		/>
	),
};
