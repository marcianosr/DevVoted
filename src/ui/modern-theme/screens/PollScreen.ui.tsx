import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Choice, type ChoiceProps } from "../Choice.ui";
import { Byline, type BylineProps } from "../Byline.ui";
import { Code } from "../Code.ui";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { optionLetter } from "../format";
import {
	Question,
	type QuestionCategory,
	type QuestionFact,
} from "../Question.ui";
import { Text } from "../Text.ui";
import { Trail, type TrailItem } from "../Trail.ui";

const TRACK = "flex flex-col gap-3 border-b border-edge px-5 py-3 lg:px-8";
const MAIN = "flex w-full min-w-0 flex-1 flex-col gap-6 px-5 py-6 lg:px-8";

const OPTIONS = "flex flex-col gap-2";

const FOOTER = "flex flex-col items-center gap-2";

export type PollOption = Omit<ChoiceProps, "letter"> & { id: string };

export type PollScreenProps = {
	gate: GateHeaderProps;
	trail: readonly TrailItem[];
	trailLabel: string;
	question: ReactNode;
	category?: QuestionCategory;
	meta?: readonly QuestionFact[];
	byline?: BylineProps;
	code?: readonly ReactNode[];
	options: readonly PollOption[];
	reveal?: ReactNode;
	build?: ReactNode;
	notices?: ReactNode;
	onSubmit?: () => void;
	submitLabel?: string;
	submitLock?: string;
	submitNote?: string;
	theme?: SwatchTheme;
};

export const PollScreen = ({
	gate,
	trail,
	trailLabel,
	question,
	category,
	meta,
	byline,
	code,
	options,
	reveal,
	build,
	notices,
	onSubmit,
	submitLabel = "Submit answer →",
	submitLock,
	submitNote,
	theme,
}: PollScreenProps) => (
	<Screen theme={theme} size="3xl">
		<GateHeader {...gate} />

		{build || notices ? (
			<div className={TRACK}>
				{build}
				{notices}
			</div>
		) : null}

		<div className={MAIN}>
			<Trail items={trail} label={trailLabel} />

			<Question category={category} meta={meta}>
				{question}
			</Question>

			{code?.length ? <Code lines={code} /> : null}

			<ul className={OPTIONS}>
				{options.map(({ id, ...option }, index) => (
					<li key={id}>
						<Choice {...option} letter={optionLetter(index)} />
					</li>
				))}
			</ul>

			{reveal}

			{onSubmit ? (
				<div className={FOOTER}>
					<Action
						label={submitLock ?? submitLabel}
						size="lg"
						emphasis="loud"
						full
						disabled={submitLock !== undefined}
						onUse={onSubmit}
					/>
					{submitNote ? (
						<Text size="meta" tone="muted">
							{submitNote}
						</Text>
					) : null}
				</div>
			) : null}

			{byline ? <Byline {...byline} /> : null}
		</div>
	</Screen>
);
