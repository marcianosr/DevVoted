import { Poll } from "~/domains/polls/models/poll";

type ContentProps = {
	poll?: Poll;
	children: React.ReactNode;
};

const Content = ({ poll, children }: ContentProps) => {
	return (
		<section
			data-category-theme={poll?.categoryCode}
			className="w-full sm:max-w-5xl mx-auto p-4"
		>
			{children}
		</section>
	);
};

export default Content;
