import type {
	CommunityScreenProps,
	TurnoutBand,
} from "~/modules/run/community/presentation/CommunityScreen.ui";
import type { CategoryLeaderProps } from "~/modules/run/community/presentation/CategoryLeader.ui";
import type { ClimberProps } from "~/modules/run/community/presentation/Climber.ui";
import type { ClimbMapProps } from "~/modules/run/community/presentation/ClimbMap.ui";
import type { ClimberCardProps } from "~/modules/run/community/presentation/ClimberCard.ui";
import type { HallOfFameProps } from "~/modules/run/community/presentation/HallOfFame.ui";
import type { StandingProps } from "~/modules/account/profile/presentation/Standing.ui";
import {
	type LadderClimber,
	type LadderGate,
	REST_COPY,
} from "~/modules/run/community/application/climbLadder.viewmodel";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	bandAtLadder,
	baseGateLadderAt,
} from "~/modules/run/gate/domain/gate.model";
import type { SpotlightPoll } from "~/modules/run/community/presentation/PollSpotlight.ui";
import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";

import { kantoIncidents } from "./kantoIncidents.factory";
import { gateSwatchAt } from "./swatchTrack.factory";

export const COMMUNITY_SHOP_LABEL = "Back to the shop";
export const COMMUNITY_PREP_LABEL = "Prep for Celadon";
export const COMMUNITY_MAP_TITLE = "Where everyone is";
export const COMMUNITY_STREAK_TITLE = "streak";
export const COMMUNITY_CORRECT_TITLE = "correct";

const CLEARED_GATE = 4;

const BORDER = {
	js: "/borders/border-js-saffron.svg",
	ts: "/borders/border-ts-lavender.svg",
	css: "/borders/border-css-cerulean.svg",
	react: "/borders/border-react-celadon.svg",
	git: "/borders/border-git-pewter.svg",
	ruby: "/borders/border-ruby-cinnabar.svg",
	html: "/borders/border-html-vermillion.svg",
	frontend: "/borders/border-frontend-fuchsia.svg",
} as const;

const you: ClimberProps = { name: "Marciano", you: true };
const brock: ClimberProps = { name: "Brock", borderUrl: BORDER.git };
const misty: ClimberProps = { name: "Misty", borderUrl: BORDER.css };
const surge: ClimberProps = { name: "Lt. Surge", borderUrl: BORDER.js };
const erika: ClimberProps = { name: "Erika", borderUrl: BORDER.react };
const koga: ClimberProps = { name: "Koga", borderUrl: BORDER.frontend };
const sabrina: ClimberProps = { name: "Sabrina", borderUrl: BORDER.ts };
const blaine: ClimberProps = { name: "Blaine", borderUrl: BORDER.ruby };
const giovanni: ClimberProps = { name: "Giovanni", borderUrl: BORDER.html };
const oak: ClimberProps = { name: "Oak" };

const YOUR_CHIPS = [
	{ name: "ESLint", slots: 1, version: 2, badges: [] },
	{
		name: "Cache",
		slots: 4,
		badges: [{ label: "locked in", color: "saffron" as const }],
	},
];

const RIVAL_CHIPS = [
	{ name: "Webpack", slots: 3, badges: [] },
	{ name: "Babel", slots: 2, badges: [] },
	{ name: "Jest", slots: 2, badges: [] },
	{ name: "Sentry", slots: 2, badges: [] },
];

const ladderChip = (
	climber: ClimberProps,
	over: Partial<LadderClimber> = {}
): LadderClimber => ({
	id: climber.name.toLowerCase().replace(/\W/g, ""),
	name: climber.name,
	...(climber.borderUrl === undefined ? {} : { borderUrl: climber.borderUrl }),
	you: climber.you === true,
	rival: false,
	rescued: false,
	...over,
});

const standingAt = (
	gate: number,
	held: number,
	over: Partial<StandingProps> = {}
): StandingProps => ({
	gate: {
		name: gateSwatchAt(gate).gateName,
		label: `gate ${gate}`,
		swatch: gateSwatchAt(gate),
		coverage: {
			...baseGateLadderAt(gate),
			held,
			band: bandAtLadder(held, baseGateLadderAt(gate)).id,
		},
	},
	weight: "7 / 8",
	build: YOUR_CHIPS,
	freeSlots: 1,
	stats: [
		{ label: "run storage", value: "512 KB", color: "saffron" },
		{ label: "streak", value: "3" },
		{ label: "best", value: "TypeScript" },
	],
	...over,
});

const cardFor = (
	climber: LadderClimber,
	over: Partial<ClimberCardProps> = {}
): ClimberCardProps => ({
	name: climber.name,
	profileHref: `/profile/${climber.id}`,
	...(climber.borderUrl === undefined ? {} : { borderUrl: climber.borderUrl }),
	you: climber.you,
	rival: climber.rival,
	perfect: climber.mark === "perfect",
	shaky: climber.mark === "shaky",
	rescued: climber.rescued,
	theme: "gate-pallet",
	standing: standingAt(CLEARED_GATE, 40),
	...over,
});

const withCard = (
	climber: LadderClimber,
	over: Partial<ClimberCardProps> = {}
): LadderClimber => ({ ...climber, card: cardFor(climber, over) });

const MISTY_STANDING = standingAt(3, 70, {
	weight: "9 / 12",
	build: RIVAL_CHIPS,
	freeSlots: 3,
	stats: [
		{ label: "run storage", value: "896 KB", color: "saffron" },
		{ label: "streak", value: "6" },
		{ label: "best", value: "JavaScript" },
	],
});

const LADDER_STANDING: Readonly<Record<number, LadderClimber[]>> = {
	1: [
		withCard(ladderChip(oak), {
			standing: standingAt(1, 12, { build: [], freeSlots: 4 }),
		}),
	],
	2: [
		withCard(ladderChip(brock, { mark: "shaky" }), {
			standing: standingAt(2, 31),
		}),
	],
	3: [
		withCard(ladderChip(misty, { rival: true, mark: "perfect" }), {
			titles: ["Heavy Pipeline", "Legacy Tester"],
			theme: "gate-cerulean",
			standing: MISTY_STANDING,
		}),
	],
	4: [
		withCard(ladderChip(you, { mark: "perfect" }), {
			standing: standingAt(4, 64),
		}),
		withCard(ladderChip(surge, { rescued: true })),
		withCard(ladderChip(erika)),
		withCard(ladderChip(koga), {
			standing: standingAt(4, 40, { build: [], freeSlots: 8 }),
		}),
		withCard(ladderChip(sabrina)),
	],
	5: [
		withCard(ladderChip(giovanni, { rival: true }), {
			standing: standingAt(5, 55),
		}),
	],
};

const LADDER_FALLEN: Readonly<Record<number, LadderClimber[]>> = {
	3: [
		withCard(ladderChip(blaine, { mark: "shaky" }), {
			standing: standingAt(3, 18),
		}),
	],
};

const CURRENT_GATE = 4;
const BEST_GATE = 6;
const CHARTED_TO = 6;

const ladderGates = (): LadderGate[] =>
	ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		name: swatch.gateName,
		theme: swatch.theme,
		finish: swatch.finish,
		current: swatch.gate === CURRENT_GATE,
		uncharted: swatch.gate > CHARTED_TO,
		best: swatch.gate === BEST_GATE,
		climbers: LADDER_STANDING[swatch.gate] ?? [],
		fallen: (LADDER_FALLEN[swatch.gate] ?? []).map((climber) => ({
			...climber,
			runKey: `run-${climber.id}`,
		})),
	}));

export const kantoClimbMap = (): ClimbMapProps => ({ gates: ladderGates() });

const resting = (climber: ClimberProps, days: number): LadderClimber =>
	ladderChip(climber, {
		resting: true,
		tooltip: REST_COPY.lastPlayed(climber.name, days),
	});

const CROWDED_START: readonly LadderClimber[] = [
	withCard(ladderChip(oak), { standing: standingAt(0, 3) }),
	withCard(ladderChip(blaine), { standing: standingAt(0, 2) }),
	withCard(ladderChip(giovanni, { rival: true })),
	withCard(ladderChip(sabrina)),
	withCard(resting(koga, 4)),
	withCard(resting(erika, 9)),
	withCard(resting(surge, 23)),
];

export const kantoCrowdedClimbMap = (): ClimbMapProps => ({
	gates: ladderGates().map((gate) =>
		gate.gate === 0 ? { ...gate, climbers: CROWDED_START } : gate
	),
});

export const kantoClimberCard = (
	over: Partial<ClimberCardProps> = {}
): ClimberCardProps =>
	cardFor(ladderChip(misty, { rival: true, mark: "perfect" }), {
		titles: ["Heavy Pipeline", "Legacy Tester"],
		theme: "gate-cerulean",
		standing: MISTY_STANDING,
		...over,
	});

export const kantoStanding = (
	over: Partial<StandingProps> = {}
): StandingProps => ({ ...MISTY_STANDING, ...over });

const bands = (): TurnoutBand[] => [
	{
		label: "Answered today",
		count: "1,214",
		color: "cerulean",
		shown: 10,
		climbers: [
			you,
			brock,
			misty,
			surge,
			erika,
			koga,
			sabrina,
			blaine,
			giovanni,
			oak,
			{ name: "Mr. Fuji" },
			{ name: "Bill" },
		],
		overflow: 1202,
	},
	{
		label: "PERFECT",
		caption: "finished at 100%",
		count: "212",
		color: "cerulean",
		climbers: [you, brock, misty],
		overflow: 209,
	},
	{
		label: "HEALTHY",
		caption: "comfortably cleared",
		count: "604",
		color: "viridian",
		climbers: [surge, erika, koga],
		overflow: 601,
	},
	{
		label: "OK",
		caption: "narrowly cleared",
		count: "225",
		color: "saffron",
		climbers: [sabrina],
		overflow: 224,
	},
	{
		label: "SHAKY",
		caption: "gate held them",
		count: "106",
		color: "vermillion",
		climbers: [blaine, giovanni],
		overflow: 104,
	},
	{
		label: "DANGER",
		caption: "run ended",
		count: "57",
		color: "cinnabar",
		climbers: [oak, { name: "Mr. Fuji" }],
		overflow: 55,
	},
];

const records = (): TurnoutBand[] => [
	{ label: "Biggest build", count: "14 slots", climbers: [giovanni] },
	{ label: "Lightest build", count: "2 slots", climbers: [misty] },
	{
		label: "Comeback",
		caption: "held at this gate before, cleared it today",
		count: "3",
		climbers: [brock, erika, koga],
	},
	{
		label: "Most audits",
		caption: "across the whole run",
		count: "6",
		climbers: [blaine],
	},
	{
		label: "Most installed",
		config: { name: ".ts", slots: 1, badges: [] },
		count: "812 players",
		climbers: [you, surge, sabrina, erika, koga, misty],
		overflow: 806,
	},
	{ label: "Most expensive build", count: "1.4 MB", climbers: [giovanni] },
	{
		label: "KB generated today",
		caption: "top earner",
		count: "2.1 MB",
		climbers: [surge],
	},
	{
		label: "KB spent today",
		caption: "biggest spender",
		count: "1.6 MB",
		climbers: [giovanni],
	},
];

const IN_A_ROW = (best: number) => `${best} in a row`;
const CORRECT = (best: number) => `${best} correct`;

const held = (
	figure: (best: number) => string,
	category: string,
	handle: string,
	best: number,
	borderUrl?: string
): CategoryLeaderProps => ({
	category,
	leader: {
		userId: handle,
		handle: `@${handle}`,
		figure: figure(best),
		...(borderUrl === undefined ? {} : { borderUrl }),
	},
});

const open = (claim: string, category: string): CategoryLeaderProps => ({
	category,
	claim,
});

const STREAK_CLAIM = "3 in a row claims it";
const CORRECT_CLAIM = "4 correct claims it";

const streakSeats = (): CategoryLeaderProps[] => [
	held(IN_A_ROW, "JavaScript", "koga", 21, BORDER.frontend),
	held(IN_A_ROW, "CSS", "erika", 18, BORDER.react),
	held(IN_A_ROW, "TypeScript", "sabrina", 16, BORDER.ts),
	held(IN_A_ROW, "Git", "giovanni", 13, BORDER.html),
	held(IN_A_ROW, "React", "blaine", 11, BORDER.ruby),
	held(IN_A_ROW, "HTML", "misty", 9, BORDER.css),
	held(IN_A_ROW, "Java", "ltsurge", 7, BORDER.js),
	held(IN_A_ROW, "Python", "brock", 6, BORDER.git),
	{
		category: "Vue",
		leader: {
			userId: "marciano",
			handle: "@marciano",
			figure: IN_A_ROW(5),
			you: true,
		},
	},
	open(STREAK_CLAIM, "Ruby"),
	open(STREAK_CLAIM, "General Frontend"),
	open(STREAK_CLAIM, "General Backend"),
];

const correctSeats = (): CategoryLeaderProps[] => [
	held(CORRECT, "TypeScript", "brock", 58, BORDER.git),
	held(CORRECT, "JavaScript", "koga", 47, BORDER.frontend),
	held(CORRECT, "React", "erika", 41, BORDER.react),
	held(CORRECT, "Git", "giovanni", 33, BORDER.html),
	held(CORRECT, "CSS", "misty", 29, BORDER.css),
	held(CORRECT, "Ruby", "blaine", 22, BORDER.ruby),
	held(CORRECT, "HTML", "ltsurge", 18, BORDER.js),
	held(CORRECT, "Python", "sabrina", 14, BORDER.ts),
	{
		category: "Java",
		leader: {
			userId: "marciano",
			handle: "@marciano",
			figure: CORRECT(9),
			you: true,
		},
	},
	open(CORRECT_CLAIM, "Vue"),
	open(CORRECT_CLAIM, "General Frontend"),
	open(CORRECT_CLAIM, "General Backend"),
];

const spotlights = (): SpotlightPoll[] => [
	{
		kind: "hardest",
		question:
			"With dangerouslySetInnerHTML a risk you take, what risk is at stake?",
		rightShare: 29,
		gotIt: [misty],
	},
	{
		kind: "easiest",
		question: "Which method returns the last element of an array?",
		rightShare: 86,
		gotIt: [you, misty],
	},
];

export const kantoCommunity = (): CommunityScreenProps => ({
	header: {
		swatch: gateSwatchAt(CLEARED_GATE),
		title: "Seed #482 · five polls for Wednesday",
		countdown: "6h 12m left",
		countdownColor: "viridian",
		countdownHint: "polls close in",
		stats: [
			{ icon: "community", label: "1,204", hint: "climbers reviewing" },
			{ icon: "gate", label: "37", hint: "gates cleared today" },
			{ icon: "closed", label: "2", hint: "runs closed" },
			{
				icon: "clock",
				label: "3 resting",
				hint: "no answer for 3 days or more",
			},
		],
		shop: { label: COMMUNITY_SHOP_LABEL, onPress: () => {} },
		prep: { label: COMMUNITY_PREP_LABEL, onPress: () => {} },
	},
	turnout: {
		title: "Who cleared what",
		bands: bands(),
	},
	records: {
		title: "Today’s records",
		rows: records(),
	},
	map: { title: COMMUNITY_MAP_TITLE, track: kantoClimbMap() },
	incidents: kantoIncidents(),
	leaders: [
		{
			title: COMMUNITY_STREAK_TITLE,
			summary: "All-time longest run streak",
			seats: streakSeats(),
		},
		{
			title: COMMUNITY_CORRECT_TITLE,
			summary: "All-time longest run of correct answers",
			seats: correctSeats(),
		},
	],
	polls: {
		title: "Today’s polls",
		spotlights: spotlights(),
		review: { label: "Review all 5 answers", onReview: () => {} },
	},
});

export const kantoCommunityBeforePolls = (): CommunityScreenProps => {
	const base = kantoCommunity();
	return {
		...base,
		polls: {
			title: base.polls.title,
			spotlights: [],
			empty: NOTHING_TO_COMPARE_YET,
		},
	};
};

export const kantoCommunityFirstClimb = (): CommunityScreenProps => {
	const base = kantoCommunity();
	return {
		...base,
		leaders: base.leaders.map((board) => ({
			...board,
			seats: board.seats.map(({ category }) =>
				open(
					board.title === COMMUNITY_STREAK_TITLE ? STREAK_CLAIM : CORRECT_CLAIM,
					category
				)
			),
		})),
	};
};

export const kantoHallOfFame = (
	over: Partial<HallOfFameProps> = {}
): HallOfFameProps => ({
	title: "Hall of Fame",
	historyLabel: "Every champion",
	empty: {
		title: "Champion · still open",
		caption: "First to clear the Champion gate gets this spot.",
	},
	champion: {
		card: kantoClimberCard({
			name: "Red",
			profileHref: "/profile/red",
			titles: ["Champion"],
			theme: "gate-champion",
			borderUrl: "/borders/border-champion-prismatic.svg",
			rival: false,
			perfect: false,
		}),
		since: "Champion since 13 May 2026, 14:05",
	},
	history: [
		{
			key: "3",
			face: {
				name: "Red",
				borderUrl: "/borders/border-champion-prismatic.svg",
			},
			wonAt: "13 May 2026, 14:05",
		},
		{ key: "2", face: { name: "Blue" }, wonAt: "25 Dec 2025, 09:30" },
		{ key: "1", face: { name: "Red" }, wonAt: "24 Dec 2025, 21:00" },
	],
	...over,
});
