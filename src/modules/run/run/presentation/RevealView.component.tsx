import {
	type Config,
	faucetKbPerCorrect,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import {
	type AnswerContext,
	type Coverage,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import type { CoverageConfigBonus } from "~/modules/run/pipeline/domain/pipeline.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { Chip } from "~/ui/modern-theme/Chip.ui";
import { Equation, type EquationFactor } from "~/ui/modern-theme/Equation.ui";
import { Text } from "~/ui/modern-theme/Text.ui";
import {
	PollScreen,
	type PollOption,
} from "~/ui/modern-theme/screens/PollScreen.ui";
import {
	categoryFor,
	gateHeaderFor,
	pipelineRows,
	questionFor,
	railFor,
	trailFor,
} from "~/modules/run/run/presentation/PollView.component";

/** Older answers carry no option list; the picks and the key still name every
 * option worth showing (same fallback the review uses). */
const optionsOf = (poll: AnsweredPoll): readonly string[] =>
	poll.options ?? [...new Set([...poll.picked, ...(poll.correct ?? [])])];

// "Expected", not "correct": under the Mirror the gate wants the incorrect
// options, and the review already speaks this language.
const settledOptions = (poll: AnsweredPoll): readonly PollOption[] => {
	const expected = new Set(poll.correct ?? []);
	const picked = new Set(poll.picked);

	return optionsOf(poll).map((label): PollOption => {
		const wrongPick = picked.has(label) && !expected.has(label);
		return {
			id: label,
			name: poll.id,
			label,
			checked: picked.has(label),
			settled: true,
			letterTone: expected.has(label)
				? "celadon"
				: wrongPick
					? "cinnabar"
					: undefined,
			trailing:
				expected.has(label) || picked.has(label) ? (
					<>
						{expected.has(label) ? <Chip tone="celadon">expected</Chip> : null}
						{picked.has(label) ? (
							<Chip tone={wrongPick ? "cinnabar" : "celadon"}>you picked</Chip>
						) : null}
					</>
				) : undefined,
			onChange: () => {},
		};
	});
};

/**
 * The build's half of the arithmetic, one chip per contributing config, each
 * wearing its rarity. Only configs the breakdown says fired are read (an
 * audit's outage is invisible to a recompute over the installed pipeline), and
 * their covers are pure functions of the answered context, so which operator a
 * config joins with is a lookup, not arithmetic.
 *
 * A multiplier chip carries the multiplier itself; a flat-add chip carries the
 * coverage it actually contributed, taken straight from the breakdown — the
 * same figure its rail row badges, so one config never reads two ways on one
 * screen. That figure is `share × add` rather than the raw add, which is what
 * lets the adds sit in a bracket with the base: `(share + share × add)` is
 * exactly `share × (1 + add)`.
 */
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
	};

	return view.configs
		.filter((config) => paidBy.has(config.id))
		.map((config) => ({ config, cover: effectOf(config).coverage?.(context) }))
		.filter(
			(entry): entry is { config: Config; cover: Coverage } =>
				entry.cover !== undefined
		)
		.map(({ config, cover }): EquationFactor => {
			const rarity = rarityOf(config);
			if (cover.mult !== 1)
				return { label: config.label, value: cover.mult, rarity };
			return {
				label: config.label,
				value: paidBy.get(config.id) ?? 0,
				op: "plus",
				rarity,
			};
		});
};

/**
 * The mock's reading order: correct × streak × each contributing config.
 * Factors sitting at 1 stay out — a chip that multiplies by nothing is noise —
 * but the base always shows, since it names the outcome.
 */
const equationFactors = (
	view: RunView,
	answered: AnsweredPoll
): readonly EquationFactor[] => {
	const factors = answered.coverageFactors;
	if (!factors) return [];
	return [
		{ label: answered.outcome, value: factors.correct },
		...(factors.streak !== 1
			? [{ label: "streak", value: factors.streak }]
			: []),
		...buildFactors(view, answered),
	];
};

const firedByConfig = (
	bonuses: readonly CoverageConfigBonus[]
): ReadonlyMap<string, number> =>
	new Map(bonuses.map((bonus) => [bonus.configId, bonus.value]));

/** The faucet clamp applies to the total, so the recorded KB is handed back
 * out in config order until it runs dry — exact for the single faucet config
 * the roster holds, and never over-credits with more. */
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

export type RevealViewProps = {
	view: RunView;
	answered: AnsweredPoll;
	onNext: () => void;
};

/**
 * The stakes beside the Next button: window left, and where the meter stands
 * against the gate's demand. Silent after the window's 5th answer — the gate
 * has already decided, and the click should reveal it, not spoil it.
 */
const nextNote = (view: RunView): string | undefined => {
	const pollsLeft = view.pollsPerGate - view.answeredThisGate.length;
	if (pollsLeft <= 0) return undefined;
	const { coverageHeld, coverageDemand, gateNumber } = view.gateStake;
	const gateName = swatchForGate(gateNumber)?.gateName ?? `gate ${gateNumber}`;
	const shortBy = roundToOneDecimal(Math.max(0, coverageDemand - coverageHeld));
	const demand =
		shortBy > 0
			? `${shortBy}% short of clearing ${gateName}`
			: `${gateName}'s demand met`;
	return `${pollsLeft} to go · ${demand}`;
};

/**
 * The post-answer beat: the answered poll settles in place, the equation reads
 * out under it, and the rail shows what each config just delivered. The rail's
 * statuses are re-read for the answered poll (its category, the count before
 * it landed); the one drift is an audit's offline roll, which the reducer has
 * already advanced to the next poll by the time the reveal renders.
 */
export const RevealView = ({ view, answered, onNext }: RevealViewProps) => {
	const fired = firedByConfig(answered.coverageBreakdown?.configBonuses ?? []);
	const faucet = faucetKbByConfig(view, answered);
	const rows = pipelineRows(
		view,
		{
			category: answered.category,
			answeredBefore: view.answeredThisGate.length - 1,
		},
		// No tools on a settled poll: lint and peek act on a decision, and this
		// one is made.
		[]
	).map((row) => ({
		...row,
		fired: fired.get(row.id),
		firedKb: faucet.get(row.id),
	}));
	const note = nextNote(view);

	return (
		<PollScreen
			theme={view.gateTheme}
			gate={gateHeaderFor(view)}
			trail={trailFor(view)}
			trailLabel="Polls in this gate"
			question={questionFor(view, answered.question)}
			category={categoryFor(answered.category)}
			code={answered.codeBlock?.split("\n")}
			options={settledOptions(answered)}
			reveal={
				<>
					<Equation
						factors={equationFactors(view, answered)}
						paid={answered.coverageEarned ?? 0}
					/>
					{answered.explanation ? (
						<Text as="p" size="meta" tone="muted">
							{answered.explanation}
						</Text>
					) : null}
				</>
			}
			rail={railFor(view, rows, true)}
			onSubmit={onNext}
			submitLabel={note === undefined ? "Next →" : "Next poll →"}
			submitNote={note}
		/>
	);
};
