/**
 * THROWAWAY playable rig for the coverage-as-ratio model (DVTD-gv0v).
 * Open at /proto-coverage. Deliberately breaks the route/.ui.tsx split the way
 * proto-session-slice does: it carries its own JSX so the model can be felt
 * before any of the real engine is touched. If it stops being throwaway, its
 * UI moves into .ui.tsx files first.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import {
	type Build,
	hasRoomFor,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import {
	MULTIPLE_GAIN,
	PERIL_COLOUR,
	SINGLE_GAIN,
	coverageAfter,
	coverageDeltaFor,
	coverageMultiplierFor,
	coverageMultiplierOf,
	gatePayoutKb,
	focusBonusFor,
	gainPerCorrectFor,
	gainPerMissFor,
	lossShareAt,
	multiplierToSurvive,
	okAt,
	readCoverage,
	rightsToSurvive,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type Config,
	draftCost,
	sellRefund,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
	SLICE_WINDOW,
	VICTORY_GATE,
	nextSlotPriceKb,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import {
	type AnswerType,
	type RunOption,
	type RunPoll,
	coverageShare,
} from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { CoverageRing } from "~/ui/kanto-theme/CoverageRing.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const Route = createFileRoute("/proto-coverage")({
	component: RouteComponent,
	beforeLoad: () => {
		if (import.meta.env.PROD) throw redirect({ to: "/" });
	},
});

const STARTING_KB = 256;
const GATE_GRANT_KB = 256;
const OFFER_COUNT = 5;
const RING_CEILING = 100;
const PACE_RIGHTS = 4;

const STACK = "flex flex-col gap-5";
const ROW = "flex flex-wrap items-center gap-2";
const SPREAD = "flex flex-wrap items-start justify-between gap-4";
const CHOICES = "grid gap-2 sm:grid-cols-2";
const OFFERS = "flex flex-col gap-2";
const OFFER = "flex flex-wrap items-center justify-between gap-3";
const RIG = "flex flex-wrap items-center gap-2 border-t border-theme/20 pt-4";
const PIPS = "flex flex-wrap gap-1";
const PIP = "h-2 w-3 rounded-none";
const PIP_COVERED = "bg-theme";
const PIP_BARE = "bg-theme/20";

const BAND_SCALE =
	"The whole ruler slides each gate. HEALTHY climbs from 5% to 95%; OK sits 15 points under it and SHAKY 25 points under, and DANGER closes the gate. Early on those drops fall below zero, so the lower bands simply do not exist yet.";

const MODEL_BLURB =
	"Every gate starts at zero: you prove the same build again, against a higher bar. A correct answer covers a flat 12.5%, multiplied by the configs you installed. Weight never touches it. The answer is worth the same at every gate, so the rising bar is the whole difficulty, and around gate 8 the base rate simply stops being enough.";

const CAP_BLURB =
	"A cleared gate PAYS you: 32 KB for every slot you actually proved, times your answer streak. That is the only income, so a badly covered gate leaves you poor for the next shop. KB then splits two ways. Slots raise what a covered gate can pay you, configs with a multiplier are the only thing that opens the late gates, and once your multipliers already cap you at 100% the extra is wasted and you should be buying slots instead.";

const STREAK_BLURB =
	"Your streak multiplies what a gate PAYS and never touches coverage. Coverage does not care what order the answers came in either, only how many landed and which of them matched a config you hold.";

type ProtoStatus = "picking" | "answering" | "shop" | "dead" | "won";

type ProtoState = {
	readonly gate: number;
	readonly coverage: number;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly balanceKb: number;
	readonly answeredThisGate: number;
	readonly picked: readonly string[];
	readonly rightsThisGate: number;
	readonly streak: number;
	readonly earnedKb: number;
	readonly status: ProtoStatus;
	readonly notes: readonly string[];
};

const optionsOf = (
	labels: readonly string[],
	correct: readonly number[]
): readonly RunOption[] =>
	labels.map((label, index) => ({
		id: String.fromCharCode(97 + index),
		label,
		correct: correct.includes(index),
	}));

const POLLS: readonly RunPoll[] = [
	{
		id: "js-primitive",
		category: "js",
		answerType: "single",
		question: "Which of these is not a JavaScript primitive?",
		options: optionsOf(["symbol", "object", "bigint", "undefined"], [1]),
	},
	{
		id: "ts-satisfies",
		category: "ts",
		answerType: "single",
		question: "What does `satisfies` do that a type annotation does not?",
		options: optionsOf(
			[
				"Keeps the literal's narrow inferred type",
				"Widens the value to the target type",
				"Erases the type at runtime",
				"Makes every property optional",
			],
			[0]
		),
	},
	{
		id: "git-rewrites",
		category: "git",
		answerType: "multiple",
		question: "Which of these rewrite commits that already exist?",
		options: optionsOf(
			["git rebase", "git commit --amend", "git merge", "git log"],
			[0, 1]
		),
	},
	{
		id: "css-fr",
		category: "css",
		answerType: "single",
		question:
			"Which value makes a grid track take the free space that is left?",
		options: optionsOf(["1fr", "auto", "min-content", "100%"], [0]),
	},
	{
		id: "react-stable",
		category: "react",
		answerType: "multiple",
		question: "Which of these does React guarantee is stable across renders?",
		options: optionsOf(
			[
				"The setter a useState returns",
				"The object a useRef returns",
				"The value a useMemo returns",
				"An arrow function written inline as a prop",
			],
			[0, 1]
		),
	},
	{
		id: "java-boolean",
		category: "java",
		answerType: "single",
		question: "What is the default value of an uninitialised `boolean` field?",
		options: optionsOf(["false", "true", "null", "It will not compile"], [0]),
	},
	{
		id: "python-underscore",
		category: "python",
		answerType: "single",
		question: "What does a leading underscore on a name signal by convention?",
		options: optionsOf(
			[
				"It is internal to the module",
				"It is a constant",
				"It is a generator",
				"It is deprecated",
			],
			[0]
		),
	},
	{
		id: "html-void",
		category: "html",
		answerType: "multiple",
		question: "Which of these are void elements, with no closing tag?",
		options: optionsOf(["img", "br", "span", "input"], [0, 1, 3]),
	},
];

const STARTER_BUDGET = BASE_SLOTS;
const MIN_WEIGHT = BASE_SLOTS;

const STARTER_HAND: readonly Config[] = [
	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.yarnLock,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coldStart,
	CONFIGS.telemetry,
	CONFIGS.intellisense,
];

const weightOf = (state: ProtoState): number => occupiedSlots(state.configs);

const buildOf = (state: ProtoState): Build => ({
	id: "proto",
	slots: state.slots,
	configs: state.configs,
});

const slotsBoughtOf = (state: ProtoState): number => state.slots - BASE_SLOTS;

const nextSlotCostOf = (state: ProtoState): number | undefined =>
	state.slots >= MAX_SLOTS ? undefined : nextSlotPriceKb(slotsBoughtOf(state));

const readingOf = (state: ProtoState) =>
	readCoverage(weightOf(state), state.coverage, state.gate);

const gainOf = (
	state: ProtoState,
	category?: CategoryCode,
	answerType?: AnswerType
): number => gainPerCorrectFor(state.configs, category, answerType);

const lossOf = (
	state: ProtoState,
	category?: CategoryCode,
	answerType?: AnswerType
): number => gainPerMissFor(state.gate, state.configs, category, answerType);

const focusMatchOf = (state: ProtoState, category: CategoryCode): number =>
	focusBonusFor(state.configs, category);

const pacedGateAt = (gate: number, configs: readonly Config[]): number =>
	coverageAfter(PACE_RIGHTS, SLICE_WINDOW - PACE_RIGHTS, gate, configs);

const demandOf = (gate: number): string => {
	const needed = multiplierToSurvive(gate, PACE_RIGHTS, SLICE_WINDOW);

	if (needed === undefined) return "unreachable on four of five";
	if (needed <= 1) return "no multiplier needed";

	return `needs ×${needed.toFixed(2)} on four of five`;
};

const gateNameOf = (gate: number): string =>
	swatchForGate(gate)?.gateName ?? "Pallet";

const pollFor = (state: ProtoState): RunPoll =>
	POLLS[(state.gate * SLICE_WINDOW + state.answeredThisGate) % POLLS.length];

const survivalDemandOf = (gate: number, configs: readonly Config[]): string => {
	const rights = rightsToSurvive(gate, SLICE_WINDOW, configs);

	if (rights === undefined) return "impossible as built";
	if (rights === 0) return "no floor yet";

	return `${rights} of ${SLICE_WINDOW}`;
};

const offersAt = (state: ProtoState): readonly Config[] => {
	const held = new Set(state.configs.map((config) => config.id));
	const pool = CONFIG_LIST.filter((config) => !held.has(config.id));
	const start = (state.gate * 3) % Math.max(1, pool.length);

	return Array.from(
		{ length: Math.min(OFFER_COUNT, pool.length) },
		(_, offset) => pool[(start + offset) % pool.length]
	);
};

const openingState = (): ProtoState => ({
	gate: 0,
	coverage: 0,
	slots: BASE_SLOTS,
	configs: [],
	balanceKb: STARTING_KB,
	answeredThisGate: 0,
	picked: [],
	rightsThisGate: 0,
	streak: 0,
	earnedKb: 0,
	status: "picking",
	notes: ["Fill 4 weight. It starts untested, like any new code."],
});

const pickStarter = (state: ProtoState, config: Config): ProtoState =>
	state.status !== "picking" ||
	weightOf(state) + slotsOf(config) > STARTER_BUDGET
		? state
		: { ...state, configs: [...state.configs, config] };

const unpickStarter = (state: ProtoState, index: number): ProtoState =>
	state.status !== "picking"
		? state
		: { ...state, configs: state.configs.filter((_, at) => at !== index) };

const noted = (state: ProtoState, note: string): ProtoState => ({
	...state,
	notes: [...state.notes, note].slice(-8),
});

const beginRun = (state: ProtoState): ProtoState => {
	const weight = weightOf(state);

	if (state.status !== "picking" || weight < MIN_WEIGHT) return state;

	return noted(
		{ ...state, coverage: 0, status: "answering" },
		`Started on weight ${weight} in ${state.slots} slots. A single-choice answer covers ${(gainPerCorrectFor(state.configs) * 100).toFixed(1)}% and a multiple-choice one up to ${(gainPerCorrectFor(state.configs, undefined, "multiple") * 100).toFixed(1)}%, whatever you carry. Gate 3 is where that stops being enough.`
	);
};

const closeGate = (state: ProtoState): ProtoState => {
	const reading = readingOf(state);
	const percent = (reading.ratio * 100).toFixed(0);

	if (!reading.survives)
		return noted(
			{ ...state, status: "dead" },
			`Gate ${state.gate} (${gateNameOf(state.gate)}) closed: coverage reached only ${percent}%, under its ${(reading.floor * 100).toFixed(0)}% floor.`
		);

	const paid = gatePayoutKb(
		state.coverage,
		state.gate,
		reading.weight,
		state.streak
	);
	const gate = state.gate + 1;
	const banking = `${reading.band.label} at ${percent}%, proving ${reading.coveredSlots.toFixed(1)} of ${reading.weight} slots and paying ${paid} KB on a ${state.streak} streak.`;

	if (gate > VICTORY_GATE)
		return noted(
			{
				...state,
				status: "won",
				balanceKb: state.balanceKb + paid,
				earnedKb: state.earnedKb + paid,
			},
			`Champion cleared. ${banking}`
		);

	return noted(
		{
			...state,
			gate,
			coverage: 0,
			earnedKb: state.earnedKb + paid,
			status: "shop",
			answeredThisGate: 0,
			rightsThisGate: 0,
			balanceKb: state.balanceKb + paid,
		},
		`Cleared ${banking} Coverage resets to 0% for ${gateNameOf(gate)}, which needs ${(readCoverage(reading.weight, 0, gate).healthyLine * 100).toFixed(0)}%.`
	);
};

const answer = (state: ProtoState, share: number): ProtoState => {
	if (state.status !== "answering") return state;

	const { category, answerType } = pollFor(state);
	const fullMarks = share >= 1;

	const answered: ProtoState = {
		...state,
		coverage: Math.min(
			1,
			Math.max(
				0,
				state.coverage +
					coverageDeltaFor(
						share,
						state.gate,
						state.configs,
						category,
						answerType
					)
			)
		),
		streak: fullMarks ? state.streak + 1 : 0,
		rightsThisGate: state.rightsThisGate + (fullMarks ? 1 : 0),
		answeredThisGate: state.answeredThisGate + 1,
		picked: [],
	};

	return answered.answeredThisGate < SLICE_WINDOW
		? answered
		: closeGate(answered);
};

const answerAll = (state: ProtoState, share: number): ProtoState =>
	Array.from({ length: SLICE_WINDOW }).reduce<ProtoState>(
		(running) =>
			running.status === "answering" ? answer(running, share) : running,
		state
	);

const togglePick = (state: ProtoState, optionId: string): ProtoState =>
	state.status !== "answering"
		? state
		: {
				...state,
				picked: state.picked.includes(optionId)
					? state.picked.filter((id) => id !== optionId)
					: [...state.picked, optionId],
			};

const commitPicked = (state: ProtoState): ProtoState =>
	state.picked.length === 0
		? state
		: answer(state, coverageShare(pollFor(state), state.picked));

const draft = (state: ProtoState, config: Config): ProtoState => {
	const cost = draftCost(config);

	if (state.balanceKb < cost) return state;
	if (!hasRoomFor(buildOf(state), slotsOf(config))) return state;

	const installed: ProtoState = {
		...state,
		configs: [...state.configs, config],
		balanceKb: state.balanceKb - cost,
	};

	return noted(
		installed,
		`Installed ${config.label} (+${slotsOf(config)} weight, ${occupiedSlots(installed.configs)} of ${state.slots} slots filled). Coverage now ×${coverageMultiplierOf(installed.configs)}, so an answer covers ${(gainPerCorrectFor(installed.configs) * 100).toFixed(1)}%.`
	);
};

const sell = (state: ProtoState, index: number): ProtoState => {
	const config = state.configs[index];

	if (config === undefined || state.status !== "shop") return state;

	const remaining = state.configs.filter((_, at) => at !== index);

	if (occupiedSlots(remaining) < MIN_WEIGHT) return state;

	return noted(
		{
			...state,
			configs: remaining,
			balanceKb: state.balanceKb + sellRefund(config),
		},
		`Sold ${config.label} for ${sellRefund(config)} KB. Weight ${occupiedSlots(remaining)}, cheaper to maintain, worth less when you cover it.`
	);
};

const buySlot = (state: ProtoState): ProtoState => {
	const cost = nextSlotCostOf(state);

	if (state.status !== "shop" || cost === undefined) return state;
	if (state.balanceKb < cost) return state;

	return noted(
		{ ...state, slots: state.slots + 1, balanceKb: state.balanceKb - cost },
		`Bought slot ${state.slots + 1} for ${cost} KB. Empty capacity scores nothing until a config fills it.`
	);
};

const leaveShop = (state: ProtoState): ProtoState =>
	state.status === "shop" ? { ...state, status: "answering" } : state;

const grantKb = (state: ProtoState): ProtoState => ({
	...state,
	balanceKb: state.balanceKb + GATE_GRANT_KB,
});

const CoverPips = ({ ratio, weight }: { ratio: number; weight: number }) => (
	<span className={PIPS}>
		{Array.from({ length: Math.max(1, weight) }, (_, slot) => (
			<span
				key={slot}
				className={`${PIP} ${slot < Math.round(ratio * weight) ? PIP_COVERED : PIP_BARE}`}
			/>
		))}
	</span>
);

const ProtoRun = ({ onRestart }: { onRestart: () => void }) => {
	const [state, setState] = useState(openingState);

	const reading = readingOf(state);
	const percent = reading.ratio * 100;
	const poll = pollFor(state);
	const swatch = swatchForGate(state.gate);

	const multipleChoice = poll.answerType === "multiple";
	const gain = gainOf(state, poll.category, poll.answerType);
	const loss = lossOf(state, poll.category, poll.answerType);
	const focusMatch = focusMatchOf(state, poll.category);
	const focusesHeld = state.configs.filter(
		(config) => config.focusCategory !== undefined
	);
	const ifRight = Math.min(1, state.coverage + gain) * 100 - percent;
	const ifWrong = percent - Math.max(0, state.coverage - loss) * 100;

	return (
		<Screen gate={swatch?.theme ?? "pallet"} width="default">
			<div className={STACK}>
				<div className={SPREAD}>
					<CoverageRing
						held={percent}
						demand={reading.healthyLine * 100}
						ceiling={RING_CEILING}
						title={`Gate ${state.gate} — ${gateNameOf(state.gate)}`}
						note={`${reading.coveredSlots.toFixed(1)} of ${reading.weight} slots proven`}
					/>
					<div className={ROW}>
						<Badge color={PERIL_COLOUR[reading.peril]}>
							{reading.band.label}
							{reading.peril === "fatal" ? " · CLOSES ON YOU" : ""}
						</Badge>
						<Badge color={reading.floor > 0 ? "pewter" : "viridian"}>
							{reading.floor > 0
								? `floor ${(reading.floor * 100).toFixed(0)}%`
								: "no floor yet"}
						</Badge>
						<Badge color="pewter">weight {reading.weight}</Badge>
						<Badge color="cerulean">{state.earnedKb} KB earned</Badge>
						<Badge color={state.streak > 0 ? "fuchsia" : "pewter"}>
							streak {state.streak} · score ×
							{streakMultiplier(state.streak).toFixed(1)}
						</Badge>
						<Badge color={reading.meetsBar ? "viridian" : "pewter"}>
							{reading.meetsBar
								? "healthy"
								: `${reading.healthyOwed.toFixed(1)} slots to healthy`}
						</Badge>
						<Badge color="saffron">{state.balanceKb} KB</Badge>
					</div>
				</div>

				<Panel>
					<div className={STACK}>
						<Typography variant="hint">{MODEL_BLURB}</Typography>
						<Typography variant="hint">{CAP_BLURB}</Typography>
						<Typography variant="hint">{STREAK_BLURB}</Typography>
						<Typography variant="hint">{BAND_SCALE}</Typography>
						<Typography variant="hint">
							{reading.floor <= 0
								? `This gate: HEALTHY ${(reading.healthyLine * 100).toFixed(0)}%+, nothing below it can close the gate, and a miss costs nothing.`
								: `This gate: HEALTHY ${(reading.healthyLine * 100).toFixed(0)}%+ · OK ${(okAt(state.gate) * 100).toFixed(0)}%+ · SHAKY ${(reading.floor * 100).toFixed(0)}%+ · DANGER under ${(reading.floor * 100).toFixed(0)}%, which closes it. A miss costs ${lossShareAt(state.gate) < 1 ? `${(lossShareAt(state.gate) * 100).toFixed(0)}% of a correct answer` : `${lossShareAt(state.gate).toFixed(1)} correct answers`}.`}
						</Typography>
					</div>
				</Panel>

				<Panel>
					<div className={STACK}>
						<div className={ROW}>
							<Typography variant="label">BUILD</Typography>
							<CoverPips ratio={reading.ratio} weight={reading.weight} />
							<Typography variant="caption">
								{reading.coveredSlots.toFixed(1)} of {reading.weight} slots
								proven
							</Typography>
							<Badge
								color={weightOf(state) < state.slots ? "saffron" : "viridian"}
							>
								{weightOf(state)} of {state.slots} slots filled
							</Badge>
							<Badge
								color={
									coverageMultiplierOf(state.configs) > 1 ? "fuchsia" : "pewter"
								}
							>
								coverage ×{coverageMultiplierOf(state.configs)}
							</Badge>
						</div>
						<div className={ROW}>
							{state.configs.map((config, index) => (
								<Badge key={`${config.id}-${index}`} color="cerulean">
									{config.label} · {slotsOf(config)}
								</Badge>
							))}
						</div>
						<Typography variant="hint">
							{`An unmatched answer covers ${(gainOf(state) * 100).toFixed(1)}% on a single-choice poll and ${(gainOf(state, undefined, "multiple") * 100).toFixed(1)}% on a multiple-choice one: ${(SINGLE_GAIN * 100).toFixed(0)}% or ${(MULTIPLE_GAIN * 100).toFixed(0)}% base, multiplied ×${coverageMultiplierOf(state.configs)} by what you installed. Weight never touches it, it only decides what a covered gate pays.`}
						</Typography>
						{focusesHeld.length === 0 ? null : (
							<Typography variant="hint">
								{`Focused on ${focusesHeld.map((config) => config.focusCategory).join(", ")}: a single-choice poll in one of those covers ${(SINGLE_GAIN * coverageMultiplierFor(state.configs, focusesHeld[0].focusCategory) * 100).toFixed(1)}% instead.`}
							</Typography>
						)}
						<Typography variant="hint">
							{reading.floor <= 0
								? `This gate has no floor, so nothing you answer can close it.`
								: `This gate ${demandOf(state.gate)}, and as built it ${survivalDemandOf(state.gate, state.configs) === "impossible as built" ? "cannot be survived" : `survives on ${survivalDemandOf(state.gate, state.configs)}`}.`}
						</Typography>
					</div>
				</Panel>

				{state.status === "picking" ? (
					<Panel>
						<div className={STACK}>
							<Typography variant="title">
								Fill {STARTER_BUDGET} weight — {weightOf(state)} of{" "}
								{STARTER_BUDGET} spent
							</Typography>
							<Typography variant="hint">
								Whatever you pick starts at 0% — installing writes no tests.
								Fill all {STARTER_BUDGET} slots: coverage does not care what you
								carry, so an empty slot is pure lost score. The opening three
								gates have no floor and charge nothing for a miss, and the base
								rate carries you to about gate 8 before multipliers are the only
								way through.
							</Typography>
							<div className={ROW}>
								{state.configs.map((config, index) => (
									<Button
										key={`picked-${config.id}-${index}`}
										label={`${config.label} · ${slotsOf(config)}`}
										size="sm"
										tone="danger"
										onPress={() =>
											setState((current) => unpickStarter(current, index))
										}
									/>
								))}
							</div>
							<div className={OFFERS}>
								{STARTER_HAND.map((config) => (
									<div key={config.id} className={OFFER}>
										<div className={ROW}>
											<Badge color="cerulean">{slotsOf(config)}</Badge>
											<Typography variant="accent">{config.label}</Typography>
											<Typography variant="caption">
												{config.description}
											</Typography>
										</div>
										<Button
											label="Take"
											tone="action"
											size="sm"
											disabled={
												weightOf(state) + slotsOf(config) > STARTER_BUDGET
											}
											onPress={() =>
												setState((current) => pickStarter(current, config))
											}
										/>
									</div>
								))}
							</div>
							<Button
								label={
									weightOf(state) < MIN_WEIGHT
										? `${MIN_WEIGHT - weightOf(state)} more weight to start`
										: `Start on weight ${weightOf(state)}`
								}
								tone="action"
								disabled={weightOf(state) < MIN_WEIGHT}
								onPress={() => setState(beginRun)}
							/>
						</div>
					</Panel>
				) : null}

				{state.status === "answering" ? (
					<Panel>
						<div className={STACK}>
							<div className={ROW}>
								<Typography variant="label">
									POLL {state.answeredThisGate + 1} OF {SLICE_WINDOW}
								</Typography>
								<Badge color={focusMatch > 1 ? "fuchsia" : "lavender"}>
									{poll.category}
									{focusMatch > 1 ? ` · MATCHED ×${focusMatch}` : ""}
								</Badge>
								<Badge color={multipleChoice ? "cerulean" : "pewter"}>
									{multipleChoice
										? `pick every right one · ${(MULTIPLE_GAIN * 100).toFixed(0)}% base`
										: `one answer · ${(SINGLE_GAIN * 100).toFixed(0)}% base`}
								</Badge>
								<Badge color="pewter">
									{state.rightsThisGate} right so far
								</Badge>
							</div>
							<Typography variant="title">{poll.question}</Typography>
							<div className={CHOICES}>
								{poll.options.map((option, index) => (
									<Button
										key={option.id}
										cap={String.fromCharCode(65 + index)}
										label={option.label}
										pressed={
											multipleChoice
												? state.picked.includes(option.id)
												: undefined
										}
										onPress={() =>
											setState((current) =>
												multipleChoice
													? togglePick(current, option.id)
													: answer(current, coverageShare(poll, [option.id]))
											)
										}
									/>
								))}
							</div>
							{multipleChoice ? (
								<div className={ROW}>
									<Button
										label={`Submit ${state.picked.length} picked`}
										tone="action"
										disabled={state.picked.length === 0}
										onPress={() => setState(commitPicked)}
									/>
									<Typography variant="caption">
										Every right one you leave out and every wrong one you add
										takes a share off the {(gain * 100).toFixed(1)}%. Only full
										marks keep the streak alive.
									</Typography>
								</div>
							) : null}
							<div className={ROW}>
								<Badge color="viridian">+{ifRight.toFixed(1)}% if right</Badge>
								<Badge color={loss > 0 ? "cinnabar" : "pewter"}>
									{loss > 0
										? `−${ifWrong.toFixed(1)}% if wrong`
										: "a miss costs nothing yet"}
								</Badge>
								<Typography variant="caption">
									{focusMatch > 1
										? `this poll matches a config you hold, so it pays ${(gain * 100).toFixed(1)}% instead of ${(gainOf(state, undefined, poll.answerType) * 100).toFixed(1)}%`
										: `nothing you hold matches ${poll.category}, so it pays the plain ${(gain * 100).toFixed(1)}%`}
									. {survivalDemandOf(state.gate, state.configs)} of plain
									single-choice answers survives this gate, and every
									multiple-choice poll you meet buys you room.
								</Typography>
							</div>
						</div>
					</Panel>
				) : null}

				{state.status === "shop" ? (
					<Panel>
						<div className={STACK}>
							<Typography variant="title">
								Shop — {gateNameOf(state.gate)}
							</Typography>
							<Typography variant="hint">
								Coverage is 0% again, and KB splits two ways. Meeting the line
								on a gate pays 32 KB for every slot you carry, whichever gate it
								is, and beating it pays up to half again. A SLOT raises that
								payout; a CONFIG fills one, and the ones with a multiplier are
								the only thing that opens the late gates. This gate{" "}
								{demandOf(state.gate)}.
							</Typography>
							<div className={OFFER}>
								<div className={ROW}>
									<Badge color="saffron">
										{weightOf(state)} of {state.slots} slots filled
									</Badge>
									<Typography variant="caption">
										{nextSlotCostOf(state) === undefined
											? `Capacity is maxed at ${MAX_SLOTS}.`
											: `A slot scores nothing until a config fills it.`}
									</Typography>
								</div>
								<Button
									label={
										nextSlotCostOf(state) === undefined
											? "Capacity maxed"
											: `Buy slot ${state.slots + 1} · ${nextSlotCostOf(state)} KB`
									}
									tone="action"
									size="sm"
									disabled={
										nextSlotCostOf(state) === undefined ||
										state.balanceKb < (nextSlotCostOf(state) ?? 0)
									}
									onPress={() => setState(buySlot)}
								/>
							</div>
							<div className={OFFERS}>
								{offersAt(state).map((config) => {
									const slots = slotsOf(config);
									const after = [...state.configs, config];
									const needsNow = rightsToSurvive(
										state.gate,
										SLICE_WINDOW,
										state.configs
									);
									const needsAfter = rightsToSurvive(
										state.gate,
										SLICE_WINDOW,
										after
									);
									const easesSurvival =
										needsAfter !== undefined &&
										(needsNow === undefined || needsAfter < needsNow);
									const paysNow = gatePayoutKb(
										pacedGateAt(state.gate, state.configs),
										state.gate,
										reading.weight,
										state.streak
									);
									const paysAfter = gatePayoutKb(
										pacedGateAt(state.gate, after),
										state.gate,
										reading.weight + slots,
										state.streak
									);
									const fits = hasRoomFor(buildOf(state), slots);

									return (
										<div key={config.id} className={OFFER}>
											<div className={ROW}>
												<Badge color="cerulean">+{slots}</Badge>
												<Typography variant="accent">{config.label}</Typography>
												<Badge
													color={paysAfter > paysNow ? "viridian" : "pewter"}
												>
													on {PACE_RIGHTS} of {SLICE_WINDOW}: pays {paysNow} →{" "}
													{paysAfter} KB
												</Badge>
												<Badge
													color={
														coverageMultiplierOf(after) >
														coverageMultiplierOf(state.configs)
															? "fuchsia"
															: "pewter"
													}
												>
													answer{" "}
													{(gainPerCorrectFor(state.configs) * 100).toFixed(1)}%
													→ {(gainPerCorrectFor(after) * 100).toFixed(1)}%
												</Badge>
												{fits ? null : (
													<Badge color="cinnabar">
														needs {slots - (state.slots - weightOf(state))} more
														slots
													</Badge>
												)}
												<Badge color={easesSurvival ? "viridian" : "pewter"}>
													{easesSurvival
														? `survives on ${needsNow ?? "no"} → ${needsAfter} of ${SLICE_WINDOW}`
														: `still needs ${needsNow ?? "more than " + SLICE_WINDOW} of ${SLICE_WINDOW}`}
												</Badge>
												<Typography variant="caption">
													{config.description}
												</Typography>
											</div>
											<Button
												label={`${draftCost(config)} KB`}
												tone="action"
												size="sm"
												disabled={!fits || state.balanceKb < draftCost(config)}
												onPress={() =>
													setState((current) => draft(current, config))
												}
											/>
										</div>
									);
								})}
							</div>
							<Typography variant="label">SELL</Typography>
							<Typography variant="hint">
								Selling drops weight, which makes every gate from here easier to
								cover and every gate from here worth less. You keep half the KB.
								You cannot sell below weight {MIN_WEIGHT}.
							</Typography>
							<div className={ROW}>
								{state.configs.map((config, index) => (
									<Button
										key={`sell-${config.id}-${index}`}
										label={`${config.label} → ${sellRefund(config)} KB`}
										size="sm"
										tone="danger"
										disabled={
											occupiedSlots(
												state.configs.filter((_, at) => at !== index)
											) < MIN_WEIGHT
										}
										onPress={() => setState((current) => sell(current, index))}
									/>
								))}
							</div>
							<Button
								label="Continue to the polls"
								tone="action"
								onPress={() => setState(leaveShop)}
							/>
						</div>
					</Panel>
				) : null}

				{state.status === "dead" ? (
					<Panel>
						<div className={STACK}>
							<Typography variant="headline">Build broke</Typography>
							<Typography variant="paragraph">
								{gateNameOf(state.gate)}: {state.rightsThisGate} of{" "}
								{SLICE_WINDOW} right reached only {percent.toFixed(0)}%, under
								its {(reading.floor * 100).toFixed(0)}% floor. You were carrying
								weight {reading.weight}, which needed{" "}
								{(reading.floor * 100).toFixed(0)}% to survive on a{" "}
								{(gainOf(state) * 100).toFixed(1)}% single-choice answer. You
								earned {state.earnedKb} KB across {state.gate} gates.
							</Typography>
							<Button label="New run" tone="action" onPress={onRestart} />
						</div>
					</Panel>
				) : null}

				{state.status === "won" ? (
					<Panel>
						<div className={STACK}>
							<Typography variant="headline">Champion</Typography>
							<Typography variant="paragraph">
								Thirteen gates proven on weight {reading.weight}, earning{" "}
								{state.earnedKb} KB along the way.
							</Typography>
							<Button label="New run" tone="action" onPress={onRestart} />
						</div>
					</Panel>
				) : null}

				<Panel>
					<div className={STACK}>
						<Typography variant="label">LOG</Typography>
						{state.notes.map((note, index) => (
							<Typography key={`${index}-${note}`} variant="hint">
								{note}
							</Typography>
						))}
					</div>
				</Panel>

				<div className={RIG}>
					<Typography variant="label">DEV RIG</Typography>
					<Button
						glyph="✓"
						label="Answer right"
						size="sm"
						disabled={state.status !== "answering"}
						onPress={() => setState((current) => answer(current, 1))}
					/>
					<Button
						glyph="✕"
						label="Answer wrong"
						size="sm"
						disabled={state.status !== "answering"}
						onPress={() => setState((current) => answer(current, 0))}
					/>
					<Button
						label="All right to gate"
						size="sm"
						disabled={state.status !== "answering"}
						onPress={() => setState((current) => answerAll(current, 1))}
					/>
					<Button
						label="All wrong to gate"
						size="sm"
						disabled={state.status !== "answering"}
						onPress={() => setState((current) => answerAll(current, 0))}
					/>
					<Button
						label={`+${GATE_GRANT_KB} KB`}
						size="sm"
						onPress={() => setState(grantKb)}
					/>
					<Button label="Restart" size="sm" tone="danger" onPress={onRestart} />
				</div>
			</div>
		</Screen>
	);
};

function RouteComponent() {
	const [seed, setSeed] = useState(0);

	return <ProtoRun key={seed} onRestart={() => setSeed((run) => run + 1)} />;
}
