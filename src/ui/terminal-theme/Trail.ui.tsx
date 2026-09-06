import { clsx } from "clsx";

import { Text } from "./Text.ui";

const STEP_DOT = "size-2 rounded-full";

export type TrailVerdict = "correct" | "partial" | "wrong";

const VERDICT_DOT = {
	correct: "bg-celadon",
	partial: "bg-saffron",
	wrong: "bg-cinnabar",
} satisfies Record<TrailVerdict, string>;

const dotClass = (
	step: number,
	current: number,
	verdict: TrailVerdict | undefined
) => {
	if (verdict !== undefined) return VERDICT_DOT[verdict];
	if (step < current) return "bg-celadon";
	if (step === current) return "bg-zinc-100";
	return "bg-zinc-700";
};

export type TrailProps = {
	count: number;
	current: number;
	verdicts?: readonly TrailVerdict[];
	label?: string;
};

export const Trail = ({ count, current, verdicts = [], label }: TrailProps) => (
	<nav
		aria-label={label ?? "Polls in this gate"}
		className="flex items-center justify-between gap-4"
	>
		<span className="flex items-center gap-2.5">
			{Array.from({ length: count }, (_, index) => index + 1).map((step) => (
				<span key={step} className="flex items-center gap-2.5">
					{step > 1 ? (
						<Text size="caption" tone="faint" aria-hidden>
							›
						</Text>
					) : null}
					<span className="flex items-center gap-1.5">
						<span
							aria-hidden
							className={clsx(
								STEP_DOT,
								dotClass(step, current, verdicts[step - 1])
							)}
						/>
						<Text size="caption" tone={step === current ? "default" : "faint"}>
							{step}
						</Text>
						{verdicts[step - 1] === undefined ? null : (
							<span className="sr-only">{verdicts[step - 1]}</span>
						)}
					</span>
				</span>
			))}
		</span>
	</nav>
);
