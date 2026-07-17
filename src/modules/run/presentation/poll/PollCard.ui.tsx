import { cva } from "class-variance-authority";
import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import type { Config } from "~/modules/run/configs/config.model";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

export type PollOption = { readonly id: string; readonly label: string };

type PollCardProps = {
	category: CategoryCode;
	question: string;
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
	selected: "✓",
	neutral: "",
};

const optionRow = cva(
	"flex items-center gap-3 rounded-lg px-4 py-3 text-left transition",
	{
		variants: {
			status: {
				correct: "bg-viridian/15 text-viridian",
				chosenWrong: "bg-cinnabar/15 text-cinnabar",
				selected: "bg-theme-soft text-white",
				neutral: "text-white",
			} satisfies Record<OptionStatus, string>,
			interaction: {
				disabled: "cursor-not-allowed opacity-40 line-through",
				revealed: "",
				active: "cursor-pointer hover:bg-white/5",
			} satisfies Record<InteractionState, string>,
		},
	}
);

const optionBox = cva(
	"flex h-5 w-5 items-center justify-center rounded border-2 text-xs",
	{
		variants: {
			status: {
				correct: "border-viridian bg-viridian text-black",
				chosenWrong: "border-cinnabar text-cinnabar",
				selected: "border-theme bg-theme text-black",
				neutral: "border-pewter",
			} satisfies Record<OptionStatus, string>,
		},
	}
);

export const PollCard = ({
	category,
	question,
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

	return (
		<div {...categoryTheme(category)} className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<Swatch size="xl" />
				<Title category={category} as="h1">
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

			<div className="flex flex-col gap-2">
				{options.map((option) => {
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
							<span className={optionBox({ status })}>{MARK[status]}</span>
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};
