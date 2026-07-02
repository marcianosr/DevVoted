import { Poll } from "~/domains/polls/models/poll.model";
import { ContentSection } from "~/ui/ContentSection.component";
import type { ScreenTransition, ScreenWidth } from "~/ui/Screen.ui";

type ContentProps = {
	poll?: Poll;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	children: React.ReactNode;
};

const Content = ({ poll, width, transition, children }: ContentProps) => (
	<ContentSection
		categoryCode={poll?.categoryCode}
		width={width}
		transition={transition}
	>
		{children}
	</ContentSection>
);

export default Content;
