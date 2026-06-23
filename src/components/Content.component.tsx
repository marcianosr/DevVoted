import { Poll } from "~/domains/polls/models/poll.model";
import { ContentSection } from "~/ui/ContentSection.component";

type ContentProps = {
	poll?: Poll;
	children: React.ReactNode;
};

const Content = ({ poll, children }: ContentProps) => (
	<ContentSection categoryCode={poll?.categoryCode}>{children}</ContentSection>
);

export default Content;
