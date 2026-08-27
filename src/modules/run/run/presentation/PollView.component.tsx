import { type ReactNode, useState } from "react";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import { ConfigFacts } from "~/modules/run/config/presentation/ConfigFacts.ui";
import {
	configStatusFor,
	type PollStatusContext,
} from "~/modules/run/config/domain/effect.model";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
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

export const trailFor = (view: RunView): readonly TrailItem[] =>
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

/**
 * The rail's reading of the shared facts line. The refund is the build's own,
 * not the list price: Freemium's discount and WTFPL's no-warranty clause both
 * move it, and a rail quoting list would be quoting a number the shop will not
 * honour.
 *
 * The shortfall rides here too rather than only in the button's tooltip: a
 * disabled button takes no taps, so on a phone the row's own body is the only
 * place the reason is reachable.
 */
const factsFor = (
	view: RunView,
	config: Config,
	tool: Tool | undefined
): ReactNode => (
	<ConfigFacts
		config={config}
		refundKb={sellRefundIn(view.configs, config)}
		note={
			tool === undefined || tool.ready
				? undefined
				: shortfall(tool.costKb, view.storage)
		}
	/>
);

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

/**
 * The slice of a poll the rail statuses read. The reveal passes the answered
 * poll's facts (its category, and the count *before* it landed, so an
 * opener-only config still reads online on the first poll's reveal); the live
 * poll passes its own.
 */
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
	offlineAudit: view.offlineConfigs.find(
		(offline) => offline.config.id === config.id
	)?.audit,
	faucetRemainingKb: view.faucetRemainingKb,
});

export const pipelineRows = (
	view: RunView,
	poll: PollFacts,
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
			summary: factsFor(view, config, tool),
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

export const railFor = (
	view: RunView,
	rows: readonly PipelineRow[],
	settled = false
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
			<Pipeline configs={rows} settled={settled} />
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

export const categoryFor = (category: CategoryCode) => ({
	label: getCategoryMetadata(category).name,
});

export const questionFor = (view: RunView, question: string): string =>
	view.mirroredPolls
		? `Mirrored — pick every INCORRECT option. ${question}`
		: question;

export const gateHeaderFor = (view: RunView) => {
	const gate = view.gateStake.gateNumber;
	return {
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
	};
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

	const rows = pipelineRows(
		view,
		{ category: poll.category, answeredBefore: view.answeredThisGate.length },
		toolsFor(view, { onLint, onPeek })
	);

	return (
		<PollScreen
			theme={view.gateTheme}
			gate={gateHeaderFor(view)}
			trail={trailFor(view)}
			trailLabel="Polls in this gate"
			question={questionFor(view, poll.question)}
			category={categoryFor(poll.category)}
			meta={metaFor(view, poll)}
			code={poll.codeBlock?.split("\n")}
			options={options}
			rail={railFor(view, rows)}
			railOpen={railOpen}
			onToggleRail={() => setRailOpen((open) => !open)}
			onSubmit={onSubmit}
			submitLock={selectedOptionIds.length === 0 ? "Pick an answer" : undefined}
		/>
	);
};
