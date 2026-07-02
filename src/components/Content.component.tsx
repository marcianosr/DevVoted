import { Poll } from "~/domains/polls/models/poll.model";
import { ContentSection } from "~/ui/ContentSection.component";
import type { ScreenTransition, ScreenWidth } from "~/ui/Screen.ui";

type ContentProps = {
	poll?: Poll;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	center?: boolean;
	children: React.ReactNode;
};

const Content = ({
	poll,
	width,
	transition,
	center,
	children,
}: ContentProps) => (
	<ContentSection
		categoryCode={poll?.categoryCode}
		width={width}
		transition={transition}
		center={center}
	>
		{children}
	</ContentSection>
);

export default Content;
