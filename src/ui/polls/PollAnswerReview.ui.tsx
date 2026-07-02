import { clsx } from "clsx";

import { MarkdownText } from "./PollMarkdown.ui";

export type AnswerReviewOption = {
	id: string;
	text: string;
	correct: boolean;
	isYours: boolean;
};

type PollAnswerReviewProps = {
	options: AnswerReviewOption[];
};

type OptionVariant = "correct" | "wrong" | "muted";

const VARIANT_STYLES: Record<
	OptionVariant,
	{ card: string; text: string; box: string; fill: string; mark: string }
> = {
	correct: {
		card: "bg-green-400/10",
		text: "text-green-400",
		box: "border-green-400",
		fill: "bg-green-400 text-black",
		mark: "✓",
	},
	wrong: {
		card: "bg-red-400/10",
		text: "text-red-400",
		box: "border-red-400",
		fill: "bg-red-400 text-black",
		mark: "✗",
	},
	muted: {
		card: "opacity-60",
		text: "text-zinc-400",
		box: "border-zinc-600",
		fill: "",
		mark: "",
	},
};

// Correct options are green; a wrong option you picked is red; the rest are muted.
const optionVariant = (option: AnswerReviewOption): OptionVariant =>
	option.correct ? "correct" : option.isYours ? "wrong" : "muted";

type OptionProps = {
	variant: OptionVariant;
	selected: boolean;
	text: string;
};

const Option = ({ variant, selected, text }: OptionProps) => {
	const style = VARIANT_STYLES[variant];
	return (
		<li
			className={clsx(
				"text-xl flex items-start gap-2 px-3.5 py-2.5",
				style.card
			)}
		>
			<span
				className={clsx(
					"shrink-0 mt-1 w-5 h-5 border-2 flex items-center justify-center text-xs font-bold",
					style.box,
					selected && style.fill
				)}
			>
				{selected ? style.mark : ""}
			</span>
			<div
				className={clsx(
					"markdown flex-1 min-w-0 wrap-break-word [&_p]:m-0",
					style.text
				)}
			>
				<MarkdownText>{text}</MarkdownText>
			</div>
		</li>
	);
};

export const PollAnswerReview = ({ options }: PollAnswerReviewProps) => (
	<ul className="space-y-2">
		{options.map((option) => (
			<Option
				key={option.id}
				variant={optionVariant(option)}
				selected={option.isYours}
				text={option.text}
			/>
		))}
	</ul>
);
