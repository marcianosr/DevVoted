import type { ReactNode } from "react";

import { Choice, type ChoiceProps } from "../Choice.ui";
import { Byline, type BylineProps } from "../Byline.ui";
import { Code } from "../Code.ui";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { Question, type QuestionCategory } from "../Question.ui";
import { Trail, type TrailItem } from "../Trail.ui";

const SCREEN = "flex flex-col bg-theme-faint";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const MAIN = "flex min-w-0 flex-1 flex-col gap-6 px-5 py-6 lg:px-8";
const RAIL =
	"flex flex-col gap-1 border-t border-edge px-2 py-4 lg:order-first lg:w-72 lg:shrink-0 lg:border-t-0 lg:border-r";

const OPTIONS = "flex flex-col gap-2";

export type PollOption = ChoiceProps & { id: string };

export type PollScreenProps = {
	gate: GateHeaderProps;
	trail: readonly TrailItem[];
	trailLabel: string;
	question: ReactNode;
	category?: QuestionCategory;
	meta?: readonly string[];
	byline?: BylineProps;
	code?: readonly ReactNode[];
	options: readonly PollOption[];
	rail?: ReactNode;
	theme?: string;
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
	rail,
	theme,
}: PollScreenProps) => (
	<article data-gate-theme={theme} className={SCREEN}>
		<GateHeader {...gate} />

		<div className={BODY}>
			<div className={MAIN}>
				<Trail items={trail} label={trailLabel} />

				<Question category={category} meta={meta}>
					{question}
				</Question>

				{code?.length ? <Code lines={code} /> : null}

				<ul className={OPTIONS}>
					{options.map(({ id, ...option }) => (
						<li key={id}>
							<Choice {...option} />
						</li>
					))}
				</ul>

				{byline ? <Byline {...byline} /> : null}
			</div>

			{rail ? <aside className={RAIL}>{rail}</aside> : null}
		</div>
	</article>
);
