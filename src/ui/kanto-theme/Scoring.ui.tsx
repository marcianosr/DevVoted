import { useState } from "react";

import { Accuracy } from "./Accuracy.ui";
import type { AccuracyTrackProps } from "./AccuracyTrack.ui";
import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Scoring",
} as const;

export const SCORING_TITLE = COPY.title;

const FIGURES = "flex flex-col items-end gap-1.5";
const STEPS =
	"group/steps flex cursor-pointer flex-wrap items-center justify-end gap-1.5";
const UNITS_SHOWN = "group-hover/steps:hidden";
const COVERAGE_SHOWN = "hidden group-hover/steps:inline";
const UNITS_HIDDEN = "hidden";
const COVERAGE_HELD = "inline";

const GAIN_COLOR: KantoColor = "viridian";

export type ScoringTone = "none" | "partial" | "full";

const TONE_COLOR = {
	none: "cinnabar",
	partial: "saffron",
	full: "viridian",
} satisfies Record<ScoringTone, KantoColor>;

export type ScoringStep = {
	figure: string;
	coverage: string;
	tone: ScoringTone;
};

export type ScoringFigure = {
	label: string;
	figure?: string;
	steps?: readonly ScoringStep[];
};

export type ScoringProps = {
	gains: readonly ScoringFigure[];
	accuracy: ScoringFigure;
	track?: AccuracyTrackProps;
};

const Steps = ({ steps }: { steps: readonly ScoringStep[] }) => {
	const [held, setHeld] = useState(false);

	return (
		<button
			type="button"
			aria-pressed={held}
			className={STEPS}
			onClick={(event) => {
				event.currentTarget.focus();
				setHeld((shown) => !shown);
			}}
			onBlur={() => setHeld(false)}
		>
			{steps.map((step, index) => (
				<Badge key={index} color={TONE_COLOR[step.tone]}>
					<span className={held ? UNITS_HIDDEN : UNITS_SHOWN}>
						{step.figure}
					</span>
					<span className={held ? COVERAGE_HELD : COVERAGE_SHOWN}>
						{step.coverage}
					</span>
				</Badge>
			))}
		</button>
	);
};

const Figures = ({ line }: { line: ScoringFigure }) => (
	<span className={FIGURES}>
		{line.figure === undefined ? null : (
			<Badge color={GAIN_COLOR}>{line.figure}</Badge>
		)}
		{line.steps === undefined ? null : <Steps steps={line.steps} />}
	</span>
);

const FigureRow = ({ line }: { line: ScoringFigure }) => (
	<Panel.Row trailing={<Figures line={line} />}>
		<Typography variant="hint" as="span">
			{line.label}
		</Typography>
	</Panel.Row>
);

const TRACK = "border-t border-theme-faint";

export const Scoring = ({ gains, accuracy, track }: ScoringProps) => (
	<Panel>
		<Panel.Header label={COPY.title} />
		<Panel.Rows>
			{[...gains, accuracy].map((line) => (
				<FigureRow key={line.label} line={line} />
			))}
		</Panel.Rows>
		{track === undefined ? null : (
			<Panel.Body className={TRACK}>
				<Accuracy track={track} />
			</Panel.Body>
		)}
	</Panel>
);
