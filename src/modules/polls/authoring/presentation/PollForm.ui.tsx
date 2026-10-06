import type {
	AnswerRow,
	GridGroupRow,
	PollFormMode,
	PollFormState,
	PollFormView,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
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
import { ScreenActions } from "~/ui/kanto-theme/ScreenFooter.ui";
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
	grid: "grid",
	groupName: (group: number) => `group ${group + 1} name`,
	tile: (letter: string) => `tile ${letter}`,
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
const GROUP =
	"flex w-full flex-col gap-2 rounded-lg p-3 ring-1 ring-inset ring-theme-faint";
const TILES = "grid gap-2 sm:grid-cols-2";
const TILE = "flex items-center gap-3";
const DETAILS = "grid gap-4 sm:grid-cols-2";
const WIDE = "sm:col-span-2";

const VIEWS: readonly SegmentedItem<PollFormView>[] = [
	{ value: "write", label: COPY.write },
	{ value: "preview", label: COPY.preview },
];

const ANSWER_TYPES: readonly SegmentedItem<AnswerType>[] = [
	{ value: "single", label: COPY.oneRight },
	{ value: "multiple", label: COPY.severalRight },
	{ value: "grid", label: COPY.grid },
];

const titleOf = (mode: PollFormMode, pollNumber: number | undefined) =>
	mode === "edit" ? COPY.editTitle(pollNumber) : COPY.suggestTitle;

const submitLabelOf = (mode: PollFormMode) =>
	mode === "edit" ? COPY.save : COPY.suggest;

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
	answersCount: string;
	preview: QuestionProps;
	categories: readonly SelectOption[];
	statuses?: readonly SelectOption[];
	refusal?: string;
	error?: string;
	saving: boolean;
	onQuestion: (question: string) => void;
	onView: (view: PollFormView) => void;
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
};

export const PollForm = ({
	mode,
	pollNumber,
	state,
	view,
	rows,
	groups,
	questionCount,
	answersCount,
	preview,
	categories,
	statuses,
	refusal,
	error,
	saving,
	onQuestion,
	onView,
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
}: PollFormProps) => (
	<Screen theme={THEME} ground="bare">
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
			action={{
				label: submitLabelOf(mode),
				onPress: saving ? undefined : onSubmit,
			}}
			refusal={refusal}
			note={saving ? COPY.saving : undefined}
		/>
	</Screen>
);
