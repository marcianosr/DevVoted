import { clsx } from "clsx";

import { Text } from "./Text.ui";
import type { TerminalTone } from "./tones";

export type EquationFactor = {
	value: string;
	label: string;
	boxed?: boolean;
};

const FACTOR = "flex flex-col items-center gap-0.5";
const BOXED = "rounded-lg border border-zinc-500 px-2.5 py-1";

export type EquationProps = {
	factors: readonly EquationFactor[];
	result: string;
	resultLabel: string;
	resultTone?: TerminalTone;
};

export const Equation = ({
	factors,
	result,
	resultLabel,
	resultTone = "viridian",
}: EquationProps) => (
	<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
		<span className="flex items-center gap-3">
			{factors.map((factor, index) => (
				<span key={factor.label} className="flex items-center gap-3">
					{index > 0 ? (
						<Text size="caption" tone="faint" aria-hidden>
							×
						</Text>
					) : null}
					<span className={clsx(FACTOR, factor.boxed && BOXED)}>
						<Text size="score" className="font-bold">
							{factor.value}
						</Text>
						<Text size="caption" tone="muted">
							{factor.label}
						</Text>
					</span>
				</span>
			))}
		</span>
		<span className="flex flex-col items-end gap-0.5 text-right">
			<Text size="hero" tone={resultTone} className="font-bold">
				{result}
			</Text>
			<Text size="caption" tone="muted">
				{resultLabel}
			</Text>
		</span>
	</div>
);
