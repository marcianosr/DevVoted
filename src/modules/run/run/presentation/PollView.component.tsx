import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
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
import {
	FAUCET_CAP_KB,
	pollDifficultyMultiplier,
} from "~/modules/run/run/domain/rules.model";
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
import { plural } from "~/ui/terminal-theme/format";

const LETTERS = "ABCDEFGH";
const HIDDEN_CATEGORY = "???";

const kb = (value: number) => `${value} KB`;

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
		balance: `${kb(view.storage)} balance`,
		swatches: swatchTrackFor(view),
		gateLabel: `gate ${gate} / ${view.victoryGate}`,
		coverage: coverageFor(view),
	};
};

export const auditNotes = (view: RunView): readonly AuditNote[] =>
	view.audits.map((audit: AuditView) => ({
		code: `${audit.code}`,
		name: audit.name,
		cue: audit.answerCue ?? audit.description,
		suppressed: audit.suppressed,
	}));

const skipNote = (why: SkipReason): string => {
	if (why.kind === "otherCategories")
		return `waits for ${why.categories.map((code) => getCategoryMetadata(code).name).join(", ")}`;
	if (why.kind === "openerOnly") return "fired already";
	if (why.kind === "paysAtGateClear") return "pays on clear";
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
	status: ConfigStatus
): string | undefined => {
	if (status.kind === "offline") return `offline · ${status.audit}`;
	if (status.kind !== "online") return undefined;
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
	if (figure.kind === "kb") return `+${kb(figure.value)}`;
	if (figure.kind === "percent") return `+${figure.value}%`;
	if (figure.kind === "chance") return `1 in ${figure.oneIn}`;
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
};

const statusContextFor = (
	view: RunView,
	poll: PollFacts,
	config: Config
): PollStatusContext => ({
	category: poll.category,
	answeredBefore: poll.answeredBefore,
	suppressingAudit: view.audits.some((audit) => audit.suppressed),
	categoryHidden: view.categoryHidden,
	offlineAudit: view.offlineConfigs.find(
		(offline) => offline.config.id === config.id
	)?.audit,
	faucetRemainingKb: view.faucetRemainingKb,
});

export const buildRows = (
	view: RunView,
	poll: PollFacts,
	tools: readonly Tool[]
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
			detail:
				note === undefined
					? config.description
					: `${config.description} · ${note}`,
			dot: dotFor(status, tool !== undefined),
			figure: rowFigure(config, status),
			meterPercent:
				config.storagePerCorrect === undefined
					? undefined
					: Math.round((view.faucetRemainingKb / FAUCET_CAP_KB) * 100),
			use:
				tool === undefined
					? undefined
					: {
							label: tool.label,
							price: kb(tool.costKb),
							onUse: tool.ready ? tool.onUse : undefined,
						},
		};
	});

export const buildTotalFor = (view: RunView) => ({
	label: "Total",
	value: `×${Math.round(view.perAnswer.coveragePerCorrect * 10) / 10}`,
});

const retryCost = (view: RunView): PollFact | undefined => {
	const { peelSlotsOnFailure, missIsFatal } = view.gateStake;
	if (missIsFatal)
		return {
			label: "Gate retry cost:",
			value: "The run ends here",
			tone: "cinnabar",
		};
	if (peelSlotsOnFailure === 0) return undefined;
	return {
		label: "Gate retry cost:",
		value: `Remove ${plural(peelSlotsOnFailure, "slot")}`,
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
		state: blocked.has(option.id) ? "dimmed" : "idle",
		note: noteFor(option.id),
	}));

	const byLetter = new Map(
		poll.options.map((option, index) => [
			LETTERS[index] ?? `${index + 1}`,
			option.id,
		])
	);

	const rows = buildRows(
		view,
		{ category: poll.category, answeredBefore: view.answeredThisGate.length },
		toolsFor(view, { onLint, onPeek })
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
				meta: `${view.configs.length}`,
				rows,
				total: buildTotalFor(view),
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
