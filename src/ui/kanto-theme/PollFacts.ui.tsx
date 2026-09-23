import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export type PollFact = {
	badge: string;
	tone?: KantoColor;
	/**
	 * The fact's figure, badged beside the word rather than left in the prose
	 * (ADR-066). It wears the band's own tone deliberately: an uncoloured figure
	 * follows the screen, which made it louder than the verdict it belongs to.
	 */
	figure?: string;
	text: string;
};

export type PollFactsProps = {
	difficulty: PollFact;
	/** Absent until this account has answered the poll at least once. */
	history?: PollFact;
	trailing?: ReactNode;
};

const Prose = ({ children }: { children: ReactNode }) => (
	<Typography variant="hint" as="span">
		{children}
	</Typography>
);

const FactRow = ({
	fact,
	trailing,
}: {
	fact: PollFact;
	trailing?: ReactNode;
}) => (
	<Panel.Row
		trailing={trailing === undefined ? undefined : <Prose>{trailing}</Prose>}
	>
		<Badge color={fact.tone}>{fact.badge}</Badge>
		{fact.figure === undefined ? null : (
			<Badge color={fact.tone}>{fact.figure}</Badge>
		)}
		<Prose>{fact.text}</Prose>
	</Panel.Row>
);

/**
 * What the poll is, before you read it: how the room did on it and what you did
 * to it last time. Sits between the panel's header and the question so both
 * facts are read before the question is, which is the point — they are the
 * reason to spend a peek rather than a reaction to having spent one.
 */
export const PollFacts = ({
	difficulty,
	history,
	trailing,
}: PollFactsProps) => (
	<Panel.Rows>
		<FactRow fact={difficulty} trailing={trailing} />
		{history === undefined ? null : <FactRow fact={history} />}
	</Panel.Rows>
);
