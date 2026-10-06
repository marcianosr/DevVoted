import type {
	AnswerRow,
	PollFormMode,
	PollFormState,
	PollFormView,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import type { PollStep } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { PollStepper } from "~/modules/polls/authoring/presentation/PollStepper.ui";
import {
	POLL_LIMITS,
	type AnswerType,
} from "~/modules/polls/poll/domain/poll.model";
import { SUGGEST_A_POLL } from "~/shared/lib/copy";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Keycap } from "~/ui/kanto-theme/Keycap.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Question, type QuestionProps } from "~/ui/kanto-theme/Question.ui";
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
	subtitle: "Write it, mark what's right, and see it the way players will.",
	question: "Question",
	questionView: "Question view",
	write: "write",
	preview: "preview",
	questionPlaceholder:
		"What does this log? (rhymes welcome, use ```js for code)",
	questionHint: "backticks make code, ```js makes a block",
	answers: "Answers",
	answerType: "Answer type",
	oneRight: "one right",
	severalRight: "several right",
	answer: (index: number) => `answer ${index + 1}`,
	markRight: "mark right",
	markRightHint: (letter: string) => `mark ${letter} right`,
	remove: (letter: string) => `remove ${letter}`,
	removeGlyph: "×",
	addAnswer: "add answer",
	details: "Details",
	category: "category",
	sandbox: "CodeSandbox",
	sandboxNote: "optional",
	sandboxPlaceholder: "https://codesandbox.io/s/…",
	status: "status",
	explanation: "explanation",
	explanationNote: "shown after answering · optional",
	explanationPlaceholder: "Why is the right answer right?",
	suggest: SUGGEST_A_POLL,
	save: "Save poll",
	saveAndNext: "Save & next",
	saveAndFinish: "Save & back to list",
	saving: "Saving…",
} as const;

const THEME: KantoColor = "cerulean";
const ERROR_THEME: KantoColor = "cinnabar";
const QUESTION_ROWS = 6;

const HEAD = "flex w-full flex-col gap-1";
const TITLE_ROW = "flex items-center gap-3";
const MARK = "size-3.5 shrink-0 rounded-xs bg-theme-muted";
const ROWS = "flex w-full flex-col gap-2";
const ROW =
	"flex w-full items-center gap-3 rounded-lg px-3 py-2 ring-1 ring-inset ring-theme-faint";
const ANSWER_TEXT = "min-w-0 flex-1";
const DETAILS = "grid gap-4 sm:grid-cols-2";
const WIDE = "sm:col-span-2";

const VIEWS: readonly SegmentedItem<PollFormView>[] = [
	{ value: "write", label: COPY.write },
	{ value: "preview", label: COPY.preview },
];

const ANSWER_TYPES: readonly SegmentedItem<AnswerType>[] = [
	{ value: "single", label: COPY.oneRight },
	{ value: "multiple", label: COPY.severalRight },
];

const titleOf = (mode: PollFormMode, pollNumber: number | undefined) =>
	mode === "edit" ? COPY.editTitle(pollNumber) : COPY.suggestTitle;

const submitLabelOf = (mode: PollFormMode) =>
	mode === "edit" ? COPY.save : COPY.suggest;

const pressOf = (saving: boolean, onPress: (() => void) | undefined) =>
	saving ? undefined : onPress;

const actionsOf = (
	mode: PollFormMode,
	saving: boolean,
	nextAhead: boolean,
	onSubmit: (() => void) | undefined,
	onSubmitAndNext: (() => void) | undefined
): { action: FooterAction; asides?: readonly FooterAction[] } => {
	const save = {
		label: submitLabelOf(mode),
		onPress: pressOf(saving, onSubmit),
	};
	if (onSubmitAndNext === undefined) return { action: save };
	return {
		action: {
			label: nextAhead ? COPY.saveAndNext : COPY.saveAndFinish,
			onPress: pressOf(
				saving,
				onSubmit === undefined ? undefined : onSubmitAndNext
			),
		},
		asides: [save],
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
		<Keycap letter={row.letter} answerType={answerType} lit={row.right} />
		<span className={ANSWER_TEXT}>
			<TextField
				label={COPY.answer(index)}
				placeholder={COPY.answer(index)}
				value={row.text}
				maxLength={POLL_LIMITS.answer.max}
				onChange={(text) => onChange(row.key, text)}
			/>
		</span>
		<Button
			label={COPY.markRight}
			hint={COPY.markRightHint(row.letter)}
			icon="tick"
			pressed={row.right}
			onPress={() => onMarkRight(row.key)}
		/>
		<Button
			glyph={COPY.removeGlyph}
			label={COPY.remove(row.letter)}
			tone="bare"
			disabled={onRemove === undefined}
			onPress={onRemove === undefined ? undefined : () => onRemove(row.key)}
		/>
	</div>
);

export type PollFormProps = {
	mode: PollFormMode;
	pollNumber?: number;
	state: PollFormState;
	view: PollFormView;
	rows: readonly AnswerRow[];
	questionCount: string;
	answersCount: string;
	preview: QuestionProps;
	categories: readonly SelectOption[];
	statuses?: readonly SelectOption[];
	refusal?: string;
	error?: string;
	saving: boolean;
	listHref?: string;
	step?: PollStep;
	nextAhead?: boolean;
	onQuestion: (question: string) => void;
	onView: (view: PollFormView) => void;
	onAnswerType: (answerType: AnswerType) => void;
	onAnswerChange: (key: number, text: string) => void;
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
	questionCount,
	answersCount,
	preview,
	categories,
	statuses,
	refusal,
	error,
	saving,
	listHref,
	step,
	nextAhead = false,
	onQuestion,
	onView,
	onAnswerType,
	onAnswerChange,
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
	<Screen theme={THEME} ground="bare">
		{listHref === undefined ? null : (
			<PollStepper listHref={listHref} step={step} />
		)}
		<div className={HEAD}>
			<div className={TITLE_ROW}>
				<span aria-hidden className={MARK} />
				<Typography variant="headline" as="h1">
					{titleOf(mode, pollNumber)}
				</Typography>
			</div>
			<Typography variant="hint" as="span">
				{COPY.subtitle}
			</Typography>
		</div>

		<Panel>
			<Panel.Header
				label={COPY.question}
				trailing={
					<Segmented
						label={COPY.questionView}
						items={VIEWS}
						value={view}
						onSelect={onView}
					/>
				}
			/>
			<Panel.Body>
				{view === "write" ? (
					<TextArea
						label={COPY.question}
						placeholder={COPY.questionPlaceholder}
						rows={QUESTION_ROWS}
						maxLength={POLL_LIMITS.question.max}
						value={state.question}
						onChange={onQuestion}
					/>
				) : (
					<Question {...preview} />
				)}
			</Panel.Body>
			<Panel.Footer
				trailing={
					<Typography variant="hint" as="span">
						{questionCount}
					</Typography>
				}
			>
				<Typography variant="hint" as="span">
					{COPY.questionHint}
				</Typography>
			</Panel.Footer>
		</Panel>

		<Panel>
			<Panel.Header
				label={COPY.answers}
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
			</Panel.Body>
			<Panel.Footer>
				<Typography variant="hint" as="span">
					{answersCount}
				</Typography>
			</Panel.Footer>
		</Panel>

		<Panel>
			<Panel.Header label={COPY.details} />
			<Panel.Body>
				<div className={DETAILS}>
					<Select
						label={COPY.category}
						caption="shown"
						options={categories}
						value={state.categoryCode}
						onChange={onCategory}
					/>
					<TextField
						label={COPY.sandbox}
						note={COPY.sandboxNote}
						caption="shown"
						type="url"
						placeholder={COPY.sandboxPlaceholder}
						value={state.codeSandboxExample}
						onChange={onSandbox}
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
					<span className={WIDE}>
						<TextArea
							label={COPY.explanation}
							note={COPY.explanationNote}
							caption="shown"
							placeholder={COPY.explanationPlaceholder}
							maxLength={POLL_LIMITS.explanation.max}
							value={state.explanation}
							onChange={onExplanation}
						/>
					</span>
				</div>
			</Panel.Body>
		</Panel>

		{error === undefined ? null : (
			<span data-screen-theme={ERROR_THEME}>
				<Typography variant="accent">{error}</Typography>
			</span>
		)}

		<ScreenActions
			{...actionsOf(mode, saving, nextAhead, onSubmit, onSubmitAndNext)}
			refusal={refusal}
			note={saving ? COPY.saving : undefined}
		/>
	</Screen>
);
