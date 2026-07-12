import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import type { AnswerType } from "~/modules/session-run/climb/sessionRun.model";
import type { Config } from "~/modules/session-run/configs/config.model";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

export type { AnswerType };

/** A poll option as the client sees it — no `correct` flag (the server judges). */
export type PollOption = { readonly id: string; readonly label: string };

type PollCardProps = {
	category: CategoryCode;
	question: string;
	options: readonly PollOption[];
	answerType: AnswerType;
	/** Controlled selection for multiple-choice (ignored for single). */
	selectedOptionIds?: readonly string[];
	/** Option ids crossed out by linter configs or the paid lint action. */
	disabledOptionIds?: readonly string[];
	/** Server-revealed result (only after answering) — drives the green/red reveal. */
	correctOptionIds?: readonly string[];
	chosenOptionIds?: readonly string[];
	/** Single: answers immediately. Multiple: toggles the option in the selection. */
	onSelect: (optionId: string) => void;
	/** Multiple only: submit the current selection. */
	onSubmit?: () => void;
	canLint?: boolean;
	/** Whether the lint action can be run now (false = shown but disabled, e.g. can't afford it). */
	lintReady?: boolean;
	/** The linter config powering the lint action — shown as a chip on the button. */
	linter?: Config;
	onLint?: () => void;
	lintCost?: number;
};

export const PollCard = ({
	category,
	question,
	options,
	answerType,
	selectedOptionIds = [],
	disabledOptionIds = [],
	correctOptionIds,
	chosenOptionIds = [],
	onSelect,
	onSubmit,
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
			<Title category={category} as="h2" className="text-4xl leading-none">
				{getCategoryMetadata(category).name}
			</Title>

			<hr className="border-theme border-t-2" />

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
					const row = isCorrect
						? "bg-viridian/15 text-viridian"
						: isChosenWrong
							? "bg-cinnabar/15 text-cinnabar"
							: isSelected
								? "bg-theme-soft text-white"
								: "text-white";
					const box = isCorrect
						? "border-viridian bg-viridian text-black"
						: isChosenWrong
							? "border-cinnabar text-cinnabar"
							: isSelected
								? "border-theme bg-theme text-black"
								: "border-pewter";
					const mark = isCorrect || isSelected ? "✓" : isChosenWrong ? "✕" : "";
					return (
						<button
							key={option.id}
							type="button"
							disabled={off || revealed}
							onClick={() => onSelect(option.id)}
							className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition ${row} ${off ? "cursor-not-allowed opacity-40 line-through" : revealed ? "" : "cursor-pointer hover:bg-white/5"}`}
						>
							<span
								className={`flex h-5 w-5 items-center justify-center rounded border-2 text-xs ${box}`}
							>
								{mark}
							</span>
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>

			{answerType === "multiple" && !revealed ? (
				<button
					type="button"
					onClick={onSubmit}
					disabled={selected.size === 0}
					className="self-start rounded-lg bg-cerulean px-6 py-3 font-bold text-black transition enabled:hover:brightness-110 disabled:opacity-40"
				>
					Submit {selected.size} answer{selected.size === 1 ? "" : "s"}
				</button>
			) : null}
		</div>
	);
};
