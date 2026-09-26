import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import type {
	AnswerType,
	PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import {
	CATEGORY_CODES,
	getCategoryMetadata,
	type CategoryCode,
} from "~/shared/lib/categories";

const COPY = {
	question: "Question (supports markdown & code blocks)",
	edit: "Edit",
	preview: "Preview",
	noQuestion: "*No question yet*",
	questionPlaceholder:
		"Enter your question here, preferred in rhyme. Use ```lang for code blocks",
	category: "Category",
	answerType: "Answer Type",
	single: "Single answer",
	multiple: "Multiple answers",
	status: "Status",
	codeBlock:
		"Code Block (optional) - or just use the ```lang syntax in the question",
	codeBlockPlaceholder:
		"Optional separate code block that appears below the question",
	codeSandbox: "CodeSandbox URL (optional)",
	codeSandboxPlaceholder: "https://codesandbox.io/s/...",
	explanation: "Explanation (shown after answering, supports markdown)",
	explanationPlaceholder:
		"Optional explanation of why the correct answer is correct",
	correct: "Correct",
	addOption: "+ Add Option",
	needsCorrect: "At least one option must be marked as correct",
	saving: "Saving...",
	update: "Update Poll",
	create: "Create Poll",
	optionPlaceholder: (index: number) =>
		`Option ${index + 1} (supports markdown)`,
	questionCount: (length: number) => `${length}/2000 characters (min 10)`,
	explanationCount: (length: number) => `${length}/2000 characters`,
	optionCount: (count: number, max: number) =>
		`Options (${count}/${max}, min 3)`,
} as const;

const FIELD =
	"w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme placeholder:text-white";
const LABEL = "block text-sm font-medium text-theme mb-2";
const TAB = "px-3 py-1 text-sm rounded";
const TAB_ON = "bg-primary text-white";
const TAB_OFF = "bg-gray-700 text-gray-300";
const HINT = "text-sm text-gray-500 mt-1";

export type PollFormOption = {
	id?: number;
	option: string;
	correct: boolean;
};

export type PollFormProps = {
	question: string;
	status: PollStatus;
	statusOptions: readonly PollStatus[];
	answerType: AnswerType;
	categoryCode: CategoryCode;
	codeBlock: string;
	codeSandboxExample: string;
	explanation: string;
	options: readonly PollFormOption[];
	minOptions: number;
	maxOptions: number;
	showPreview: boolean;
	isAdmin: boolean;
	isSubmitting: boolean;
	isValid: boolean;
	isEditing: boolean;
	onQuestionChange: (value: string) => void;
	onStatusChange: (value: PollStatus) => void;
	onAnswerTypeChange: (value: AnswerType) => void;
	onCategoryChange: (value: CategoryCode) => void;
	onCodeBlockChange: (value: string) => void;
	onCodeSandboxChange: (value: string) => void;
	onExplanationChange: (value: string) => void;
	onOptionChange: (index: number, value: string) => void;
	onCorrectChange: (index: number) => void;
	onAddOption: () => void;
	onRemoveOption: (index: number) => void;
	onTogglePreview: (showPreview: boolean) => void;
	onSubmit: () => void;
};

export const PollForm = ({
	question,
	status,
	statusOptions,
	answerType,
	categoryCode,
	codeBlock,
	codeSandboxExample,
	explanation,
	options,
	minOptions,
	maxOptions,
	showPreview,
	isAdmin,
	isSubmitting,
	isValid,
	isEditing,
	onQuestionChange,
	onStatusChange,
	onAnswerTypeChange,
	onCategoryChange,
	onCodeBlockChange,
	onCodeSandboxChange,
	onExplanationChange,
	onOptionChange,
	onCorrectChange,
	onAddOption,
	onRemoveOption,
	onTogglePreview,
	onSubmit,
}: PollFormProps) => {
	const hasCorrectOption = options.some((option) => option.correct);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
			className="space-y-6"
		>
			<div>
				<label className={LABEL}>{COPY.question}</label>
				<div className="flex gap-2 mb-2">
					<button
						type="button"
						onClick={() => onTogglePreview(false)}
						className={`${TAB} ${showPreview ? TAB_OFF : TAB_ON}`}
					>
						{COPY.edit}
					</button>
					<button
						type="button"
						onClick={() => onTogglePreview(true)}
						className={`${TAB} ${showPreview ? TAB_ON : TAB_OFF}`}
					>
						{COPY.preview}
					</button>
				</div>
				{showPreview ? (
					<div className="markdown bg-gray-800 rounded-lg p-4 min-h-37.5">
						<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
							{question || COPY.noQuestion}
						</ReactMarkdown>
					</div>
				) : (
					<textarea
						value={question}
						onChange={(event) => onQuestionChange(event.target.value)}
						className={`${FIELD} min-h-37.5 font-mono`}
						placeholder={COPY.questionPlaceholder}
						required
						minLength={10}
						maxLength={2000}
					/>
				)}
				<p className={HINT}>{COPY.questionCount(question.length)}</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className={LABEL}>{COPY.category}</label>
					<select
						value={categoryCode}
						onChange={(event) => {
							const picked = CATEGORY_CODES.find(
								(code) => code === event.target.value
							);
							if (picked) onCategoryChange(picked);
						}}
						className={FIELD}
					>
						{CATEGORY_CODES.map((code) => (
							<option key={code} value={code}>
								{getCategoryMetadata(code).name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className={LABEL}>{COPY.answerType}</label>
					<div className="flex gap-4">
						<label className="flex items-center gap-2 text-theme">
							<input
								type="radio"
								name="answerType"
								value="single"
								checked={answerType === "single"}
								onChange={() => onAnswerTypeChange("single")}
								className="accent-primary"
							/>
							{COPY.single}
						</label>
						<label className="flex items-center gap-2 text-theme">
							<input
								type="radio"
								name="answerType"
								value="multiple"
								checked={answerType === "multiple"}
								onChange={() => onAnswerTypeChange("multiple")}
								className="accent-primary"
							/>
							{COPY.multiple}
						</label>
					</div>
				</div>
			</div>

			{isAdmin && (
				<div>
					<label className={LABEL}>{COPY.status}</label>
					<select
						value={status}
						onChange={(event) => {
							const picked = statusOptions.find(
								(option) => option === event.target.value
							);
							if (picked) onStatusChange(picked);
						}}
						className={FIELD}
					>
						{statusOptions.map((option) => (
							<option key={option} value={option}>
								{option.charAt(0).toUpperCase() + option.slice(1)}
							</option>
						))}
					</select>
				</div>
			)}

			{codeBlock && (
				<div>
					<label className={LABEL}>{COPY.codeBlock}</label>
					<textarea
						value={codeBlock}
						onChange={(event) => onCodeBlockChange(event.target.value)}
						className={`${FIELD} font-mono min-h-25`}
						placeholder={COPY.codeBlockPlaceholder}
					/>
				</div>
			)}

			<div>
				<label className={LABEL}>{COPY.codeSandbox}</label>
				<input
					type="url"
					value={codeSandboxExample}
					onChange={(event) => onCodeSandboxChange(event.target.value)}
					className={FIELD}
					placeholder={COPY.codeSandboxPlaceholder}
				/>
			</div>

			<div>
				<label className={LABEL}>{COPY.explanation}</label>
				<textarea
					value={explanation}
					onChange={(event) => onExplanationChange(event.target.value)}
					className={`${FIELD} min-h-25`}
					placeholder={COPY.explanationPlaceholder}
					maxLength={2000}
				/>
				<p className={HINT}>{COPY.explanationCount(explanation.length)}</p>
			</div>

			<div>
				<label className={LABEL}>
					{COPY.optionCount(options.length, maxOptions)}
				</label>

				<div className="space-y-3">
					{options.map((option, index) => (
						<div
							key={index}
							className="flex items-start gap-3 bg-gray-800 rounded-lg p-3"
						>
							<label className="flex items-center gap-2 mt-2">
								<input
									type={answerType === "single" ? "radio" : "checkbox"}
									name="correctOption"
									checked={option.correct}
									onChange={() => onCorrectChange(index)}
									className="accent-viridian"
								/>
								<span className="text-xs text-gray-400">{COPY.correct}</span>
							</label>
							<textarea
								value={option.option}
								onChange={(event) => onOptionChange(index, event.target.value)}
								className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-theme min-h-15 font-mono text-sm placeholder:text-white"
								placeholder={COPY.optionPlaceholder(index)}
								required
								maxLength={500}
							/>
							<button
								type="button"
								onClick={() => onRemoveOption(index)}
								disabled={options.length <= minOptions}
								className="text-cinnabar hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed p-2"
							>
								&times;
							</button>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={onAddOption}
					disabled={options.length >= maxOptions}
					className="mt-3 px-3 py-1 text-sm bg-primary text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{COPY.addOption}
				</button>

				{!hasCorrectOption && (
					<p className="text-cinnabar text-sm mt-2">{COPY.needsCorrect}</p>
				)}
			</div>

			<div className="pt-4 border-t border-gray-700">
				<button
					type="submit"
					disabled={!isValid || isSubmitting}
					className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? COPY.saving : isEditing ? COPY.update : COPY.create}
				</button>
			</div>
		</form>
	);
};
