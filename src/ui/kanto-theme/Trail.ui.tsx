import { Fragment } from "react";

import { Badge } from "./Badge.ui";
import { VERDICT_COLOR, type VerdictOutcome } from "./Verdict.ui";

export type TrailVerdict = VerdictOutcome;

const TRAIL = "flex w-fit items-center gap-2.5 text-xs";
const ACTIVE = "flex items-center gap-2";
const CHEVRON = "text-theme-soft";
const CURRENT_STEP = "text-theme-faint";
const UPCOMING_STEP = "text-theme-faint opacity-50";
const SEPARATOR = "text-theme-faint opacity-25";

const CHEVRON_GLYPH = "❯";
const SEPARATOR_GLYPH = "·";
const DEFAULT_LABEL = "Polls in this gate";

type StepProps = {
	step: number;
	current: number;
	verdict: TrailVerdict | undefined;
};

const Step = ({ step, current, verdict }: StepProps) => {
	if (verdict !== undefined) {
		return (
			<span>
				<Badge color={VERDICT_COLOR[verdict]}>{step}</Badge>
				<span className="sr-only">{verdict}</span>
			</span>
		);
	}

	if (step === current) {
		return (
			<span aria-current="step" className={ACTIVE}>
				<span aria-hidden className={CHEVRON}>
					{CHEVRON_GLYPH}
				</span>
				<span className={CURRENT_STEP}>{step}</span>
			</span>
		);
	}

	return <span className={UPCOMING_STEP}>{step}</span>;
};

export type TrailProps = {
	count: number;
	current: number;
	verdicts?: readonly TrailVerdict[];
	label?: string;
};

const stepsOf = (count: number) =>
	Array.from({ length: count }, (_, index) => index + 1);

const separates = (step: number, verdicts: readonly TrailVerdict[]) =>
	step > 1 &&
	verdicts[step - 1] === undefined &&
	verdicts[step - 2] === undefined;

export const Trail = ({ count, current, verdicts = [], label }: TrailProps) => (
	<nav aria-label={label ?? DEFAULT_LABEL} className={TRAIL}>
		{stepsOf(count).map((step) => (
			<Fragment key={step}>
				{separates(step, verdicts) ? (
					<span aria-hidden className={SEPARATOR}>
						{SEPARATOR_GLYPH}
					</span>
				) : null}
				<Step step={step} current={current} verdict={verdicts[step - 1]} />
			</Fragment>
		))}
	</nav>
);
