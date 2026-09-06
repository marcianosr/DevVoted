import { clsx } from "clsx";

import type { EquationFactor } from "./Equation.ui";
import { Text } from "./Text.ui";
import type { TerminalTone } from "./tones";

const CALLOUT =
	"coverage-callout pointer-events-none absolute top-8 left-6 z-10 flex flex-col gap-0.5 rounded-lg border border-viridian/40 bg-zinc-950/95 px-3 py-2";
const CALLOUT_LOST = "border-cinnabar/40";
const STEM =
	"pointer-events-none absolute top-12 left-2 z-10 h-px w-4 bg-viridian/40";
const STEM_LOST = "bg-cinnabar/40";

export type CoverageCalloutProps = {
	result: string;
	resultLabel: string;
	factors: readonly EquationFactor[];
	tone?: TerminalTone;
	className?: string;
};

const multipliersOf = (factors: readonly EquationFactor[]) =>
	factors
		.filter((factor) => factor.boxed !== true)
		.map((factor) => `${factor.value} ${factor.label}`)
		.join(" · ");

export const CoverageCallout = ({
	result,
	resultLabel,
	factors,
	tone = "viridian",
	className,
}: CoverageCalloutProps) => {
	const lost = tone === "cinnabar";
	const multipliers = multipliersOf(factors);

	return (
		<>
			<span
				aria-hidden
				className={clsx("coverage-callout", STEM, lost && STEM_LOST)}
			/>

			<div className={clsx(CALLOUT, lost && CALLOUT_LOST, className)}>
				<Text size="score" tone={tone} className="font-bold">
					{result}
				</Text>
				<span className="sr-only">{resultLabel}</span>

				{multipliers === "" ? null : (
					<Text size="caption" tone="muted" weight="thin">
						{multipliers}
					</Text>
				)}
			</div>
		</>
	);
};
