import { kbLabel } from "~/shared/lib/storage";
import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	abArmLabel,
	type Config,
	describeConfig,
	headlineFigureOf,
	otherArmOf,
	slotsOf,
	type ConfigFigure,
} from "~/modules/run/config/domain/config.model";
import {
	configStatusFor,
	type ConfigStatus,
	type PollStatusContext,
	type SkipReason,
} from "~/modules/run/config/domain/effect.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { coverageForAnswer } from "~/modules/run/build/domain/build.model";
import {
	FAUCET_CAP_KB,
	gateBaseMultiplier,
	pollDifficultyMultiplier,
} from "~/modules/run/run/domain/rules.model";
import { cachedHitsFor } from "~/modules/run/run/domain/runPoll.model";
import type {
	PollChoice,
	PollFact,
} from "~/ui/terminal-theme/screens/PollScreen.ui";
import { PollScreen } from "~/ui/terminal-theme/screens/PollScreen.ui";
import type { AuditNote } from "~/ui/terminal-theme/Audits.ui";
import type { BuildListRow } from "~/ui/terminal-theme/BuildList.ui";
import type { DotVariant } from "~/ui/terminal-theme/Dot.ui";
import type { RunHeaderProps } from "~/ui/terminal-theme/RunHeader.ui";
import type { TrackSwatch } from "~/ui/terminal-theme/SwatchTrack.ui";
import type { TrailProps } from "~/ui/terminal-theme/Trail.ui";
import { countRange, plural } from "~/ui/terminal-theme/format";

const LETTERS = "ABCDEFGH";
const HIDDEN_CATEGORY = "???";

export const trailFor = (view: RunView): TrailProps => ({
	count: view.pollsPerGate,
	current: view.answeredThisGate.length + 1,
	verdicts: view.answeredThisGate.map((poll) => poll.outcome),
});

export const swatchTrackFor = (view: RunView): readonly TrackSwatch[] =>
	Array.from({ length: view.victoryGate + 1 }, (_, gate) => {
		if (gate < view.gatesCleared) {
			return { theme: swatchForGate(gate)?.theme, state: "earned" as const };
		}
		if (gate === view.gatesCleared) {
			return { theme: swatchForGate(gate)?.theme, state: "current" as const };
		}
		return { state: "locked" as const };
	});

export const runHeaderFor = (view: RunView): RunHeaderProps => {
	const gate = view.gateStake.gateNumber;

	return {
		title: `Gate ${gate} · ${swatchForGate(gate)?.gateName ?? ""}`,
		swatch: view.gateTheme,
		balance: `${kbLabel(view.storage)} balance`,
		gauge: storageGaugeFor(view),
		swatches: swatchTrackFor(view),
		gateLabel: `gate ${gate} / ${view.victoryGate}`,
		coverage: coverageFor(view),
	};
};

const offlineCue = (view: RunView, audit: AuditView): string | undefined => {
	const names = view.offlineConfigs
		.filter((offline) => offline.audit === `${audit.code} ${audit.name}`)
		.map((offline) => offline.config.label);

	if (names.length === 0) return undefined;
	return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} offline this gate.`;
};

export const chipOf = (
	config: Config
): NonNullable<AuditNote["suppressedBy"]> => ({
	label: config.label,
	slots: slotsOf(config),
	version: config.level ?? 1,
});

export const auditNotes = (view: RunView): readonly AuditNote[] =>
	view.audits.map((audit: AuditView) => ({
		code: `${audit.code}`,
		name: audit.name,
		cue: offlineCue(view, audit) ?? audit.answerCue ?? audit.description,
		suppressed: audit.suppressed,
		suppressedBy:
			audit.suppressedBy === undefined ? undefined : chipOf(audit.suppressedBy),
	}));

const skipNote = (why: SkipReason): string => {
	if (why.kind === "otherCategories")
		return `waits for ${why.categories.map((code) => getCategoryMetadata(code).name).join(", ")}`;
	if (why.kind === "openerOnly") return "fired already";
	if (why.kind === "cacheCold") return "cache is cold here";
	if (why.kind === "paysAtGateClear") return "pays on clear";
	if (why.kind === "paysOnPeel") return "pays on a peel";
	if (why.kind === "billsAtGateClear") return "bills on clear";
	if (why.kind === "inShop") return "works in the shop";
	if (why.kind === "noAuditToSuppress") return "no audit to suppress";
	if (why.kind === "runCapReached") return "the run's cap is spent";
	return "not this poll";
};

const statusNote = (status: ConfigStatus): string | undefined => {
	if (status.kind === "online") return undefined;
	if (status.kind === "unknown") return "category hidden";
	if (status.kind === "offline") return `offline · ${status.audit}`;
	return skipNote(status.why);
};

const rowFigure = (
	config: Config,
	status: ConfigStatus,
	autoUpgradeRemaining: number | null
): string | undefined => {
	if (status.kind === "offline") return "offline";
	if (status.kind !== "online") return undefined;
	if (config.autoUpgradeAfterCorrect !== undefined && autoUpgradeRemaining)
		return `in ${autoUpgradeRemaining}`;
	return figureLabel(headlineFigureOf(config));
};

const dotFor = (status: ConfigStatus, hasTool: boolean): DotVariant => {
	if (status.kind === "offline") return "blocked";
	if (hasTool) return "action";
	return status.kind === "online" ? "on" : "off";
};

const figureLabel = (figure: ConfigFigure | undefined): string | undefined => {
	if (figure === undefined) return undefined;
	if (figure.kind === "multiplier") return `×${figure.value}`;
	if (figure.kind === "kb") return `+${kbLabel(figure.value)}`;
	if (figure.kind === "percent") return `+${figure.value}%`;
	return `${figure.value > 0 ? "+" : ""}${figure.value}`;
};

type Tool = {
	readonly configId: string;
	readonly label: string;
	readonly costKb: number;
	readonly ready: boolean;
	readonly onUse: () => void;
};

const toolsFor = (view: RunView, handlers: PollTools): readonly Tool[] => [
	...(view.paidActions.canLint && view.paidActions.linter
		? [
				{
					configId: view.paidActions.linter.id,
					label: "cross out",
					costKb: view.paidActions.lintCost,
					ready: view.paidActions.lintReady,
					onUse: handlers.onLint,
				},
			]
		: []),
	...(view.paidActions.canPeek && view.paidActions.peeker
		? [
				{
					configId: view.paidActions.peeker.id,
					label: "peek",
					costKb: view.paidActions.peekCost,
					ready: view.paidActions.peekReady,
					onUse: handlers.onPeek,
				},
			]
		: []),
];

export type PollFacts = {
	readonly category: CategoryCode;
	readonly answeredBefore: number;
	readonly cachedHits: number;
};

const statusContextFor = (
	view: RunView,
	poll: PollFacts,
	config: Config
): PollStatusContext => ({
	category: poll.category,
	answeredBefore: poll.answeredBefore,
	cachedHits: poll.cachedHits,
	suppressingAudit: view.audits.some((audit) => audit.suppressed),
	categoryHidden: view.categoryHidden,
	offlineAudit: view.offlineConfigs.find(
		(offline) => offline.config.id === config.id
	)?.audit,
	faucetRemainingKb: view.faucetRemainingKb,
});

const swapFor = (
	config: Config,
	onSwitchArm: ((configId: string) => void) | undefined
): BuildListRow["swap"] => {
	const other = otherArmOf(config);
	if (other === undefined || onSwitchArm === undefined) return undefined;

	return {
		label: `Switch to arm ${abArmLabel(other)}`,
		onUse: () => onSwitchArm(config.id),
	};
};

export const buildRows = (
	view: RunView,
	poll: PollFacts,
	tools: readonly Tool[],
	onSwitchArm?: (configId: string) => void
): readonly BuildListRow[] =>
	view.configs.map((config): BuildListRow => {
		const status = configStatusFor(
			config,
			statusContextFor(view, poll, config)
		);
		const tool =
			status.kind === "offline"
				? undefined
				: tools.find((candidate) => candidate.configId === config.id);
		const note = statusNote(status);

		return {
			name: config.label,
			slots: slotsOf(config),
			version: config.level ?? 1,
			detail:
				note === undefined
					? describeConfig(config)
					: `${describeConfig(config)} · ${note}`,
			swap: swapFor(config, onSwitchArm),
			dot: dotFor(status, tool !== undefined),
			figure: rowFigure(config, status, view.autoUpgradeRemaining),
			meterPercent:
				config.storagePerCorrect === undefined
					? undefined
					: Math.round((view.faucetRemainingKb / FAUCET_CAP_KB) * 100),
			use:
				tool === undefined
					? undefined
					: {
							label: tool.label,
							price: kbLabel(tool.costKb),
							onUse: tool.ready ? tool.onUse : undefined,
						},
		};
	});

const liveConfigsIn = (view: RunView): readonly Config[] =>
	view.configs.filter(
		(config) =>
			!view.offlineConfigs.some((offline) => offline.config.id === config.id)
	);

// Routed through the same function the scorer uses rather than through
// `perAnswer`, which is a context-free forecast: it reads coverageMultiplier
// and coverageAdd only, so every conditional config (opener, focus, cache) was
// invisible to it and the panel could print ×1 above a row reading ×2.
export const buildTotalFor = (view: RunView, poll: PollFacts) => ({
	label: "Total",
	value: `×${coverageForAnswer(
		liveConfigsIn(view),
		poll,
		gateBaseMultiplier(view.gatesCleared)
	)}`,
});

const retryCost = (view: RunView): PollFact | undefined => {
	const { peelSlotsOnFailure, peelConfigsOnFailure, missIsFatal } =
		view.gateStake;
	if (missIsFatal)
		return {
			label: "Gate retry cost:",
			value: "The run ends here",
			tone: "cinnabar",
		};
	if (peelSlotsOnFailure === 0) return undefined;
	return {
		label: "Gate retry cost:",
		value: `Remove ${countRange(
			peelConfigsOnFailure.fewest,
			peelConfigsOnFailure.most,
			"config"
		)}`,
		hint: `${plural(peelSlotsOnFailure, "slot")} of configs — drop them or minify them, your pick`,
		tone: "cinnabar",
	};
};

export const coverageFor = (view: RunView) => {
	const { coverageHeld, coverageDemand } = view.gateStake;

	return {
		label: "Coverage",
		reading: `${Math.round(coverageHeld * 10) / 10} / ${coverageDemand}%`,
		percent:
			coverageDemand === 0
				? 0
				: Math.min(100, Math.round((coverageHeld / coverageDemand) * 100)),
	};
};

export const storageGaugeFor = (view: RunView) => ({
	label: `${kbLabel(view.storage)} of ${kbLabel(view.storagePlan.capKb)} cap`,
	percent:
		view.storagePlan.capKb === 0
			? 0
			: Math.round((view.storage / view.storagePlan.capKb) * 100),
});

export const categoryFor = (category: CategoryCode, hidden = false) =>
	hidden ? HIDDEN_CATEGORY : getCategoryMetadata(category).name;

export const questionFor = (view: RunView, question: string): string =>
	view.mirroredPolls
		? `Mirrored — pick every INCORRECT option. ${question}`
		: question;

const factsFor = (
	view: RunView,
	poll: NonNullable<RunView["poll"]>
): readonly PollFact[] => {
	const multiplier = pollDifficultyMultiplier(
		poll.options.length,
		poll.answerType === "multiple"
	);
	const wrong = Math.abs(view.gateStake.perAnswer.coveragePerWrong);
	const retry = retryCost(view);

	return [
		{
			label: "scores",
			value: `×${Math.round(multiplier * 100) / 100}`,
			tone: "celadon",
		},
		{ label: plural(poll.options.length, "option") },
		...(poll.answerType === "multiple"
			? [{ label: "pick every correct one" }]
			: []),
		...(view.correctAnswersThisGate === null
			? []
			: [
					{
						label: `this gate holds ${plural(
							view.correctAnswersThisGate,
							view.mirroredPolls ? "incorrect answer" : "correct answer"
						)}`,
						value: view.correctCountSource ?? undefined,
					},
				]),
		...(wrong === 0
			? []
			: [
					{
						label: "wrong costs",
						value: `${wrong}`,
						tone: "cinnabar" as const,
					},
				]),
		...(retry === undefined ? [] : [retry]),
	];
};

export type PollTools = {
	onLint: () => void;
	onPeek: () => void;
	onSwitchArm?: (configId: string) => void;
};

export type PollViewProps = {
	view: RunView;
	poll: NonNullable<RunView["poll"]>;
	selectedOptionIds: readonly string[];
	splitByOptionId?: Readonly<Record<string, number>>;
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
} & PollTools;

export const PollView = ({
	view,
	poll,
	selectedOptionIds,
	splitByOptionId,
	onSelect,
	onSubmit,
	onLint,
	onPeek,
	onSwitchArm,
}: PollViewProps) => {
	const blocked = new Set(view.disabledOptionIds);

	const noteFor = (optionId: string) => {
		if (blocked.has(optionId)) return "crossed out";
		const share = splitByOptionId?.[optionId];
		return share === undefined ? undefined : `${share}% picked this`;
	};

	const choices: readonly PollChoice[] = poll.options.map((option, index) => ({
		letter: LETTERS[index] ?? `${index + 1}`,
		label: option.label,
		selected: selectedOptionIds.includes(option.id),
		state: blocked.has(option.id) ? "crossedOut" : "idle",
		note: noteFor(option.id),
	}));

	const byLetter = new Map(
		poll.options.map((option, index) => [
			LETTERS[index] ?? `${index + 1}`,
			option.id,
		])
	);

	const facts: PollFacts = {
		category: poll.category,
		answeredBefore: view.answeredThisGate.length,
		cachedHits: cachedHitsFor(view.allAnswered, poll.category),
	};

	const rows = buildRows(
		view,
		facts,
		toolsFor(view, { onLint, onPeek }),
		onSwitchArm
	);

	return (
		<PollScreen
			theme={view.gateTheme}
			run={runHeaderFor(view)}
			trail={trailFor(view)}
			category={categoryFor(poll.category, view.categoryHidden)}
			question={questionFor(view, poll.question)}
			facts={factsFor(view, poll)}
			code={poll.codeBlock?.split("\n")}
			audits={auditNotes(view)}
			byline={poll.author === undefined ? undefined : { author: poll.author }}
			build={{
				running: rows.filter((row) => row.dot === "on").length,
				rows,
				total: buildTotalFor(view, facts),
			}}
			choices={choices}
			onToggle={(letter) => {
				const optionId = byLetter.get(letter);
				if (optionId !== undefined) onSelect(optionId);
			}}
			submitLabel="Submit answer"
			submitLock={selectedOptionIds.length === 0 ? "Pick an answer" : undefined}
			onSubmit={onSubmit}
		/>
	);
};
