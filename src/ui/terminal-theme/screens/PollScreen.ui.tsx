import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge, type BadgeTone, themeToneFor } from "../Badge.ui";
import { BuildList, type BuildListRow } from "../BuildList.ui";
import { Byline, type BylineProps } from "../Byline.ui";
import { Button } from "../Button.ui";
import { Choice, type ChoiceState } from "../Choice.ui";
import { Dot } from "../Dot.ui";
import { Legend } from "../Legend.ui";
import { Panel } from "../Panel.ui";
import { RunHeader, type RunHeaderProps } from "../RunHeader.ui";
import { Section } from "../Section.ui";
import { Text } from "../Text.ui";
import { Tooltip } from "../Tooltip.ui";
import { Trail, type TrailProps } from "../Trail.ui";

const COLUMNS =
	"grid grid-cols-[1fr_18rem] items-start gap-6 @max-md:grid-cols-1 @max-md:gap-4";
const QUESTION_COLUMN = "flex flex-col gap-3 py-1";
const SIDEBAR =
	"@container border-l border-edge pl-4 @max-md:border-l-0 @max-md:border-t @max-md:pt-3 @max-md:pl-0";
const FACTS = "flex flex-wrap items-center gap-x-2 gap-y-1.5";
const FACT = "flex items-center gap-2";
const SEPARATOR = "text-zinc-600";
const CODE =
	"overflow-x-auto rounded-lg border border-edge bg-zinc-900/60 px-3 py-2";
const BUILD_META = "flex items-center gap-1.5";

export type PollFact = {
	label?: string;
	value?: string;
	hint?: string;
	tone?: BadgeTone;
};

export type PollChoice = {
	letter: string;
	label: string;
	selected?: boolean;
	state?: ChoiceState;
	note?: ReactNode;
};

export type PollScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	build: {
		running: number;
		rows: readonly BuildListRow[];
		total: { label: string; value: string };
	};
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

export const PollScreen = ({
	run,
	theme,
	build,
	audits = [],
	trail,
	category,
	question,
	facts = [],
	code = [],
	choices,
	onToggle,
	submitLabel,
	submitLock,
	onSubmit,
	byline,
}: PollScreenProps) => (
	<Panel theme={theme}>
		<RunHeader {...run} />

		<div className={COLUMNS}>
			<div className={QUESTION_COLUMN}>
				<Trail {...trail} />

				<Audits rows={audits} />

				<div className={FACTS}>
					<Badge tone={themeToneFor(theme)}>{category}</Badge>
					{facts.map((fact) => (
						<span key={`${fact.label}-${fact.value}`} className={FACT}>
							<span aria-hidden className={SEPARATOR}>
								·
							</span>
							{fact.label === undefined ? null : (
								<Text tone="muted" size="caption">
									{fact.label}
								</Text>
							)}
							{fact.value === undefined ? null : (
								<Tooltip hint={fact.hint}>
									<Badge tone={fact.tone ?? "neutral"}>{fact.value}</Badge>
								</Tooltip>
							)}
						</span>
					))}
				</div>

				<Text as="p" size="hero" className="leading-snug font-bold">
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

				<div className="flex flex-col gap-2">
					{choices.map((choice) => (
						<Choice
							key={choice.letter}
							letter={choice.letter}
							label={choice.label}
							state={choice.state}
							selected={choice.selected}
							note={choice.note}
							onPick={
								onToggle === undefined || choice.state === "crossedOut"
									? undefined
									: () => onToggle(choice.letter)
							}
						/>
					))}
				</div>

				<Button
					label={submitLock ?? submitLabel}
					variant="primary"
					disabled={submitLock !== undefined || onSubmit === undefined}
					onUse={onSubmit}
					className="w-full"
				/>

				{byline === undefined ? null : <Byline {...byline} />}
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
