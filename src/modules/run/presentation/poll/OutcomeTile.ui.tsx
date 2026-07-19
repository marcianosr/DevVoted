import { cva } from "class-variance-authority";
import { Subtitle } from "~/ui/typography/Subtitle.component";

export type PollOutcome = "correct" | "partial" | "wrong" | "missed";

export const OUTCOME_ICON: Record<PollOutcome, string> = {
	correct: "✓",
	partial: "◐",
	wrong: "✕",
	missed: "—",
};

export const outcomeText = cva("", {
	variants: {
		outcome: {
			correct: "text-viridian",
			partial: "text-saffron",
			wrong: "text-cinnabar",
			missed: "text-zinc-400",
		} satisfies Record<PollOutcome, string>,
	},
});

const tile = cva(
	"cursor-pointer rounded-md border p-2 text-left transition-colors",
	{
		variants: {
			outcome: {
				correct: "border-viridian/60 bg-viridian/5 hover:bg-viridian/10",
				partial: "border-saffron/60 bg-saffron/5 hover:bg-saffron/10",
				wrong: "border-cinnabar/60 bg-cinnabar/5 hover:bg-cinnabar/10",
				missed: "border-zinc-700 bg-zinc-900/40 cursor-not-allowed opacity-60",
			} satisfies Record<PollOutcome, string>,
			expanded: {
				true: "ring-1",
				false: "",
			},
		},
	}
);

type OutcomeTileProps = {
	title: string;
	subtitle: string;
	outcome: PollOutcome;
	expanded?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

export const OutcomeTile = ({
	title,
	subtitle,
	outcome,
	expanded = false,
	disabled = false,
	onClick,
}: OutcomeTileProps) => (
	<button
		type="button"
		disabled={disabled}
		onClick={onClick}
		className={tile({ outcome, expanded })}
	>
		<Subtitle>{title}</Subtitle>
		<div className="flex items-center gap-2">
			<span className={outcomeText({ outcome })}>{OUTCOME_ICON[outcome]}</span>
			<span className={`block text-sm ${outcomeText({ outcome })}`}>
				{subtitle}
			</span>
		</div>
	</button>
);
