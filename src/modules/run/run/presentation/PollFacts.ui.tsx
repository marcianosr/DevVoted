import type { ReactNode } from "react";

import { Badge } from "~/ui/kanto-theme/Badge.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export type PollFact = {
	badge: string;
	tone?: KantoColor;
	figure?: string;
	text: string;
};

export type PollFactsProps = {
	difficulty: PollFact;
	history?: PollFact;
	trailing?: ReactNode;
};

const FactText = ({ children }: { children: ReactNode }) => (
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
		trailing={
			trailing === undefined ? undefined : <FactText>{trailing}</FactText>
		}
	>
		<Badge color={fact.tone}>{fact.badge}</Badge>
		{fact.figure === undefined ? null : (
			<Badge color={fact.tone}>{fact.figure}</Badge>
		)}
		<FactText>{fact.text}</FactText>
	</Panel.Row>
);

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
