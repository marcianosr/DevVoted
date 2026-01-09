import { createFileRoute } from "@tanstack/react-router";

import Content from "~/components/Content";
import { getAllPolls, getPollCreators } from "~/domains/polls/api/polls";
import PollCategoryCount from "~/domains/polls/components/PollCategoryCount";

export const Route = createFileRoute("/stats")({
	component: RouteComponent,
	loader: async () => {
		return {
			polls: await getAllPolls(),
			creators: await getPollCreators(),
		};
	},
});

function RouteComponent() {
	const { polls, creators } = Route.useLoaderData();

	return (
		<Content>
			<div>
				<h1 className="text-3xl">Polls & categories</h1>

				{polls.success && <PollCategoryCount polls={polls.data} />}
			</div>
			<div className="mt-8">
				<h1 className="text-3xl">Poll Creators</h1>
				{creators.success && (
					<ul className="list-disc pl-5 text-2xl mt-4">
						{creators.data.map((creator) => (
							<li key={creator.id}>
								{creator.displayName} ({creator.amountOfPolls})
							</li>
						))}
					</ul>
				)}
			</div>
		</Content>
	);
}
