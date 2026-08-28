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

const shortfall = (costKb: number, storageKb: number): string =>
	`Costs ${costKb}KB — you have ${storageKb}KB`;

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
							hint: tool.ready
								? undefined
								: shortfall(tool.costKb, view.storage),
							onUse: tool.onUse,
						},
		};
	});

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
	const { coverageHeld, coverageDemand, peelSpotsOnFailure, missIsFatal } =
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
				removeOnMiss={peelSpotsOnFailure}
				coveragePerWrong={view.gateStake.perAnswer.coveragePerWrong}
				missIsFatal={missIsFatal}
			/>
		</>
	);
};

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
		storage: { balanceKb: view.storage },
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
