import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import type { AuditNote } from "../Audits.ui";
import type { BylineProps } from "../Byline.ui";
import { Button } from "../Button.ui";
import type { ChoiceSeal, ChoiceState } from "../Choice.ui";
import { ChoiceList } from "../ChoiceList.ui";
import type { PollFact } from "../PollInfo.ui";
import { PollLayout, type PollBuild } from "../PollLayout.ui";
import type { RunHeaderProps } from "../RunHeader.ui";
import { Text } from "../Text.ui";
import type { TrailProps } from "../Trail.ui";

const CODE =
	"overflow-x-auto rounded-lg border border-edge bg-zinc-900/60 px-3 py-2";

export type { PollFact };

export type PollChoice = {
	letter: string;
	label: string;
	selected?: boolean;
	state?: ChoiceState;
	note?: ReactNode;
	seal?: ChoiceSeal;
};

export type PollCoverage = {
	held: number;
	demand: number;
	perCorrect: number;
};

export type PollScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	coverage?: PollCoverage;
	build: PollBuild;
	audits?: readonly AuditNote[];
	trail: TrailProps;
	category: string;
	question: string;
	facts?: readonly PollFact[];
	code?: readonly string[];
	choices: readonly PollChoice[];
	onToggle?: (letter: string) => void;
	submitLabel: string;
	submitLock?: string;
	onSubmit?: () => void;
	byline?: BylineProps;
};

const gaugeFor = (
	coverage: PollCoverage | undefined,
	choices: readonly PollChoice[]
) =>
	coverage === undefined
		? undefined
		: {
				held: coverage.held,
				demand: coverage.demand,
				pending: choices.some((choice) => choice.selected)
					? coverage.perCorrect
					: undefined,
			};

export const PollScreen = ({
	run,
	theme,
	coverage,
	build,
	audits,
	trail,
	category,
	question,
	facts,
	code = [],
	choices,
	onToggle,
	submitLabel,
	submitLock,
	onSubmit,
	byline,
}: PollScreenProps) => (
	<PollLayout
		run={run}
		theme={theme}
		coverage={gaugeFor(coverage, choices)}
		build={build}
		audits={audits}
		trail={trail}
		category={category}
		facts={facts}
		byline={byline}
		footer={
			<Button
				label={submitLock ?? submitLabel}
				variant="primary"
				disabled={submitLock !== undefined || onSubmit === undefined}
				onUse={onSubmit}
				className="w-full"
			/>
		}
	>
		<Text as="p" size="hero" className="leading-snug font-extrabold">
			{question}
		</Text>

		{code.length === 0 ? null : (
			<pre className={CODE}>
				{code.map((line, index) => (
					<Text
						key={`${index}-${line}`}
						as="code"
						size="caption"
						className="block"
					>
						{line}
					</Text>
				))}
			</pre>
		)}

		<ChoiceList choices={choices} onPick={onToggle} />
	</PollLayout>
);
