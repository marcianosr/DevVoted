import { useState } from "react";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import {
	configStatusFor,
	type PollStatusContext,
} from "~/modules/run/config/domain/effect.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { pollDifficultyMultiplier } from "~/modules/run/run/domain/rules.model";
import {
	PollScreen,
	type PollOption,
} from "~/ui/modern-theme/screens/PollScreen.ui";
import { toAuditId } from "~/ui/modern-theme/audits";
import { Audits, type AuditRow } from "~/ui/modern-theme/Audits.ui";
import { Coverage } from "~/ui/modern-theme/Coverage.ui";
import { Pipeline, type PipelineRow } from "~/ui/modern-theme/Pipeline.ui";
import { Stake } from "~/ui/modern-theme/Stake.ui";
import type { TrailItem } from "~/ui/modern-theme/Trail.ui";
import { plural } from "~/ui/modern-theme/format";

const trailFor = (view: RunView): readonly TrailItem[] =>
	Array.from({ length: view.pollsPerGate }, (_, index): TrailItem => {
		const label = `${index + 1}`;
		const answered = view.answeredThisGate[index];

		if (answered)
			return { id: label, label, state: "done", verdict: answered.outcome };
		return index === view.answeredThisGate.length
			? { id: label, label, state: "current" }
			: { id: label, label, state: "todo" };
	});

/**
 * A tool that applies but is not ready has exactly one reason: the fee. Both
 * readiness rules are `applies && storage >= fee`, so the row can name the
 * shortfall instead of greying a button out in silence. Same sentence the shop
 * gives a refused offer, since it is the same refusal.
 */
const shortfall = (costKb: number, storageKb: number): string =>
	`Costs ${costKb}KB — you have ${storageKb}KB`;

// The rarity is stated in the row's own colours beside the Dot, so repeating it
// here would only push the version further from the eye that came looking for it.
//
// The shortfall rides here too rather than only in the button's tooltip: a
// disabled button takes no taps, so on a phone the row's own body is the only
// place the reason is reachable.
const summaryFor = (
	config: Config,
	tool: Tool | undefined,
	storageKb: number
): string | undefined => {
	const lines = [
		...(config.level === undefined ? [] : [`v${config.level}`]),
		...(tool === undefined || tool.ready
			? []
			: [shortfall(tool.costKb, storageKb)]),
	];
	return lines.length === 0 ? undefined : lines.join(" · ");
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

const statusContextFor = (
	view: RunView,
	poll: NonNullable<RunView["poll"]>,
	config: Config
): PollStatusContext => ({
	category: poll.category,
	answeredBefore: view.answeredThisGate.length,
	suppressingAudit: view.audits.some((audit) => audit.suppressed),
	offlineAudit: view.offlineConfigs.find(
		(offline) => offline.config.id === config.id
	)?.audit,
	faucetRemainingKb: view.faucetRemainingKb,
});

const pipelineRows = (
	view: RunView,
	poll: NonNullable<RunView["poll"]>,
	tools: readonly Tool[]
): readonly PipelineRow[] =>
	view.configs.map((config): PipelineRow => {
		const status = configStatusFor(
			config,
			statusContextFor(view, poll, config)
		);
		// A config that is not in effect cannot sell what it can no longer do.
		const tool =
			status.kind === "online"
				? tools.find((candidate) => candidate.configId === config.id)
				: undefined;

		return {
			id: config.id,
			label: config.label,
			rarity: rarityOf(config),
			status,
			figure: headlineFigureOf(config),
			remainingKb:
				config.storagePerCorrect === undefined
					? undefined
					: view.faucetRemainingKb,
			summary: summaryFor(config, tool, view.storage),
			explainer: config.description,
			action:
				tool === undefined
					? undefined
					: {
							label: tool.label,
							on: config.label,
							cost: `${tool.costKb} KB`,
							disabled: !tool.ready,
							// Hover on a pointer, and folded into the button's own
							// accessible name; `Tooltip` reads hover off its wrapper so a
							// disabled button still answers for itself.
							hint: tool.ready
								? undefined
								: shortfall(tool.costKb, view.storage),
							onUse: tool.onUse,
						},
		};
	});

// The gate's live rules belong beside the poll they are bending, not only on the
// prep screen the player left two clicks ago.
const auditRows = (view: RunView): readonly AuditRow[] =>
	view.audits.flatMap((audit): readonly AuditRow[] => {
		const id = toAuditId(audit.id);
		return id === null
			? []
			: [{ id, description: audit.description, suppressed: audit.suppressed }];
	});

const railFor = (
	view: RunView,
	poll: NonNullable<RunView["poll"]>,
	handlers: PollTools
) => {
	const audits = auditRows(view);
	const { coverageHeld, coverageDemand, stripsOnFailure, missIsFatal } =
		view.gateStake;

	return (
		<>
			<Coverage
				held={coverageHeld}
				projected={view.perAnswer.coveragePerCorrect}
				required={coverageDemand}
				defaultOpen={false}
			/>
			<Pipeline configs={pipelineRows(view, poll, toolsFor(view, handlers))} />
			{audits.length ? <Audits audits={audits} defaultOpen /> : null}
			<Stake
				removeOnMiss={stripsOnFailure}
				coveragePerWrong={view.gateStake.perAnswer.coveragePerWrong}
				missIsFatal={missIsFatal}
			/>
		</>
	);
};

/** `.length`'s whole effect. Under the Mirror the gate wants the incorrect
 * options, so the count it reveals is a count of those. */
const revealFor = (view: RunView): readonly string[] =>
	view.correctAnswersThisGate === null
		? []
		: [
				`this gate holds ${plural(
					view.correctAnswersThisGate,
					view.mirroredPolls ? "incorrect answer" : "correct answer"
				)}`,
			];

const metaFor = (view: RunView, poll: NonNullable<RunView["poll"]>) => {
	const multiplier = pollDifficultyMultiplier(
		poll.options.length,
		poll.answerType === "multiple"
	);

	return [
		`scores ×${Math.round(multiplier * 100) / 100}`,
		plural(poll.options.length, "option"),
		...(poll.answerType === "multiple" ? ["pick every correct one"] : []),
		...revealFor(view),
	];
};

const categoryFor = (category: CategoryCode) => ({
	label: getCategoryMetadata(category).name,
});

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
	const gate = view.gateStake.gateNumber;
	const blocked = new Set(view.disabledOptionIds);
	// Held here rather than in the run state: folding the rail is a reading
	// preference, not a move, and nothing in the engine should replay it.
	const [railOpen, setRailOpen] = useState(true);

	const noteFor = (optionId: string) => {
		if (blocked.has(optionId)) return "crossed out";
		const share = splitByOptionId?.[optionId];
		return share === undefined ? undefined : `${share}% picked this`;
	};

	const options: readonly PollOption[] = poll.options.map((option) => ({
		id: option.id,
		name: poll.answerType === "multiple" ? option.id : poll.id,
		label: option.label,
		checked: selectedOptionIds.includes(option.id),
		blocked: blocked.has(option.id),
		note: noteFor(option.id),
		noteTone: blocked.has(option.id) ? undefined : "muted",
		onChange: () => onSelect(option.id),
	}));

	return (
		<PollScreen
			theme={view.gateTheme}
			gate={{
				title: `Gate ${gate} · ${swatchForGate(gate)?.gateName ?? ""}`,
				audits: view.audits
					.map((audit) => toAuditId(audit.id))
					.filter((id): id is NonNullable<typeof id> => id !== null),
				storage: {
					plan:
						view.storageBillKb === 0
							? "Free tier"
							: `${view.storageBillKb} KB / gate`,
					used: view.storage,
					cap: view.storageCap,
				},
				track: { gates: ALL_SWATCHES, cleared: view.gatesCleared },
			}}
			trail={trailFor(view)}
			trailLabel="Polls in this gate"
			question={
				view.mirroredPolls
					? `Mirrored — pick every INCORRECT option. ${poll.question}`
					: poll.question
			}
			category={categoryFor(poll.category)}
			meta={metaFor(view, poll)}
			code={poll.codeBlock?.split("\n")}
			options={options}
			rail={railFor(view, poll, { onLint, onPeek })}
			railOpen={railOpen}
			onToggleRail={() => setRailOpen((open) => !open)}
			onSubmit={onSubmit}
			submitLock={selectedOptionIds.length === 0 ? "Pick an answer" : undefined}
		/>
	);
};
