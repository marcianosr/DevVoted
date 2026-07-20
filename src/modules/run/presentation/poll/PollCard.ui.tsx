import { cva } from "class-variance-authority";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import type { AnswerType } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

export type PollOption = { readonly id: string; readonly label: string };

type PollCardProps = {
	category: CategoryCode;
	question: string;
	answerType: AnswerType;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	correctOptionIds?: readonly string[];
	chosenOptionIds?: readonly string[];
	onSelect: (optionId: string) => void;
	canLint?: boolean;
	lintReady?: boolean;
	linter?: Config;
	onLint?: () => void;
	lintCost?: number;
};

type OptionStatus = "correct" | "chosenWrong" | "selected" | "neutral";

const optionStatusOf = (
	isCorrect: boolean,
	isChosenWrong: boolean,
	isSelected: boolean
): OptionStatus => {
	if (isCorrect) return "correct";
	if (isChosenWrong) return "chosenWrong";
	if (isSelected) return "selected";
	return "neutral";
};

type InteractionState = "disabled" | "revealed" | "active";

const interactionOf = (off: boolean, revealed: boolean): InteractionState => {
	if (off) return "disabled";
	if (revealed) return "revealed";
	return "active";
};

const MARK: Record<OptionStatus, string> = {
	correct: "✓",
	chosenWrong: "✕",
	selected: "",
	neutral: "",
};

const optionRow = cva(
	"flex items-start gap-3 px-2 py-3 text-left transition last:border-b-0",
	{
		variants: {
			status: {
				correct: "rounded-lg bg-viridian/10",
				chosenWrong: "rounded-lg bg-cinnabar/10",
				selected: "rounded-lg bg-theme-soft",
				neutral: "border-b border-zinc-800",
			} satisfies Record<OptionStatus, string>,
			interaction: {
				disabled: "cursor-not-allowed opacity-40 line-through",
				revealed: "",
				active: "cursor-pointer",
			} satisfies Record<InteractionState, string>,
		},
		compoundVariants: [
			{
				status: "neutral",
				interaction: "active",
				className: "hover:bg-white/5",
			},
		],
	}
);

/** Recap copy for screens that show the answer type as text (e.g. AnswerResults). */
export const ANSWER_TYPE_HINT: Record<AnswerType, string> = {
	single: "Select exactly one answer",
	multiple: "Select all that apply",
};

/**
 * Single-answer polls badge each option as a radio (circle); multiple-answer polls
 * as a checkbox (rounded square). The shape is the whole poll-type cue — no extra
 * element, no vertical space — so single vs multiple reads before the first pick.
 */
type ControlShape = "radio" | "checkbox";

const controlShapeOf = (answerType: AnswerType): ControlShape =>
	answerType === "single" ? "radio" : "checkbox";

const optionBadge = cva(
	"flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold",
	{
		variants: {
			status: {
				correct: "bg-viridian text-black",
				chosenWrong: "bg-cinnabar text-black",
				selected: "bg-theme text-black",
				neutral: "bg-zinc-800 text-zinc-400",
			} satisfies Record<OptionStatus, string>,
			shape: {
				radio: "rounded-full",
				checkbox: "rounded-md",
			} satisfies Record<ControlShape, string>,
		},
	}
);

const optionLabel = cva("font-extrabold text-xs sm:text-base", {
	variants: {
		status: {
			correct: "text-viridian",
			chosenWrong: "text-cinnabar",
			selected: "text-white",
			neutral: "text-zinc-100",
		} satisfies Record<OptionStatus, string>,
	},
});

const optionLetter = (index: number) => String.fromCharCode(65 + index);

export const PollCard = ({
	category,
	question,
	answerType,
	options,
	selectedOptionIds = [],
	disabledOptionIds = [],
	correctOptionIds,
	chosenOptionIds = [],
	onSelect,
	canLint = false,
	lintReady = true,
	linter,
	onLint,
	lintCost,
}: PollCardProps) => {
	const selected = new Set(selectedOptionIds);
	const disabled = new Set(disabledOptionIds);
	const correct = new Set(correctOptionIds ?? []);
	const chosen = new Set(chosenOptionIds);
	const revealed = correctOptionIds !== undefined;
	const shape = controlShapeOf(answerType);

	return (
		<div {...categoryTheme(category)} className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Swatch size="lg" />
				<Title category={category} as="h1" size="md">
					{getCategoryMetadata(category).name}
				</Title>
			</div>

			<hr className="border-theme border-t" />

			<Title category={category}>{question}</Title>

			{canLint ? (
				<button
					type="button"
					onClick={onLint}
					disabled={!lintReady}
					className="flex items-center gap-2 self-start rounded border border-viridian px-3 py-1 text-xs text-viridian transition enabled:cursor-pointer enabled:hover:bg-viridian enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
				>
					{linter ? <ConfigChip config={linter} /> : null}
					<span>
						Run linter · cross out a wrong answer
						{lintCost === undefined ? "" : ` (${lintCost}KB)`}
					</span>
				</button>
			) : null}

			<div className="flex flex-col">
				{options.map((option, index) => {
					const off = disabled.has(option.id);
					const isCorrect = revealed && correct.has(option.id);
					const isChosenWrong =
						revealed && chosen.has(option.id) && !correct.has(option.id);
					const isSelected = !revealed && selected.has(option.id);
					const status = optionStatusOf(isCorrect, isChosenWrong, isSelected);
					const interaction = interactionOf(off, revealed);
					return (
						<button
							key={option.id}
							type="button"
							disabled={off || revealed}
							onClick={() => onSelect(option.id)}
							className={optionRow({ status, interaction })}
						>
							<span
								data-shape={shape}
								className={optionBadge({ status, shape })}
							>
								{MARK[status] || optionLetter(index)}
							</span>
							<span className={optionLabel({ status })}>{option.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};
