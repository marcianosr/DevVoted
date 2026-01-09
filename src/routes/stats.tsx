import { createFileRoute } from "@tanstack/react-router";

import Content from "~/components/Content";
import { getAllPolls, getPollCreators } from "~/domains/polls/api/polls";
import PollCategoryCount from "~/domains/polls/components/PollCategoryCount";
import { getAllRunsServerFn } from "~/domains/runs/api/runs";
import { getUsersByDisplayNames } from "~/domains/users/api/users";

const SPECIAL_THANKS = ["Matthijs Groen", "Piet de Vries", "Sander van Maurik"];

export const Route = createFileRoute("/stats")({
	component: RouteComponent,
	loader: async () => {
		return {
			polls: await getAllPolls(),
			creators: await getPollCreators(),
			runs: await getAllRunsServerFn(),
			specialThanks: await getUsersByDisplayNames({
				data: { displayNames: SPECIAL_THANKS },
			}),
		};
	},
});

const computeRunStats = (
	runs: { status: string; completion_reason: string | null }[]
) => {
	const totalRuns = runs.length;
	const activeRuns = runs.filter((r) => r.status === "active").length;
	const finishedRuns = runs.filter((r) => r.status === "finished").length;

	return { totalRuns, activeRuns, finishedRuns, ...runs };
};

function RouteComponent() {
	const { polls, creators, runs, specialThanks } = Route.useLoaderData();

	const runStats = runs.success ? computeRunStats(runs.data) : null;

	return (
		<Content>
			<section className="space-y-12">
				<div>
					<h1 className="text-3xl underline">Polls & categories</h1>

					{polls.success && <PollCategoryCount polls={polls.data} />}
				</div>
				<div>
					<h1 className="text-3xl underline">Poll Creators</h1>
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

				<div>
					<h1 className="text-3xl underline">Run Stats</h1>
					{runStats && (
						<ul className="list-disc pl-5 text-2xl mt-4">
							<li>Total runs played: {runStats.totalRuns}</li>
							<li>Current active runs: {runStats.activeRuns}</li>
							<li>Finished runs: {runStats.finishedRuns}</li>
						</ul>
					)}
				</div>

				<div>
					<h1 className="text-3xl underline">Special thanks to</h1>
					<div className="flex flex-wrap gap-6 mt-4">
						{specialThanks.map((user) => (
							<div key={user.id} className="flex items-center gap-3">
								{user.photoUrl && (
									<img
										src={user.photoUrl}
										alt={user.displayName}
										className="w-12 h-12 rounded-full"
									/>
								)}
								<div>
									<p className="text-xl">{user.displayName}</p>
									{user.githubUsername && (
										<a
											href={`https://github.com/${user.githubUsername}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-blue-400 hover:underline"
										>
											@{user.githubUsername}
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</Content>
	);
}
