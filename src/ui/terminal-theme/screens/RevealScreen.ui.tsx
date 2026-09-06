import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { AuditNote } from "../Audits.ui";
import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import type { BylineProps } from "../Byline.ui";
import type { ChoiceState } from "../Choice.ui";
import { ChoiceList } from "../ChoiceList.ui";
import { Equation, type EquationProps } from "../Equation.ui";
import type { PollFact } from "../PollInfo.ui";
import { PollLayout, type PollBuild } from "../PollLayout.ui";
import type { RunHeaderProps } from "../RunHeader.ui";
import { Text } from "../Text.ui";
import type { TrailProps } from "../Trail.ui";

const EQUATION = "border-t border-edge pt-4";

export type RevealChoice = {
	letter: string;
	label: string;
	state: ChoiceState;
	note?: string;
};

export type RevealCoverage = {
	held: number;
	demand: number;
	earned: number;
};

export type RevealScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	coverage?: RevealCoverage;
	build: PollBuild;
	audits?: readonly AuditNote[];
	trail: TrailProps;
	category: string;
	facts?: readonly PollFact[];
	question: string;
	choices: readonly RevealChoice[];
	equation: EquationProps;
	explainer?: string;
	nextLabel: string;
	onNext?: () => void;
	byline?: BylineProps;
};

const settledFor = (choices: readonly RevealChoice[]) =>
	choices.map((choice) => ({
		letter: choice.letter,
		label: choice.label,
		state: choice.state,
		note:
			choice.note === undefined ? undefined : (
				<Badge tone="viridian">{choice.note}</Badge>
			),
	}));

export const RevealScreen = ({
	run,
	theme,
	coverage,
	build,
	audits,
	trail,
	category,
	facts,
	question,
	choices,
	equation,
	explainer,
	nextLabel,
	onNext,
	byline,
}: RevealScreenProps) => (
	<PollLayout
		run={run}
		theme={theme}
		coverage={coverage}
		build={build}
		audits={audits}
		trail={trail}
		category={category}
		facts={facts}
		byline={byline}
		footer={
			<>
				<div className={EQUATION}>
					<Equation {...equation} />
				</div>

				{explainer === undefined ? null : (
					<Text as="p" tone="muted" size="caption" className="leading-relaxed">
						{explainer}
					</Text>
				)}

				<Button label={nextLabel} className="w-full" onUse={onNext} />
			</>
		}
	>
		<Text as="p" size="score" className="leading-snug font-bold">
			{question}
		</Text>

		<ChoiceList choices={settledFor(choices)} />
	</PollLayout>
);
