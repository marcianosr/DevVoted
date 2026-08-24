import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	type Config,
	headlineFigureOf,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
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
import { Coverage } from "~/ui/modern-theme/Coverage.ui";
import { Figure } from "~/ui/modern-theme/Figure.ui";
import { Dot } from "~/ui/modern-theme/Dot.ui";
import { Entry } from "~/ui/modern-theme/Entry.ui";
import { Fold, type FoldItem } from "~/ui/modern-theme/Fold.ui";
import { Text } from "~/ui/modern-theme/Text.ui";
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

const rarityWord = (config: Config) => {
	const rarity = rarityOf(config);
	return `${rarity.charAt(0).toUpperCase()}${rarity.slice(1)}`;
};

const summaryFor = (config: Config) =>
	config.level === undefined
		? rarityWord(config)
		: `${rarityWord(config)} · level ${config.level}`;

const OFFLINE = "offline";

type Tool = {
	readonly configId: string;
	readonly label: string;
	readonly costKb: number;
	readonly ready: boolean;
	readonly onUse: () => void;
};

const toolsFor = (view: RunView, handlers: PollTools): readonly Tool[] => [
	...(view.canLint && view.linter
		? [
				{
					configId: view.linter.id,
					label: "cross out",
					costKb: view.lintCost,
					ready: view.lintReady,
					onUse: handlers.onLint,
				},
			]
		: []),
	...(view.canPeek && view.peeker
		? [
				{
					configId: view.peeker.id,
					label: "peek",
					costKb: view.peekCost,
					ready: view.peekReady,
					onUse: handlers.onPeek,
				},
			]
		: []),
];

const pipelineRows = (
	configs: readonly Config[],
	offlineIds: ReadonlySet<string>,
	tools: readonly Tool[]
): readonly FoldItem[] =>
	configs.map((config) => {
		const offline = offlineIds.has(config.id);
		const tool = offline
			? undefined
			: tools.find((candidate) => candidate.configId === config.id);

		const trailing = tool
			? {
					actions: [
						{
							label: tool.label,
							on: config.label,
							cost: `${tool.costKb} KB`,
							disabled: !tool.ready,
							onUse: tool.onUse,
						},
					],
				}
			: {
					value: offline ? (
						<Text size="meta" tone="muted">
							{OFFLINE}
						</Text>
					) : (
						<Figure figure={headlineFigureOf(config)} />
					),
				};

		return {
			id: config.id,
			content: (
				<Entry
					label={config.label}
					rarity={rarityOf(config)}
					mark={offline ? "fail" : "pass"}
					notes={<Dot rarity={rarityOf(config)} />}
					{...trailing}
					summary={summaryFor(config)}
					explainer={config.description}
				/>
			),
		};
	});

const stakeSentence = (view: RunView) => {
	const { stripsOnFailure, missIsFatal } = view.gateStake;
	if (missIsFatal)
		return `A miss removes ${plural(stripsOnFailure, "config")}, which is your whole pipeline. It ends the run.`;
	return `A miss removes ${plural(stripsOnFailure, "config")} and re-runs this gate.`;
};

const railFor = (view: RunView, handlers: PollTools) => {
	const offlineIds = new Set(view.offlineConfigs.map((config) => config.id));
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
			<Fold
				title="Pipeline"
				value={
					<Text size="meta" tone="muted">
						{view.configs.length} / {view.slots}
					</Text>
				}
				items={pipelineRows(view.configs, offlineIds, toolsFor(view, handlers))}
			/>
			<Fold
				title="Stake"
				defaultOpen={false}
				value={
					<Text size="meta" tone={missIsFatal ? "cinnabar" : "muted"}>
						{plural(stripsOnFailure, "config")} on a miss
					</Text>
				}
			>
				<Text size="meta" tone={missIsFatal ? "cinnabar" : "muted"}>
					{stakeSentence(view)}
				</Text>
			</Fold>
		</>
	);
};

const metaFor = (poll: NonNullable<RunView["poll"]>) => {
	const multiplier = pollDifficultyMultiplier(
		poll.options.length,
		poll.answerType === "multiple"
	);

	return [
		`scores ×${Math.round(multiplier * 100) / 100}`,
		plural(poll.options.length, "option"),
		...(poll.answerType === "multiple" ? ["pick every correct one"] : []),
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
			meta={metaFor(poll)}
			code={poll.codeBlock?.split("\n")}
			options={options}
			rail={railFor(view, { onLint, onPeek })}
			onSubmit={onSubmit}
			submitLock={selectedOptionIds.length === 0 ? "Pick an answer" : undefined}
		/>
	);
};
