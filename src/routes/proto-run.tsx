import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
	addStorage,
	createRun,
	type LastClose,
	withBuild,
} from "~/modules/run/run/domain/run.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	type Attacker,
	eligibleRivals,
	offersFor,
	queuedByRun,
	type RivalCandidate,
} from "~/modules/run/incident/domain/incident.model";
import {
	attackOfferViewFor,
	attackPanelFor,
	type IncidentFeedRowView,
	incidentsPanelFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import {
	runReducer,
	RunAction,
} from "~/modules/run/run/domain/runAction.model";
import {
	type AnsweredPoll,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	STARTER_POOL,
	startingHand,
} from "~/modules/run/config/domain/hand.model";
import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import {
	occupiedSlots,
	spaceForBuild,
} from "~/modules/run/build/domain/build.model";
import { usePollClock } from "~/modules/run/run/presentation/usePollClock.hook";
import { StartView } from "~/modules/run/build/presentation/StartView.component";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { GateOutcomeView } from "~/modules/run/gate/presentation/GateOutcomeView.component";
import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { ladderFor } from "~/modules/run/community/application/climbLadder.viewmodel";
import type { ClimbTodayView } from "~/modules/run/community/application/community.service";
import {
	REGISTRY_CONTROL_IDS,
	REGISTRY_CONTROL_LIST,
	type RegistryControlId,
} from "~/modules/run/shop/domain/registryControl.model";
import { controldex } from "~/modules/collection/dex/domain/controldex.model";
import { dexControlsFor } from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { DexControls } from "~/ui/kanto-theme/DexControls.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import {
	BASE_SLOTS,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	gateLabelOf,
	gateSwatchAt,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	CommunityScreen,
	type CommunityScreenProps,
} from "~/ui/kanto-theme/CommunityScreen.ui";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { PollResultProps } from "~/ui/kanto-theme/PollResult.ui";
import {
	CATEGORY_CODES,
	type CategoryCode,
	getCategoryMetadata,
} from "~/shared/lib/categories";
import { kbLabel } from "~/shared/lib/storage";

export const Route = createFileRoute("/proto-run")({
	component: RouteComponent,
	beforeLoad: () => {
		if (import.meta.env.PROD) throw redirect({ to: "/" });
	},
});

const single = (
	id: string,
	category: CategoryCode,
	question: string,
	right: string,
	wrongs: string[]
): RunPoll => ({
	id,
	category,
	question,
	answerType: "single",
	author: {
		handle: "@matthijsgroen",
		avatarUrl: "https://github.com/matthijsgroen.png",
		borderUrl: "/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png",
		title: "Poll editor",
	},
	options: [
		{ id: `${id}-r`, label: right, correct: true },
		...wrongs.map((w, i) => ({ id: `${id}-${i}`, label: w, correct: false })),
	],
});

const BASE_POLLS: RunPoll[] = [
	single(
		"js1",
		"js",
		"Which method returns the last element of an array?",
		"at(-1)",
		["pop()", "last()"]
	),
	single(
		"ts1",
		"ts",
		"Which type means 'any value except null/undefined'?",
		"NonNullable<T>",
		["Partial<T>", "Readonly<T>"]
	),
	single(
		"css1",
		"css",
		"Which centers a flex item on both axes?",
		"place-items: center",
		["align: middle", "float: center"]
	),
	single(
		"react1",
		"react",
		"What key should list items get?",
		"A stable unique id",
		["The array index", "Math.random()"]
	),
	single(
		"html1",
		"html",
		"Which tag prevents a line break?",
		"<nobr> / white-space:nowrap",
		["<br>", "<hr>"]
	),
	single(
		"git1",
		"git",
		"Which undoes a commit but keeps changes staged?",
		"git reset --soft",
		["git revert", "git checkout"]
	),
	{
		id: "ts-multi",
		category: "ts",
		question: "Which of these are TypeScript utility types? (pick all)",
		answerType: "multiple",
		options: [
			{ id: "m-a", label: "Partial", correct: true },
			{ id: "m-b", label: "Pick", correct: true },
			{ id: "m-c", label: "Banjo", correct: false },
		],
	},
	single("js2", "js", "typeof null === ?", '"object"', [
		'"null"',
		'"undefined"',
	]),
];

type RigOutcome = "right" | "wrong";

const rigOptionIds = (
	poll: RunPoll,
	outcome: RigOutcome
): readonly string[] => {
	if (outcome === "right") {
		return poll.options
			.filter((option) => option.correct)
			.map((option) => option.id);
	}
	const wrong = poll.options.find((option) => !option.correct);
	return wrong ? [wrong.id] : [];
};

const POOL_SIZE = VICTORY_GATE * SLICE_WINDOW + SLICE_WINDOW;
const POOLS: RunPoll[] = Array.from({ length: POOL_SIZE }, (_, i) => {
	const base = BASE_POLLS[i % BASE_POLLS.length];
	return { ...base, id: `${base.id}-${i}` };
});

const PROTO_START_KB = 256;
const PROTO_GRANT_KB = 256;

const PROTO_RUN_ID = 0;
const PROTO_USER_ID = "you";
const PROTO_YOU = "You";

const strongCloseAt = (gate: number): LastClose => ({
	gate,
	band: "healthy",
	cleared: true,
});

const RIVAL_BUILDS = {
	misty: {
		configs: [
			{ id: "ts", label: ".ts", slots: 1, level: 3 },
			{ id: "cache", label: "Cache", slots: 4 },
		],
		vendorLockedConfigId: "cache",
	},
	brock: {
		configs: [
			{ id: "eslint", label: "ESLint", slots: 1, level: 2 },
			{ id: "telemetry", label: "Telemetry", slots: 2 },
		],
	},
	erika: { configs: [{ id: "prefetch", label: "Prefetch", slots: 4 }] },
	bare: { configs: [] },
};

const simulatedRivals = (gatesCleared: number): readonly RivalCandidate[] => {
	const ahead = (by: number) => Math.min(gatesCleared + by, VICTORY_GATE - 1);
	return [
		{
			runId: 101,
			userId: "misty",
			name: "Misty",
			gatesCleared: ahead(0),
			lastClose: strongCloseAt(ahead(0) - 1),
			build: RIVAL_BUILDS.misty,
		},
		{
			runId: 102,
			userId: "brock",
			name: "Brock",
			gatesCleared: ahead(1),
			lastClose: strongCloseAt(ahead(1) - 1),
			build: RIVAL_BUILDS.brock,
		},
		{
			runId: 103,
			userId: "erika",
			name: "Erika",
			gatesCleared: ahead(2),
			lastClose: strongCloseAt(ahead(2) - 1),
			build: RIVAL_BUILDS.erika,
		},
		{
			runId: 104,
			userId: "koga",
			name: "Koga",
			gatesCleared: Math.max(0, gatesCleared - 1),
			lastClose: strongCloseAt(Math.max(0, gatesCleared - 2)),
			build: RIVAL_BUILDS.bare,
		},
		{
			runId: 105,
			userId: "sabrina",
			name: "Sabrina",
			gatesCleared: ahead(1),
			lastClose: { gate: ahead(1) - 1, band: "ok", cleared: true },
			build: RIVAL_BUILDS.bare,
		},
	];
};

type FiledIncident = {
	readonly targetRunId: number;
	readonly targetUserId: string;
	readonly targetGate: number;
	readonly auditId: AuditId;
	readonly row: IncidentFeedRowView;
};

type SimTrainer = { id: string; displayName: string; accuracy: number };

const TRAINERS: readonly SimTrainer[] = [
	{ id: "gary", displayName: "Gary Oak", accuracy: 0.9 },
	{ id: "lance", displayName: "Lance", accuracy: 0.8 },
	{ id: "sabrina", displayName: "Sabrina", accuracy: 0.7 },
	{ id: "erika", displayName: "Erika", accuracy: 0.6 },
	{ id: "misty", displayName: "Misty", accuracy: 0.5 },
	{ id: "brock", displayName: "Brock", accuracy: 0.45 },
	{ id: "ash", displayName: "Ash Ketchum", accuracy: 0.35 },
];

const YOU: ClimberProps = { name: "You", you: true };

const hashOf = (text: string): number =>
	[...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);

const simulatedPickLabels = (poll: RunPoll, trainer: SimTrainer): string[] => {
	const roll = hashOf(trainer.id + poll.id) % 100;
	const right = poll.options.filter((option) => option.correct);
	const wrong = poll.options.filter((option) => !option.correct);
	if (roll < trainer.accuracy * 100) return right.map((option) => option.label);
	if (poll.answerType === "multiple" && roll % 2 === 0 && right[0] && wrong[0])
		return [right[0].label, wrong[0].label];
	if (wrong.length === 0) return right.map((option) => option.label);
	return [wrong[roll % wrong.length].label];
};

const sameLabelSet = (a: readonly string[], b: readonly string[]): boolean =>
	a.length === b.length && a.every((label) => b.includes(label));

const climberOf = (trainer: SimTrainer): ClimberProps => ({
	name: trainer.displayName,
});

const trainerLeader = (seed: string) => {
	const login = TRAINERS[hashOf(seed) % TRAINERS.length].id;

	return { handle: `@${login}`, githubLogin: login };
};

const COMMUNITY_COUNTDOWN = "6h 12m";
const COMMUNITY_COUNTDOWN_HINT = "until the next five polls are dealt";
const CLIMB_MAP_TITLE = "Where everyone is";
const SEATED_CATEGORIES = 9;

const OPEN_SEAT_CATEGORY: CategoryCode = "git";

const withCategorySeat = (view: RunView): RunView => {
	if (!view.poll) return view;

	const category = view.poll.category;

	return {
		...view,
		poll: {
			...view.poll,
			categorySeat: {
				category,
				...(category === OPEN_SEAT_CATEGORY
					? {}
					: {
							leader: {
								userId: `seat:${category}`,
								...trainerLeader(`seat:${category}`),
								streak: 4 + (hashOf(`streak:${category}`) % 21),
								you: false,
							},
						}),
			},
		},
	};
};
const protoClimbFor = (gate: number): ClimbTodayView => ({
	climbers: [
		...TRAINERS.map((trainer, index) => ({
			id: trainer.id,
			displayName: trainer.displayName,
			gate: hashOf(trainer.id) % (gate + 1),
			pollsIntoGate: hashOf(trainer.displayName) % SLICE_WINDOW,
			you: false,
			startedAtGate: index % 4 === 0 ? 1 : 0,
			...(index % 3 === 0 ? { closingBand: "perfect" as const } : {}),
			...(index % 3 === 1 ? { closingBand: "shaky" as const } : {}),
		})),
		{
			id: "you",
			displayName: YOU.name,
			gate,
			pollsIntoGate: 0,
			you: true,
			startedAtGate: 0,
		},
	],
	fallen: [],
	bestPosition: null,
});

const simulateCommunityScreen = (
	view: RunView,
	polls: readonly RunPoll[],
	press: { onShop: () => void; onPrep: () => void },
	map: { openId?: string; onInspect: (id: string) => void }
): CommunityScreenProps => {
	const pollsById = new Map(polls.map((poll) => [poll.id, poll]));
	const answered = view.answeredThisGate;
	const climbers = TRAINERS.length + 1;
	const gate = view.gatePayout.clearedGateNumber;
	const swatch = gateSwatchAt(gate);

	const rightsOn = (poll: RunPoll): SimTrainer[] => {
		const rightLabels = poll.options
			.filter((option) => option.correct)
			.map((option) => option.label);
		return TRAINERS.filter((trainer) =>
			sameLabelSet(simulatedPickLabels(poll, trainer), rightLabels)
		);
	};

	const results = answered.flatMap((entry, index): PollResultProps[] => {
		const poll = pollsById.get(entry.id);
		if (poll === undefined) return [];

		const options = poll.options.map((option, position) => {
			const yours = entry.picked.includes(option.label);
			const pickers = TRAINERS.filter((trainer) =>
				simulatedPickLabels(poll, trainer).includes(option.label)
			);
			const votes = pickers.length + (yours ? 1 : 0);

			return {
				letter: String.fromCharCode(65 + position),
				label: option.label,
				percent: Math.round((votes / climbers) * 100),
				votes,
				isRight: option.correct,
				yours,
				voters: [...(yours ? [YOU] : []), ...pickers.map(climberOf)],
			};
		});

		return [
			{
				state: "revealed",
				index: index + 1,
				question: poll.question,
				category: getCategoryMetadata(poll.category).name,
				outcome: entry.outcome,
				share: entry.coverageFactors?.correct,
				rightShare: Math.round(
					((rightsOn(poll).length + (entry.outcome === "correct" ? 1 : 0)) /
						climbers) *
						100
				),
				options,
			},
		];
	});

	const yourRights = answered.filter(
		(entry) => entry.outcome === "correct"
	).length;
	const rightsPerTrainer = TRAINERS.map((trainer) => ({
		trainer,
		rights: answered.filter((entry) => {
			const poll = pollsById.get(entry.id);
			return poll !== undefined && rightsOn(poll).includes(trainer);
		}).length,
	}));
	const bandOf = (low: number, high: number) =>
		rightsPerTrainer
			.filter(({ rights }) => rights >= low && rights <= high)
			.map(({ trainer }) => climberOf(trainer));

	const window = view.pollsPerGate;
	const clean = bandOf(window, window);
	const middling = bandOf(Math.ceil(window / 2), window - 1);
	const struggling = bandOf(0, Math.ceil(window / 2) - 1);
	const yourBand =
		yourRights === window
			? clean
			: yourRights >= window / 2
				? middling
				: struggling;

	return {
		header: {
			swatch,
			title: `${swatch.gateName} · the day's climb`,
			subtitle: `seed #proto · ${window} polls`,
			countdown: COMMUNITY_COUNTDOWN,
			countdownHint: COMMUNITY_COUNTDOWN_HINT,
			stats: [
				{
					icon: "community",
					label: `${climbers} climbers`,
					hint: "answered today",
				},
				{
					icon: "gate",
					label: `gate ${gate} of ${view.victoryGate}`,
					hint: "deepest today",
				},
				{
					icon: "storage",
					label: kbLabel(view.storage),
					hint: "your balance",
				},
			],
			shop: { label: "Back to the shop", onPress: press.onShop },
			prep: { label: "On to prep", onPress: press.onPrep },
		},
		turnout: {
			title: "Who cleared what",
			when: "today",
			bands: [
				{
					label: `all ${window} right`,
					count: `${clean.length + (yourRights === window ? 1 : 0)}`,
					color: "viridian",
					climbers: yourBand === clean ? [YOU, ...clean] : clean,
				},
				{
					label: "most right",
					count: `${middling.length + (yourBand === middling ? 1 : 0)}`,
					color: "saffron",
					climbers: yourBand === middling ? [YOU, ...middling] : middling,
				},
				{
					label: "held back",
					count: `${struggling.length + (yourBand === struggling ? 1 : 0)}`,
					color: "cinnabar",
					climbers: yourBand === struggling ? [YOU, ...struggling] : struggling,
				},
			],
		},
		map: {
			title: CLIMB_MAP_TITLE,
			track: {
				gates: ladderFor(protoClimbFor(gate)),
				...(map.openId === undefined ? {} : { openId: map.openId }),
				onInspect: map.onInspect,
			},
		},
		leaders: {
			title: "Category leaders",
			summary: "longest run of correct answers · all-time",
			seated: `${SEATED_CATEGORIES} of ${CATEGORY_CODES.length} seated`,
			seats: CATEGORY_CODES.map((code, index) => ({
				category: getCategoryMetadata(code).name,
				...(index < SEATED_CATEGORIES
					? {
							leader: {
								...trainerLeader(`seat:${code}`),
								figure: `${24 - index * 2} in a row`,
							},
						}
					: { claim: "3 in a row claims it" }),
			})),
			footer: `A seat changes hands when somebody beats it. ${CATEGORY_CODES.length - SEATED_CATEGORIES} seats still open.`,
		},
		polls: {
			title: "The day's polls",
			summary: `${results.length} answered`,
			polls: results,
		},
	};
};

type RewardStep = "summary" | "review" | "shop" | "prep" | "community";
type OverStep = "summary" | "community";
type StartStep = "build" | "prep";

const BACK_TO_BUILD = "Back to the build";

const RunGame = ({ onRestart }: { onRestart: () => void }) => {
	const [state, setState] = useState(() => ({
		...createRun(
			POOLS,
			startingHand(STARTER_POOL, `proto:${Date.now()}`, BASE_SLOTS)
		),
		storage: PROTO_START_KB,
	}));
	const grantStorage = () =>
		setState((current) => ({
			...current,
			storage: addStorage(current.storage, PROTO_GRANT_KB),
		}));
	const toggleDevConfig = (config: Config) =>
		setState((current) => {
			const held = current.build.configs.some(
				(candidate) => candidate.id === config.id
			);
			const configs = held
				? current.build.configs.filter(
						(candidate) => candidate.id !== config.id
					)
				: [...current.build.configs, config];

			return {
				...current,
				available: current.available.some(
					(candidate) => candidate.id === config.id
				)
					? current.available
					: [...current.available, config],
				build: withBuild(current.build, configs),
			};
		});
	const dispatch = (action: RunAction) =>
		setState((current) => runReducer(current, action));
	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
	}, [state.currentIndex]);
	const [pinned, setPinned] = useState(false);
	const [rewardStep, setRewardStep] = useState<RewardStep>("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [state.gatesCleared]);
	const [startStep, setStartStep] = useState<StartStep>("build");
	useEffect(() => {
		setStartStep("build");
	}, [state.status]);
	const [stripStep, setStripStep] = useState<"removal" | "review">("removal");
	useEffect(() => {
		setStripStep("removal");
	}, [state.status]);
	const [overStep, setOverStep] = useState<OverStep>("summary");
	const [openClimberId, setOpenClimberId] = useState<string>();
	const [servicesOpen, setServicesOpen] = useState(false);
	const [unlockedServiceIds, setUnlockedServiceIds] =
		useState<readonly RegistryControlId[]>(REGISTRY_CONTROL_IDS);
	const toggleService = (id: RegistryControlId) =>
		setUnlockedServiceIds((current) =>
			current.includes(id)
				? current.filter((candidate) => candidate !== id)
				: [...current, id]
		);
	const climbMapPress = {
		...(openClimberId === undefined ? {} : { openId: openClimberId }),
		onInspect: (id: string) =>
			setOpenClimberId((current) => (current === id ? undefined : id)),
	};
	useEffect(() => {
		setOverStep("summary");
	}, [state.status]);

	const view = withCategorySeat(
		toRunView(state, [], [], [], unlockedServiceIds)
	);
	const settled: AnsweredPoll | undefined = pinned
		? view.answeredThisGate.at(-1)
		: undefined;
	const pollClock = usePollClock(
		settled ? null : (view.poll?.id ?? null),
		view.pollTimeLimitMs
	);
	const answer = (optionIds: readonly string[]) => {
		dispatch({ type: "answer", optionIds, elapsedMs: pollClock.elapsedMs() });
		setPinned(true);
	};
	const answerCurrent = (outcome: RigOutcome) => {
		const poll = state.polls[state.currentIndex];
		if (poll) answer(rigOptionIds(poll, outcome));
	};
	const answerRestOfWindow = (outcome: RigOutcome) =>
		setState((current) => {
			let next = current;
			while (next.status === "answering") {
				const poll = next.polls[next.currentIndex];
				if (!poll) break;
				next = runReducer(next, {
					type: "answer",
					optionIds: rigOptionIds(poll, outcome),
				});
				next = runReducer(next, { type: "close-gate" });
			}
			return next;
		});
	const onSelect = (optionId: string) => {
		if (view.poll?.answerType !== "multiple") return setSelected([optionId]);

		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};
	const payPeel = (configIds: readonly string[]) => {
		setRewardStep("shop");
		setState((current) =>
			runReducer(runReducer(current, { type: "strip", configIds }), {
				type: "resume-climb",
			})
		);
	};

	const [filed, setFiled] = useState<readonly FiledIncident[]>([]);
	const rivals = simulatedRivals(state.gatesCleared);
	const queued = queuedByRun(
		filed.map((incident) => ({
			runId: incident.targetRunId,
			gate: incident.targetGate,
			auditId: incident.auditId,
		}))
	);
	const attacker: Attacker | null =
		state.heldAudit === undefined
			? null
			: {
					runId: PROTO_RUN_ID,
					userId: PROTO_USER_ID,
					gatesCleared: state.gatesCleared,
					band: state.heldAudit.band,
				};
	const offers =
		attacker === null
			? []
			: offersFor(
					attacker,
					eligibleRivals(
						attacker,
						rivals,
						queued,
						filed[0]?.targetUserId ?? null
					),
					queued,
					getTodayDateString()
				).map(attackOfferViewFor);
	const fire = (targetRunId: number, auditId: AuditId) => {
		const offer = offers.find((entry) => entry.targetRunId === targetRunId);
		const payload = offer?.payloads.find((entry) => entry.auditId === auditId);
		const rival = rivals.find((entry) => entry.runId === targetRunId);
		if (offer === undefined || payload === undefined || rival === undefined)
			return;

		dispatch({ type: "fire-audit" });
		setFiled((current) => [
			{
				targetRunId,
				targetUserId: rival.userId,
				targetGate: offer.gate,
				auditId,
				row: {
					id: current.length + 1,
					sentBy: PROTO_YOU,
					target: offer.name,
					code: payload.code,
					name: payload.name,
					gate: offer.gate,
					status: "queued",
					own: true,
				},
			},
			...current,
		]);
	};
	const latest = filed[0];
	const attack = attackPanelFor(
		view.gateStake.gateNumber,
		view.heldAudit,
		offers,
		null,
		latest === undefined
			? undefined
			: `filed ${latest.row.code} against ${latest.row.target} · ${gateLabelOf(latest.row.gate)}`
	);

	return (
		<>
			{state.status === "configuring" && startStep === "build" && (
				<StartView
					view={view}
					onToggle={(id) =>
						dispatch({
							type: view.configs.some((config) => config.id === id)
								? "uninstall"
								: "install",
							configId: id,
						})
					}
					onVendorLock={(id) => dispatch({ type: "vendor-lock", configId: id })}
					onStart={() => setStartStep("prep")}
				/>
			)}

			{state.status === "configuring" && startStep === "prep" && (
				<PrepView
					view={view}
					backLabel={BACK_TO_BUILD}
					onStart={() => dispatch({ type: "start" })}
					onBackToShop={() => setStartStep("build")}
					onEstimate={(count) => dispatch({ type: "estimate", count })}
					onCommitBand={(band) => dispatch({ type: "commit-band", band })}
					onRebase={(from, to) => dispatch({ type: "rebase", from, to })}
					attack={attack}
					onFire={fire}
				/>
			)}

			{(settled || (state.status === "answering" && view.poll)) && (
				<PollView
					view={view}
					answered={settled}
					selectedOptionIds={selected}
					onSelect={onSelect}
					onSubmit={() => answer(selected)}
					onNext={() => {
						dispatch({ type: "close-gate" });
						setPinned(false);
					}}
					onPress={(action, configId) =>
						dispatch(
							action === "switch-arm"
								? { type: "switch-arm", configId }
								: { type: action === "lint" ? "lint-poll" : "peek-poll" }
						)
					}
					onUnseal={(optionId) =>
						dispatch({ type: "buy-back-option", optionId })
					}
				/>
			)}

			{!settled && state.status === "rewarding" && rewardStep === "summary" && (
				<GateOutcomeView
					view={view}
					verdict="cleared"
					onReview={() => setRewardStep("review")}
					onCommunity={() => setRewardStep("community")}
					onNext={() => setRewardStep("shop")}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "review" && (
				<ReviewView
					view={view}
					back={{
						label: "Back to the gate",
						onUse: () => setRewardStep("summary"),
					}}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "shop" && (
				<ShopView
					view={view}
					onDraft={(id) => dispatch({ type: "draft", configId: id })}
					onSell={(id) => dispatch({ type: "sell", configId: id })}
					onUpgrade={(id) => dispatch({ type: "upgrade", configId: id })}
					onRebuild={() => dispatch({ type: "rebuild-draft" })}
					onExtend={() => dispatch({ type: "extend-offers" })}
					onPlantPin={() => dispatch({ type: "plant-pin" })}
					onAbandon={() => undefined}
					onVendorLock={(id) => dispatch({ type: "vendor-lock", configId: id })}
					onContinue={() => setRewardStep("prep")}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "prep" && (
				<PrepView
					view={view}
					onStart={() => dispatch({ type: "finish-reward" })}
					onBackToShop={() => setRewardStep("shop")}
					onEstimate={(count) => dispatch({ type: "estimate", count })}
					onCommitBand={(band) => dispatch({ type: "commit-band", band })}
					onRebase={(from, to) => dispatch({ type: "rebase", from, to })}
					attack={attack}
					onFire={fire}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "community" && (
				<CommunityScreen
					{...simulateCommunityScreen(
						view,
						state.polls,
						{
							onShop: () => setRewardStep("shop"),
							onPrep: () => setRewardStep("prep"),
						},
						climbMapPress
					)}
					incidents={incidentsPanelFor(filed.map((incident) => incident.row))}
				/>
			)}

			{!settled &&
				state.status === "awaiting-strip" &&
				stripStep === "removal" && (
					<GateOutcomeView
						view={view}
						verdict="held"
						onReview={() => setStripStep("review")}
						onNext={() => setStripStep("review")}
						onRemove={payPeel}
						onRefuse={() => dispatch({ type: "refuse-gate" })}
					/>
				)}

			{state.status === "awaiting-strip" && stripStep === "review" && (
				<ReviewView
					view={view}
					back={{
						label: "Back to the gate",
						onUse: () => setStripStep("removal"),
					}}
				/>
			)}

			{!settled &&
				(state.status === "won" || state.status === "dead") &&
				overStep === "summary" && (
					<RunOverView
						view={view}
						onNewRun={onRestart}
						onCommunity={() => setOverStep("community")}
					/>
				)}

			{!settled &&
				(state.status === "won" || state.status === "dead") &&
				overStep === "community" && (
					<CommunityScreen
						{...simulateCommunityScreen(
							view,
							state.polls,
							{
								onShop: () => setOverStep("summary"),
								onPrep: () => setOverStep("summary"),
							},
							climbMapPress
						)}
					/>
				)}

			{servicesOpen && (
				<Screen theme="seafoam" width="wide" ground="bare">
					<DexControls {...dexControlsFor(controldex(unlockedServiceIds))} />
				</Screen>
			)}

			<div className="mx-auto mt-4 flex w-full max-w-6xl shrink-0 flex-wrap items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-3 text-xs text-pewter">
				<span className="font-semibold uppercase tracking-wide">Dev rig</span>
				{!settled && state.status === "answering" && (
					<>
						<button
							type="button"
							className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							onClick={() => answerCurrent("right")}
						>
							✓ Answer right
						</button>
						<button
							type="button"
							className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							onClick={() => answerCurrent("wrong")}
						>
							✕ Answer wrong
						</button>
						<button
							type="button"
							className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							onClick={() => answerRestOfWindow("right")}
						>
							⏩ All right → gate
						</button>
						<button
							type="button"
							className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
							onClick={() => answerRestOfWindow("wrong")}
						>
							⏩ All wrong → gate
						</button>
					</>
				)}
				<button
					type="button"
					className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
					onClick={grantStorage}
				>
					💾 +{PROTO_GRANT_KB} KB storage
				</button>
				<div className="flex w-full flex-wrap items-center gap-1 border-t border-dashed border-zinc-700 pt-2">
					<span className="mr-1 font-semibold uppercase tracking-wide">
						Services {unlockedServiceIds.length}/{REGISTRY_CONTROL_IDS.length}
					</span>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => setServicesOpen((current) => !current)}
					>
						{servicesOpen ? "Hide the dex panel" : "Show the dex panel"}
					</button>
					{REGISTRY_CONTROL_LIST.map((control) => {
						const unlocked = unlockedServiceIds.includes(control.id);
						return (
							<button
								key={control.id}
								type="button"
								title={`${control.title} · ${control.detail}`}
								className={
									unlocked
										? "rounded bg-viridian px-1.5 py-0.5 text-white"
										: "rounded bg-zinc-800 px-1.5 py-0.5 hover:bg-zinc-700"
								}
								onClick={() => toggleService(control.id)}
							>
								{control.glyph} {control.title}
							</button>
						);
					})}
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => setUnlockedServiceIds([])}
					>
						Lock all
					</button>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => setUnlockedServiceIds(REGISTRY_CONTROL_IDS)}
					>
						Unlock all
					</button>
				</div>
				<div className="flex w-full flex-wrap items-center gap-1 border-t border-dashed border-zinc-700 pt-2">
					<span className="mr-1 font-semibold uppercase tracking-wide">
						Configs {occupiedSlots(state.build.configs)}/
						{spaceForBuild(state.build)}
					</span>
					{CONFIG_LIST.map((config) => {
						const held = state.build.configs.some(
							(candidate) => candidate.id === config.id
						);
						return (
							<button
								key={config.id}
								type="button"
								title={`${slotsOf(config)} slots · ${config.description}`}
								className={
									held
										? "rounded bg-viridian px-1.5 py-0.5 text-white"
										: "rounded bg-zinc-800 px-1.5 py-0.5 hover:bg-zinc-700"
								}
								onClick={() => toggleDevConfig(config)}
							>
								{config.label}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
};

function RouteComponent() {
	const [seed, setSeed] = useState(0);
	return (
		<div className="flex flex-1 flex-col text-white [--screen-floor:0px] justify-center">
			<RunGame key={seed} onRestart={() => setSeed((current) => current + 1)} />
		</div>
	);
}
