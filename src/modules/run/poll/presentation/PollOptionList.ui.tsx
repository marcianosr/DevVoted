import { cva } from "class-variance-authority";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import { revealDelayMs } from "~/modules/run/poll/presentation/revealTiming";

export type PollOption = { readonly id: string; readonly label: string };

type OptionStatus =
	"correctChosen" | "correctMissed" | "chosenWrong" | "selected" | "neutral";

const optionStatusOf = (
	isCorrectOption: boolean,
	wasChosen: boolean,
	isSelected: boolean
): OptionStatus => {
	if (isCorrectOption) return wasChosen ? "correctChosen" : "correctMissed";
	if (wasChosen) return "chosenWrong";
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
	correctChosen: "✓",
	correctMissed: "✓",
	chosenWrong: "✕",
	selected: "",
	neutral: "",
};

const optionRow = cva(
	"flex items-start gap-3 px-2 py-3 text-left transition last:border-b-0",
	{
		variants: {
			status: {
				correctChosen: "rounded-lg bg-viridian/10",
				correctMissed: "rounded-lg bg-viridian/5",
				chosenWrong: "rounded-lg bg-cinnabar/10",
				selected: "rounded-lg bg-theme-soft",
				neutral: "border-b border-edge",
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
				className: "hover:bg-theme/10",
			},
		],
	}
);

type ControlShape = "radio" | "checkbox";

const controlShapeOf = (answerType: AnswerType): ControlShape =>
	answerType === "single" ? "radio" : "checkbox";

const optionBadge = cva(
	"flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold",
	{
		variants: {
			status: {
				correctChosen: "bg-viridian text-black",
				correctMissed: "border border-viridian bg-transparent text-viridian",
				chosenWrong: "bg-cinnabar text-black",
				selected: "bg-theme text-black",
				neutral: "bg-surface-raised text-pewter",
			} satisfies Record<OptionStatus, string>,
			shape: {
				radio: "rounded-full",
				checkbox: "rounded-md",
			} satisfies Record<ControlShape, string>,
		},
	}
);

const optionLabel = cva("font-extrabold text-xs sm:text-sm transition-colors", {
	variants: {
		status: {
			correctChosen: "text-viridian",
			correctMissed: "text-viridian/70",
			chosenWrong: "text-cinnabar",
			selected: "text-white",
			neutral: "text-zinc-100",
		} satisfies Record<OptionStatus, string>,
	},
});

const optionLetter = (index: number) => String.fromCharCode(65 + index);

const SplitBar = ({ percent }: { percent: number }) => (
	<span className="block h-1 w-full overflow-hidden rounded-full bg-surface-raised">
		<span
			className="block h-full rounded-full bg-pewter"
			style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
		/>
	</span>
);

type PollOptionListProps = {
	answerType: AnswerType;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	correctOptionIds?: readonly string[];
	chosenOptionIds?: readonly string[];
	splitPercentByOptionId?: Readonly<Record<string, number>>;
	hiddenOptionIds?: readonly string[];
	buyBack?: {
		readonly costKb: number;
		readonly ready: boolean;
		readonly onBuyBack: (optionId: string) => void;
	};
	onSelect: (optionId: string) => void;
};

export const PollOptionList = ({
	answerType,
	options,
	selectedOptionIds = [],
	disabledOptionIds = [],
	correctOptionIds,
	chosenOptionIds = [],
	splitPercentByOptionId,
	hiddenOptionIds = [],
	buyBack,
	onSelect,
}: PollOptionListProps) => {
	const selected = new Set(selectedOptionIds);
	const disabled = new Set(disabledOptionIds);
	const correct = new Set(correctOptionIds ?? []);
	const chosen = new Set(chosenOptionIds);
	const sealed = new Set(hiddenOptionIds);
	const revealed = correctOptionIds !== undefined;
	const shape = controlShapeOf(answerType);

	return (
		<div className="flex flex-col">
			{options.map((option, index) => {
				const off = disabled.has(option.id);
				const isCorrectOption = revealed && correct.has(option.id);
				const wasChosen = revealed && chosen.has(option.id);
				const isSelected = !revealed && selected.has(option.id);
				const status = optionStatusOf(isCorrectOption, wasChosen, isSelected);
				const interaction = interactionOf(off, revealed);
				// A sealed option stays pickable: gambling blind is the point.
				const isSealed = !revealed && sealed.has(option.id);

				const revealDelay = revealed ? revealDelayMs(index, options.length) : 0;
				const revealDelayStyle = revealed
					? { transitionDelay: `${revealDelay}ms` }
					: undefined;
				const row = (
					<button
						type="button"
						disabled={off || revealed}
						onClick={() => onSelect(option.id)}
						className={optionRow({
							status,
							interaction,
							className: isSealed ? "flex-1 border-b-0" : undefined,
						})}
						style={revealDelayStyle}
					>
						<span
							data-shape={shape}
							data-status={status}
							className={optionBadge({
								status,
								shape,
								className: revealed ? "reveal-pop" : undefined,
							})}
							style={
								revealed ? { animationDelay: `${revealDelay}ms` } : undefined
							}
						>
							{MARK[status] || optionLetter(index)}
						</span>
						<span className="flex min-w-0 flex-1 flex-col gap-1.5">
							<span
								className={optionLabel({
									status,
									className: isSealed
										? "tracking-[0.35em] text-pewter"
										: undefined,
								})}
								style={revealDelayStyle}
							>
								{option.label}
							</span>
							{splitPercentByOptionId ? (
								<SplitBar percent={splitPercentByOptionId[option.id] ?? 0} />
							) : null}
						</span>
						{splitPercentByOptionId ? (
							<span className="shrink-0 text-xs font-bold tabular-nums text-pewter">
								{splitPercentByOptionId[option.id] ?? 0}%
							</span>
						) : null}
					</button>
				);

				if (!isSealed || !buyBack) return <div key={option.id}>{row}</div>;
				return (
					<div
						key={option.id}
						className="flex items-center gap-2 border-b border-edge last:border-b-0"
					>
						{row}
						<button
							type="button"
							aria-label={`Buy back option ${optionLetter(index)}`}
							disabled={!buyBack.ready}
							onClick={() => buyBack.onBuyBack(option.id)}
							className="shrink-0 cursor-pointer rounded border border-celadon px-2 py-0.5 text-xs font-bold text-celadon transition enabled:hover:bg-celadon enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
						>
							buy back {buyBack.costKb}KB
						</button>
					</div>
				);
			})}
		</div>
	);
};
