import type { ReactNode } from "react";

import { Choice, type ChoiceProps } from "../Choice.ui";
import { Code } from "../Code.ui";
import { Definitions, type Definition } from "../Definitions.ui";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { Subtitle } from "../Subtitle.ui";
import { Trail, type TrailItem } from "../Trail.ui";

const SCREEN = "bg-surface";

// No divider on the stack: every bar already carries its own border-b, and
// divide-y on top of that draws each line twice.
const BODY = "flex flex-col lg:flex-row lg:items-stretch";

// The rail sits AFTER the main column in the DOM so a narrow screen stacks it
// below the question, and lg:order-first lifts it back to the left when there is
// width for two columns. Its border follows: a top edge when stacked, a right
// edge when beside.
const MAIN = "min-w-0 flex-1 divide-y divide-edge";
const RAIL =
	"divide-y divide-edge border-t border-edge lg:order-first lg:w-80 lg:shrink-0 lg:border-t-0 lg:border-r";

const QUESTION = "px-4 py-6 text-sm leading-7 text-zinc-100";
const OPTIONS = "divide-y divide-edge";

export type PollOption = ChoiceProps & { id: string };

export type PollScreenProps = {
	gate?: GateHeaderProps;
	trail: readonly TrailItem[];
	trailLabel: string;
	score?: ReactNode;
	record: readonly Definition[];
	question: readonly ReactNode[];
	code?: readonly ReactNode[];
	options: readonly PollOption[];
	rail?: ReactNode;
};

export const PollScreen = ({
	gate,
	trail,
	trailLabel,
	score,
	record,
	question,
	code,
	options,
	rail,
}: PollScreenProps) => (
	<article className={SCREEN}>
		{gate ? <GateHeader {...gate} /> : null}

		<div className={BODY}>
			<div className={MAIN}>
				<Trail
					items={trail}
					label={trailLabel}
					trailing={score ? <Subtitle>{score}</Subtitle> : null}
				/>

				<Definitions items={record} />

				<div className={QUESTION}>
					{question.map((line, index) => (
						<p key={index}>{line}</p>
					))}
				</div>

				{code?.length ? <Code lines={code} /> : null}

				<ul className={OPTIONS}>
					{options.map(({ id, ...option }) => (
						<li key={id}>
							<Choice {...option} />
						</li>
					))}
				</ul>
			</div>

			{rail ? <aside className={RAIL}>{rail}</aside> : null}
		</div>
	</article>
);
