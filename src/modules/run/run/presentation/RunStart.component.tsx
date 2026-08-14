import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";

/** Tier 2: the /run entry screen for a day with no active run yet. */
export const RunStart = () => {
	const { start } = useRunActions();

	return (
		<Screen
			width="narrow"
			rightAction={{
				label: "Start today’s climb →",
				onClick: () => start.mutate(),
				disabled: start.isPending,
			}}
		>
			<Title>Today’s climb</Title>
			<Paragraph>
				One shared seed a day: everyone gets the same polls, in the same order.
				Build your pipeline, clear the gates, keep what you earn.
			</Paragraph>
			{start.data?.success === false && (
				<Paragraph>{start.data.error}</Paragraph>
			)}
		</Screen>
	);
};
