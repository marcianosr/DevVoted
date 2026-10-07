import type {
	AnswerRow,
	GridGroupRow,
	PollFormMode,
	PollFormState,
	PollFormSteps,
	PollFormView,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import type { PollStep } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { PollStepper } from "~/modules/polls/authoring/presentation/PollStepper.ui";
import {
	POLL_LIMITS,
	type AnswerType,
} from "~/modules/polls/poll/domain/poll.model";
import { SUGGEST_A_POLL } from "~/shared/lib/copy";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Keycap } from "~/ui/kanto-theme/Keycap.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Link } from "~/ui/kanto-theme/Link.ui";
import {
	CodeSpans,
	Question,
	questionFactsOf,
	type QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import {
	ScreenActions,
	type FooterAction,
} from "~/ui/kanto-theme/ScreenFooter.ui";
import { Segmented, type SegmentedItem } from "~/ui/kanto-theme/Segmented.ui";
import { Select, type SelectOption } from "~/ui/kanto-theme/Select.ui";
import { TextArea } from "~/ui/kanto-theme/TextArea.ui";
import { TextField } from "~/ui/kanto-theme/TextField.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	suggestTitle: SUGGEST_A_POLL,
	editTitle: (pollNumber: number | undefined) =>
		pollNumber === undefined ? "Edit poll" : `Edit poll #${pollNumber}`,
	subtitle: "Write it, tap the right answer, see it the way players will.",
	reward: (reward: string) => `${reward} when approved`,
	question: "Question",
	questionPlaceholder: "What does this log?",
	inlineCode: "`code`",
	codeBlock: "```js block",
	answers: "Answers",
	answerType: "Answer type",
	oneRight: "one right",
	severalRight: "several right",
	grid: "grid",
	groupName: (group: number) => `group ${group + 1} name`,
	tile: (letter: string) => `tile ${letter}`,
	answer: (index: number) => `answer ${index + 1}`,
	markRightHint: (letter: string) => `mark ${letter} right`,
	remove: (letter: string) => `remove ${letter}`,
	removeGlyph: "×",
	addAnswer: "add answer",
	category: "Category",
	pickOne: "pick one",
	pickCategory: "pick a category",
	status: "status",
	explainIt: "Explain it",
	optional: "optional",
	explanation: "explanation, shown after answering",
	explanationPlaceholder: "Why is the right answer right?",
	sandbox: "CodeSandbox link",
	sandboxPlaceholder: "https://codesandbox.io/s/…",
	suggest: SUGGEST_A_POLL,
	save: "Save poll",
	saveAndNext: "Save & next",
	saveAndFinish: "Save & back to list",
	saving: "Saving…",
	preview: "Preview",
	edit: "Edit",
	noCategory: "no category",
	lockIn: "Lock in",
	explanationHeading: "Explanation",
	sandboxLink: "Open in CodeSandbox",
} as const;

const THEME = {
	suggest: "pallet",
	edit: "cerulean",
} satisfies Record<PollFormMode, KantoColor>;
const ERROR_THEME: KantoColor = "cinnabar";
const REWARD_COLOR: KantoColor = "viridian";
const QUESTION_ROWS = 6;
const EXPLANATION_ROWS = 3;

const HEAD = "flex w-full flex-wrap items-start justify-between gap-3";
const HEAD_TEXT = "flex flex-col gap-1";
const ROWS = "flex w-full flex-col gap-2";
const ROW = "flex w-full items-center gap-3";
const LETTER = "cursor-pointer rounded-full";
const ANSWER_TEXT = "min-w-0 flex-1";
const GROUP =
	"flex w-full flex-col gap-2 rounded-lg p-3 ring-1 ring-inset ring-theme-faint";
const TILES = "grid gap-2 sm:grid-cols-2";
const TILE = "flex items-center gap-3";
const SNIPPETS = "flex flex-wrap gap-2";
const FIELDS = "flex flex-col gap-4";
const PREVIEW_META =
	"flex flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3";
const EXPLANATION =
	"flex w-full flex-col gap-1.5 rounded-lg border border-theme-faint px-4 py-3";

const ANSWER_TYPES: readonly SegmentedItem<AnswerType>[] = [
	{ value: "single", label: COPY.oneRight },
	{ value: "multiple", label: COPY.severalRight },
	{ value: "grid", label: COPY.grid },
];

const titleOf = (mode: PollFormMode, pollNumber: number | undefined) =>
	mode === "edit" ? COPY.editTitle(pollNumber) : COPY.suggestTitle;

const submitLabelOf = (mode: PollFormMode) =>
	mode === "edit" ? COPY.save : COPY.suggest;

const pressOf = (saving: boolean, onPress: (() => void) | undefined) =>
	saving ? undefined : onPress;

type FooterPresses = {
	mode: PollFormMode;
	saving: boolean;
	nextAhead: boolean;
	refusal: string | undefined;
	preview: FooterAction;
	onSubmit: (() => void) | undefined;
	onSubmitAndNext: (() => void) | undefined;
};

const actionsOf = ({
	mode,
	saving,
	nextAhead,
	refusal,
	preview,
	onSubmit,
	onSubmitAndNext,
}: FooterPresses): {
	action: FooterAction;
	asides: readonly FooterAction[];
} => {
	const save = {
		label: submitLabelOf(mode),
		onPress: pressOf(saving, onSubmit),
	};
	if (onSubmitAndNext === undefined)
		return {
			action: { ...save, label: refusal ?? save.label },
			asides: [preview],
		};
	return {
		action: {
			label: refusal ?? (nextAhead ? COPY.saveAndNext : COPY.saveAndFinish),
			onPress: pressOf(
				saving,
				onSubmit === undefined ? undefined : onSubmitAndNext
			),
		},
		asides: [preview, save],
	};
};

type AnswerProps = {
	row: AnswerRow;
	index: number;
	answerType: AnswerType;
	onChange: (key: number, text: string) => void;
	onMarkRight: (key: number) => void;
	onRemove?: (key: number) => void;
};

const Answer = ({
	row,
	index,
	answerType,
	onChange,
	onMarkRight,
	onRemove,
}: AnswerProps) => (
	<div className={ROW}>
		<button
			type="button"
			aria-pressed={row.right}
			aria-label={COPY.markRightHint(row.letter)}
			onClick={() => onMarkRight(row.key)}
			className={LETTER}
		>
			<Keycap letter={row.letter} answerType={answerType} lit={row.right} />
		</button>
		<span className={ANSWER_TEXT}>
			<TextField
				label={COPY.answer(index)}
				placeholder={COPY.answer(index)}
				value={row.text}
				maxLength={POLL_LIMITS.answer.max}
				size="lg"
				onChange={(text) => onChange(row.key, text)}
			/>
		</span>
		<Button
			glyph={COPY.removeGlyph}
			label={COPY.remove(row.letter)}
			tone="bare"
			disabled={onRemove === undefined}
			onPress={onRemove === undefined ? undefined : () => onRemove(row.key)}
		/>
	</div>
);

type PollPreviewProps = {
	preview: QuestionProps;
	category: string | undefined;
	explanation: string;
	sandbox: string;
	revealed: boolean;
	onPick: (id: string) => void;
	onLockIn?: () => void;
};

const Reveal = ({
	explanation,
	sandbox,
}: Pick<PollPreviewProps, "explanation" | "sandbox">) => (
	<>
		{explanation.trim() === "" ? null : (
			<div className={EXPLANATION}>
				<Typography variant="label" as="span">
					{COPY.explanationHeading}
				</Typography>
				<Typography variant="caption" as="p">
					<CodeSpans text={explanation} />
				</Typography>
			</div>
		)}
		{sandbox.trim() === "" ? null : (
			<Link href={sandbox} external>
				{COPY.sandboxLink}
			</Link>
		)}
	</>
);

const PollPreview = ({
	preview,
	category,
	explanation,
	sandbox,
	revealed,
	onPick,
	onLockIn,
}: PollPreviewProps) => (
	<Panel>
		<div className={PREVIEW_META}>
			<Badge>{category ?? COPY.noCategory}</Badge>
			<Typography variant="hint" as="span">
				{questionFactsOf(preview)}
			</Typography>
		</div>
		<Panel.Body>
			<Question {...preview} onPick={revealed ? undefined : onPick} />
			{onLockIn === undefined ? null : (
				<Button label={COPY.lockIn} size="md" onPress={onLockIn} />
			)}
			{revealed ? <Reveal explanation={explanation} sandbox={sandbox} /> : null}
		</Panel.Body>
	</Panel>
);

type GridGroupProps = {
	group: GridGroupRow;
	onLabel: (group: number, label: string) => void;
	onTile: (key: number, text: string) => void;
};

const GridGroup = ({ group, onLabel, onTile }: GridGroupProps) => (
	<div className={GROUP}>
		<TextField
			label={COPY.groupName(group.group)}
			placeholder={group.placeholder}
			value={group.label}
			maxLength={POLL_LIMITS.answer.max}
			onChange={(label) => onLabel(group.group, label)}
		/>
		<div className={TILES}>
			{group.tiles.map((tile) => (
				<span key={tile.key} className={TILE}>
					<Keycap letter={tile.letter} answerType="grid" />
					<span className={ANSWER_TEXT}>
						<TextField
							label={COPY.tile(tile.letter)}
							placeholder={COPY.tile(tile.letter)}
							value={tile.text}
							maxLength={POLL_LIMITS.answer.max}
							onChange={(text) => onTile(tile.key, text)}
						/>
					</span>
				</span>
			))}
		</div>
	</div>
);

type AnswerListProps = Pick<
	PollFormProps,
	| "state"
	| "rows"
	| "onAnswerChange"
	| "onMarkRight"
	| "onAddAnswer"
	| "onRemoveAnswer"
>;

const AnswerList = ({
	state,
	rows,
	onAnswerChange,
	onMarkRight,
	onAddAnswer,
	onRemoveAnswer,
}: AnswerListProps) => (
	<>
		<div className={ROWS}>
			{rows.map((row, index) => (
				<Answer
					key={row.key}
					row={row}
					index={index}
					answerType={state.answerType}
					onChange={onAnswerChange}
					onMarkRight={onMarkRight}
					onRemove={onRemoveAnswer}
				/>
			))}
		</div>
		<Button
			label={COPY.addAnswer}
			tone="slot"
			icon="plus"
			iconAt="lead"
			disabled={onAddAnswer === undefined}
			onPress={onAddAnswer}
		/>
	</>
);

export type PollFormProps = {
	mode: PollFormMode;
	pollNumber?: number;
	state: PollFormState;
	view: PollFormView;
	rows: readonly AnswerRow[];
	groups?: readonly GridGroupRow[];
	questionCount: string;
	steps: PollFormSteps;
	preview: QuestionProps;
	previewCategory?: string;
	revealed: boolean;
	categories: readonly SelectOption[];
	statuses?: readonly SelectOption[];
	reward?: string;
	refusal?: string;
	error?: string;
	saving: boolean;
	listHref?: string;
	step?: PollStep;
	nextAhead?: boolean;
	onQuestion: (question: string) => void;
	onInlineCode: () => void;
	onCodeBlock: () => void;
	onView: (view: PollFormView) => void;
	onPreviewPick: (id: string) => void;
	onLockIn?: () => void;
	onAnswerType: (answerType: AnswerType) => void;
	onAnswerChange: (key: number, text: string) => void;
	onGroupLabel: (group: number, label: string) => void;
	onMarkRight: (key: number) => void;
	onAddAnswer?: () => void;
	onRemoveAnswer?: (key: number) => void;
	onCategory: (value: string) => void;
	onStatus: (value: string) => void;
	onSandbox: (value: string) => void;
	onExplanation: (value: string) => void;
	onSubmit?: () => void;
	onSubmitAndNext?: () => void;
};

export const PollForm = ({
	mode,
	pollNumber,
	state,
	view,
	rows,
	groups,
	questionCount,
	steps,
	preview,
	previewCategory,
	revealed,
	categories,
	statuses,
	reward,
	refusal,
	error,
	saving,
	listHref,
	step,
	nextAhead = false,
	onQuestion,
	onInlineCode,
	onCodeBlock,
	onView,
	onPreviewPick,
	onLockIn,
	onAnswerType,
	onAnswerChange,
	onGroupLabel,
	onMarkRight,
	onAddAnswer,
	onRemoveAnswer,
	onCategory,
	onStatus,
	onSandbox,
	onExplanation,
	onSubmit,
	onSubmitAndNext,
}: PollFormProps) => (
	<Screen theme={THEME[mode]} ground="bare">
		{listHref === undefined ? null : (
			<PollStepper listHref={listHref} step={step} />
		)}
		<div className={HEAD}>
			<div className={HEAD_TEXT}>
				<Typography variant="headline" as="h1">
					{titleOf(mode, pollNumber)}
				</Typography>
				<Typography variant="hint" as="span">
					{COPY.subtitle}
				</Typography>
			</div>
			{reward === undefined ? null : (
				<Badge color={REWARD_COLOR}>{COPY.reward(reward)}</Badge>
			)}
		</div>

		{view === "write" ? (
			<>
				<Panel>
					<Panel.Header
						label={COPY.question}
						step={{ number: 1, done: steps.question }}
					/>
					<Panel.Body>
						<TextArea
							label={COPY.question}
							placeholder={COPY.questionPlaceholder}
							rows={QUESTION_ROWS}
							maxLength={POLL_LIMITS.question.max}
							value={state.question}
							onChange={onQuestion}
						/>
					</Panel.Body>
					<Panel.Footer
						trailing={
							<Typography variant="hint" as="span">
								{questionCount}
							</Typography>
						}
					>
						<span className={SNIPPETS}>
							<Button label={COPY.inlineCode} onPress={onInlineCode} />
							<Button label={COPY.codeBlock} onPress={onCodeBlock} />
						</span>
					</Panel.Footer>
				</Panel>

				<Panel>
					<Panel.Header
						label={COPY.answers}
						step={{ number: 2, done: steps.answers }}
						trailing={
							<Segmented
								label={COPY.answerType}
								items={ANSWER_TYPES}
								value={state.answerType}
								onSelect={onAnswerType}
							/>
						}
					/>
					<Panel.Body>
						{groups === undefined ? (
							<AnswerList
								state={state}
								rows={rows}
								onAnswerChange={onAnswerChange}
								onMarkRight={onMarkRight}
								onAddAnswer={onAddAnswer}
								onRemoveAnswer={onRemoveAnswer}
							/>
						) : (
							<div className={ROWS}>
								{groups.map((group) => (
									<GridGroup
										key={group.group}
										group={group}
										onLabel={onGroupLabel}
										onTile={onAnswerChange}
									/>
								))}
							</div>
						)}
					</Panel.Body>
				</Panel>

				<Panel>
					<Panel.Header
						label={COPY.category}
						step={{ number: 3, done: steps.category }}
						meta={COPY.pickOne}
					/>
					<Panel.Body>
						<Select
							label={COPY.category}
							placeholder={COPY.pickCategory}
							options={categories}
							value={state.categoryCode ?? ""}
							onChange={onCategory}
						/>
						{statuses === undefined ? null : (
							<Select
								label={COPY.status}
								caption="shown"
								options={statuses}
								value={state.status}
								onChange={onStatus}
							/>
						)}
					</Panel.Body>
				</Panel>

				<Panel>
					<Panel.Header
						label={COPY.explainIt}
						step={{ number: 4, done: steps.explanation }}
						meta={COPY.optional}
					/>
					<Panel.Body>
						<div className={FIELDS}>
							<TextArea
								label={COPY.explanation}
								caption="shown"
								placeholder={COPY.explanationPlaceholder}
								rows={EXPLANATION_ROWS}
								maxLength={POLL_LIMITS.explanation.max}
								value={state.explanation}
								onChange={onExplanation}
							/>
							<TextField
								label={COPY.sandbox}
								caption="shown"
								type="url"
								placeholder={COPY.sandboxPlaceholder}
								value={state.codeSandboxExample}
								onChange={onSandbox}
							/>
						</div>
					</Panel.Body>
				</Panel>
			</>
		) : (
			<PollPreview
				preview={preview}
				category={previewCategory}
				explanation={state.explanation}
				sandbox={state.codeSandboxExample}
				revealed={revealed}
				onPick={onPreviewPick}
				onLockIn={onLockIn}
			/>
		)}

		{error === undefined ? null : (
			<span data-screen-theme={ERROR_THEME}>
				<Typography variant="accent">{error}</Typography>
			</span>
		)}

		<ScreenActions
			{...actionsOf({
				mode,
				saving,
				nextAhead,
				refusal,
				preview: {
					label: view === "write" ? COPY.preview : COPY.edit,
					onPress: () => onView(view === "write" ? "preview" : "write"),
				},
				onSubmit,
				onSubmitAndNext,
			})}
			note={saving ? COPY.saving : undefined}
		/>
	</Screen>
);
