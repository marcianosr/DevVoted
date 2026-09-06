import {
	type Config,
	faucetKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	type AnswerContext,
	type Coverage,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import {
	type AnsweredPoll,
	cachedHitsFor,
} from "~/modules/run/run/domain/runPoll.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { RevealScreen } from "~/ui/terminal-theme/screens/RevealScreen.ui";
import type { ChoiceState } from "~/ui/terminal-theme/Choice.ui";
import type {
	EquationFactor,
	EquationProps,
} from "~/ui/terminal-theme/Equation.ui";
import type { TrailProps } from "~/ui/terminal-theme/Trail.ui";
import {
	auditNotes,
	buildRows,
	buildTotalFor,
	categoryFor,
	factsFor,
	type PollFacts,
	questionFor,
	runHeaderFor,
	trailFor,
} from "~/modules/run/run/presentation/PollView.component";

const LETTERS = "ABCDEFGH";

const optionsOf = (poll: AnsweredPoll): readonly string[] =>
	poll.options ?? [...new Set([...poll.picked, ...(poll.correct ?? [])])];

const stateFor = (expected: boolean, picked: boolean): ChoiceState => {
	if (expected) return "expected";
	return picked ? "idle" : "dimmed";
};

const noteFor = (expected: boolean, picked: boolean): string | undefined => {
	if (expected && picked) return "expected · you picked";
	if (expected) return "expected";
	return picked ? "you picked" : undefined;
};

const settledChoices = (poll: AnsweredPoll) => {
	const expected = new Set(poll.correct ?? []);
	const picked = new Set(poll.picked);

	return optionsOf(poll).map((label, index) => ({
		letter: LETTERS[index] ?? `${index + 1}`,
		label,
		state: stateFor(expected.has(label), picked.has(label)),
		note: noteFor(expected.has(label), picked.has(label)),
	}));
};

const round = (value: number) => Math.round(value * 100) / 100;

const cachedHitsBefore = (view: RunView, answered: AnsweredPoll): number =>
	cachedHitsFor(view.allAnswered.slice(0, -1), answered.category);

const buildFactors = (
	view: RunView,
	answered: AnsweredPoll
): readonly EquationFactor[] => {
	const paidBy = new Map(
		(answered.coverageBreakdown?.configBonuses ?? []).map((bonus) => [
			bonus.configId,
			bonus.value,
		])
	);
	const context: AnswerContext = {
		category: answered.category,
		answeredBefore: view.answeredThisGate.length - 1,
		cachedHits: cachedHitsBefore(view, answered),
	};

	return view.configs
		.filter((config) => paidBy.has(config.id))
		.map((config) => ({ config, cover: effectOf(config).coverage?.(context) }))
		.filter(
			(entry): entry is { config: Config; cover: Coverage } =>
				entry.cover !== undefined
		)
		.map(({ config, cover }): EquationFactor => {
			if (cover.mult !== 1)
				return { label: config.label, value: `×${round(cover.mult)}` };
			return {
				label: config.label,
				value: `+${round(paidBy.get(config.id) ?? 0)}`,
			};
		});
};

const equationFactors = (
	view: RunView,
	answered: AnsweredPoll
): readonly EquationFactor[] => {
	const factors = answered.coverageFactors;
	if (!factors) return [];

	return [
		{
			label: answered.outcome,
			value: `${round(factors.correct)}`,
			boxed: true,
		},
		...(factors.streak !== 1
			? [{ label: "streak", value: `×${round(factors.streak)}` }]
			: []),
		...buildFactors(view, answered),
	];
};

// A miss has no factor row to close, so the loss reads once, here.
const totalFor = (
	answered: AnsweredPoll
): Pick<EquationProps, "result" | "resultLabel" | "resultTone"> => {
	if (answered.coverageLost === undefined)
		return {
			result: `+${round(answered.coverageEarned ?? 0)}%`,
			resultLabel: "coverage earned",
			resultTone: "viridian",
		};

	return {
		result: `−${round(answered.coverageLost)}%`,
		resultLabel: "coverage lost",
		resultTone: "cinnabar",
	};
};

const faucetKbByConfig = (
	view: RunView,
	answered: AnsweredPoll
): ReadonlyMap<string, number> => {
	const paid = new Map<string, number>();
	let remaining = answered.faucetKb ?? 0;
	for (const config of view.configs) {
		if (remaining <= 0) break;
		if (config.storagePerCorrect === undefined) continue;
		const kb = Math.min(remaining, faucetKbPerCorrect([config]));
		if (kb > 0) paid.set(config.id, kb);
		remaining -= kb;
	}
	return paid;
};

const revealTrailFor = (view: RunView): TrailProps => ({
	...trailFor(view),
	current: view.answeredThisGate.length,
});

const coverageSettlementFor = (view: RunView, answered: AnsweredPoll) => ({
	held: view.gateStake.coverageHeld,
	demand: view.gateStake.coverageDemand,
	earned:
		answered.coverageLost === undefined
			? (answered.coverageEarned ?? 0)
			: -answered.coverageLost,
});

const hasPollsLeft = (view: RunView): boolean =>
	view.pollsPerGate - view.answeredThisGate.length > 0;

export type RevealViewProps = {
	view: RunView;
	answered: AnsweredPoll;
	onNext: () => void;
};

export const RevealView = ({ view, answered, onNext }: RevealViewProps) => {
	const faucet = faucetKbByConfig(view, answered);
	const facts: PollFacts = {
		category: answered.category,
		answeredBefore: view.answeredThisGate.length - 1,
		cachedHits: cachedHitsBefore(view, answered),
	};
	const rows = buildRows(view, facts, []).map((row, index) => {
		const paid = faucet.get(view.configs[index]?.id ?? "");
		return paid === undefined ? row : { ...row, figure: `+${paid} KB` };
	});

	return (
		<RevealScreen
			theme={view.gateTheme}
			run={runHeaderFor(view)}
			coverage={coverageSettlementFor(view, answered)}
			build={{
				running: rows.filter((row) => row.dot === "on").length,
				rows,
				total: buildTotalFor(view, facts),
			}}
			audits={auditNotes(view)}
			trail={revealTrailFor(view)}
			facts={factsFor(view, {
				options: optionsOf(answered),
				answerType: answered.answerType,
			})}
			category={categoryFor(answered.category)}
			question={questionFor(view, answered.question)}
			choices={settledChoices(answered)}
			equation={{
				factors: equationFactors(view, answered),
				...totalFor(answered),
			}}
			explainer={answered.explanation}
			nextLabel={hasPollsLeft(view) ? "Next poll →" : "Next →"}
			onNext={onNext}
			byline={
				answered.author === undefined ? undefined : { author: answered.author }
			}
		/>
	);
};
