import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge, themeToneFor } from "../Badge.ui";
import { BuildList, type BuildListRow } from "../BuildList.ui";
import { Button } from "../Button.ui";
import { Choice, type ChoiceState } from "../Choice.ui";
import { Dot } from "../Dot.ui";
import { Equation, type EquationProps } from "../Equation.ui";
import { Legend } from "../Legend.ui";
import { Panel } from "../Panel.ui";
import { RunHeader, type RunHeaderProps } from "../RunHeader.ui";
import { Section } from "../Section.ui";
import { Text } from "../Text.ui";

const COLUMNS =
	"grid grid-cols-[1fr_18rem] items-start gap-6 @max-md:grid-cols-1 @max-md:gap-4";
const QUESTION_COLUMN = "flex flex-col gap-3 py-1";
const SIDEBAR =
	"@container border-l border-edge pl-4 @max-md:border-l-0 @max-md:border-t @max-md:pt-3 @max-md:pl-0";
const BUILD_META = "flex items-center gap-1.5";

export type RevealScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	build: {
		running: number;
		rows: readonly BuildListRow[];
		total: { label: string; value: string };
	};
	audits?: readonly AuditNote[];
	category: string;
	question: string;
	choices: readonly {
		letter: string;
		label: string;
		state: ChoiceState;
		note?: string;
	}[];
	equation: EquationProps;
	explainer?: string;
	nextLabel: string;
	onNext?: () => void;
};

export const RevealScreen = ({
	run,
	theme,
	build,
	audits = [],
	category,
	question,
	choices,
	equation,
	explainer,
	nextLabel,
	onNext,
}: RevealScreenProps) => (
	<Panel theme={theme}>
		<RunHeader {...run} />

		<div className={COLUMNS}>
			<div className={QUESTION_COLUMN}>
				<Audits rows={audits} />

				<Badge tone={themeToneFor(theme)} className="self-start">
					{category}
				</Badge>

				<Text as="p" size="score" className="leading-snug font-bold">
					{question}
				</Text>

				<div className="flex flex-col gap-2">
					{choices.map((choice) => (
						<Choice
							key={choice.letter}
							letter={choice.letter}
							label={choice.label}
							state={choice.state}
							note={
								choice.note === undefined ? undefined : (
									<Badge tone="viridian">{choice.note}</Badge>
								)
							}
						/>
					))}
				</div>

				<div className="border-t border-edge pt-4">
					<Equation {...equation} />
				</div>

				{explainer === undefined ? null : (
					<Text as="p" tone="muted" size="caption" className="leading-relaxed">
						{explainer}
					</Text>
				)}

				<Button label={nextLabel} className="w-full" onUse={onNext} />
			</div>

			<div className={SIDEBAR}>
				<Section
					label="Build"
					meta={
						<span className={BUILD_META}>
							<Dot variant="on" />
							<Text tone="muted" size="caption">
								{build.running} running
							</Text>
						</span>
					}
				>
					<Legend
						variants={build.rows
							.map((row) => row.dot)
							.filter((dot) => dot !== "on")}
						className="pb-2"
					/>
					<BuildList rows={build.rows} total={build.total} />
				</Section>
			</div>
		</div>
	</Panel>
);
