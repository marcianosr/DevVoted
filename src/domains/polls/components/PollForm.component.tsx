import { useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { POLL_STATUSES, type Poll } from "~/domains/polls/models/poll.model";
import type { PollOption } from "~/domains/polls/models/pollOption.model";
import {
	CATEGORY_CODES,
	getCategoryMetadata,
	type CategoryCode,
} from "~/domains/shared/categories";

type PollFormOption = {
	id?: number; // Existing options have ID, new ones don't
	option: string;
	correct: boolean;
};

type PollFormData = {
	poll: {
		question: string;
		status: Poll["status"];
		answerType: Poll["answerType"];
		categoryCode: CategoryCode;
		codeBlock: string | null;
		codeSandboxExample: string | null;
		explanation: string | null;
	};
	options: PollFormOption[];
};

type PollFormProps = {
	initialData?: Poll & { options: PollOption[] };
	onSubmit: (data: PollFormData) => Promise<void>;
	isSubmitting: boolean;
	isAdmin?: boolean;
};

const STATUS_OPTIONS = POLL_STATUSES;

const createEmptyOption = (): PollFormOption => ({
	option: "",
	correct: false,
});

export const PollForm = ({
	initialData,
	onSubmit,
	isSubmitting,
	isAdmin = false,
}: PollFormProps) => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	const [question, setQuestion] = useState(initialData?.question ?? "");
	const [status, setStatus] = useState<Poll["status"]>(
		initialData?.status ?? "draft"
	);
	const [answerType, setAnswerType] = useState<Poll["answerType"]>(
		initialData?.answerType ?? "single"
	);

	const [categoryCode, setCategoryCode] = useState<CategoryCode>(
		initialData?.categoryCode ?? "js"
	);
	const [codeBlock, setCodeBlock] = useState(initialData?.codeBlock ?? "");
	const [codeSandboxExample, setCodeSandboxExample] = useState(
		initialData?.codeSandboxExample ?? ""
	);
	const [explanation, setExplanation] = useState(
		initialData?.explanation ?? ""
	);
	const [options, setOptions] = useState<PollFormOption[]>(
		initialData?.options.map((o) => ({
			id: o.id, // Preserve existing option IDs for upsert
			option: o.option,
			correct: o.correct,
		})) ?? [createEmptyOption(), createEmptyOption(), createEmptyOption()]
	);
	const [showPreview, setShowPreview] = useState(false);

	const handleAddOption = () => {
		if (options.length >= 20) return;
		setOptions([...options, createEmptyOption()]);
	};

	const handleRemoveOption = (index: number) => {
		if (options.length <= 3) return;
		setOptions(options.filter((_, i) => i !== index));
	};

	const handleOptionChange = (index: number, value: string) => {
		const updated = [...options];
		updated[index] = { ...updated[index], option: value };
		setOptions(updated);
	};

	const handleCorrectChange = (index: number) => {
		const updated = [...options];
		if (answerType === "single") {
			// For single answer, uncheck all others
			updated.forEach((opt, i) => {
				opt.correct = i === index;
			});
		} else {
			updated[index] = { ...updated[index], correct: !updated[index].correct };
		}
		setOptions(updated);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const data: PollFormData = {
			poll: {
				question,
				status,
				answerType,
				categoryCode,
				codeBlock: codeBlock || null,
				codeSandboxExample: codeSandboxExample || null,
				explanation: explanation || null,
			},
			options,
		};

		await onSubmit(data);
	};

	const hasCorrectOption = options.some((o) => o.correct);
	const hasEnoughOptions = options.length >= 3;
	const allOptionsHaveText = options.every((o) => o.option.trim().length > 0);
	const isValid =
		question.length >= 10 &&
		hasCorrectOption &&
		hasEnoughOptions &&
		allOptionsHaveText;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Question */}
			<div>
				<label className="block text-sm font-medium text-theme mb-2">
					Question (supports markdown & code blocks)
				</label>
				<div className="flex gap-2 mb-2">
					<button
						type="button"
						onClick={() => setShowPreview(false)}
						className={`px-3 py-1 text-sm rounded ${!showPreview ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}`}
					>
						Edit
					</button>
					<button
						type="button"
						onClick={() => setShowPreview(true)}
						className={`px-3 py-1 text-sm rounded ${showPreview ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}`}
					>
						Preview
					</button>
				</div>
				{showPreview ? (
					<div className="markdown bg-gray-800 rounded-lg p-4 min-h-37.5">
						<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
							{question || "*No question yet*"}
						</ReactMarkdown>
					</div>
				) : (
					<textarea
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme min-h-37.5 font-mono placeholder:text-white"
						placeholder="Enter your question here, preferred in rhyme. Use ```lang for code blocks"
						required
						minLength={10}
						maxLength={2000}
					/>
				)}
				<p className="text-sm text-gray-500 mt-1">
					{question.length}/2000 characters (min 10)
				</p>
			</div>

			{/* Category & Answer Type */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-theme mb-2">
						Category
					</label>
					<select
						value={categoryCode}
						onChange={(e) => setCategoryCode(e.target.value as CategoryCode)}
						className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme"
					>
						{CATEGORY_CODES.map((code) => (
							<option key={code} value={code}>
								{getCategoryMetadata(code).name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-theme mb-2">
						Answer Type
					</label>
					<div className="flex gap-4">
						<label className="flex items-center gap-2 text-theme">
							<input
								type="radio"
								name="answerType"
								value="single"
								checked={answerType === "single"}
								onChange={() => setAnswerType("single")}
								className="accent-primary"
							/>
							Single answer
						</label>
						<label className="flex items-center gap-2 text-theme">
							<input
								type="radio"
								name="answerType"
								value="multiple"
								checked={answerType === "multiple"}
								onChange={() => setAnswerType("multiple")}
								className="accent-primary"
							/>
							Multiple answers
						</label>
					</div>
				</div>
			</div>

			{isAdmin && (
				<div>
					<label className="block text-sm font-medium text-theme mb-2">
						Status
					</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value as Poll["status"])}
						className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme"
					>
						{STATUS_OPTIONS.map((s) => (
							<option key={s} value={s}>
								{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
							</option>
						))}
					</select>
				</div>
			)}
			{codeBlock && (
				<div>
					<label className="block text-sm font-medium text-theme mb-2">
						Code Block (optional) - or just use the ```lang syntax in the
						question
					</label>
					<textarea
						value={codeBlock}
						onChange={(e) => setCodeBlock(e.target.value)}
						className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme font-mono min-h-25 placeholder:text-white"
						placeholder="Optional separate code block that appears below the question"
					/>
				</div>
			)}

			<div>
				<label className="block text-sm font-medium text-theme mb-2">
					CodeSandbox URL (optional)
				</label>
				<input
					type="url"
					value={codeSandboxExample}
					onChange={(e) => setCodeSandboxExample(e.target.value)}
					className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme placeholder:text-white"
					placeholder="https://codesandbox.io/s/..."
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-theme mb-2">
					Explanation (shown after answering, supports markdown)
				</label>
				<textarea
					value={explanation}
					onChange={(e) => setExplanation(e.target.value)}
					className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-theme min-h-25 placeholder:text-white"
					placeholder="Optional explanation of why the correct answer is correct"
					maxLength={2000}
				/>
				<p className="text-sm text-gray-500 mt-1">
					{explanation.length}/2000 characters
				</p>
			</div>

			{/* Options */}
			<div>
				<label className="block text-sm font-medium text-theme mb-2">
					Options ({options.length}/20, min 3)
				</label>

				<div className="space-y-3">
					{options.map((opt, index) => (
						<div
							key={index}
							className="flex items-start gap-3 bg-gray-800 rounded-lg p-3"
						>
							<label className="flex items-center gap-2 mt-2">
								<input
									type={answerType === "single" ? "radio" : "checkbox"}
									name="correctOption"
									checked={opt.correct}
									onChange={() => handleCorrectChange(index)}
									className="accent-green-500"
								/>
								<span className="text-xs text-gray-400">Correct</span>
							</label>
							<textarea
								value={opt.option}
								onChange={(e) => handleOptionChange(index, e.target.value)}
								className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-theme min-h-15 font-mono text-sm placeholder:text-white"
								placeholder={`Option ${index + 1} (supports markdown)`}
								required
								maxLength={500}
							/>
							<button
								type="button"
								onClick={() => handleRemoveOption(index)}
								disabled={options.length <= 3}
								className="text-red-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed p-2"
							>
								&times;
							</button>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={handleAddOption}
					disabled={options.length >= 20}
					className="mt-3 px-3 py-1 text-sm bg-primary text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
				>
					+ Add Option
				</button>

				{!hasCorrectOption && (
					<p className="text-red-500 text-sm mt-2">
						At least one option must be marked as correct
					</p>
				)}
			</div>

			<div className="pt-4 border-t border-gray-700">
				<button
					type="submit"
					disabled={!isValid || isSubmitting}
					className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting
						? "Saving..."
						: initialData
							? "Update Poll"
							: "Create Poll"}
				</button>
			</div>
		</form>
	);
};
