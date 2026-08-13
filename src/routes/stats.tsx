import { createFileRoute } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";
import { getAllPolls, getPollCreators } from "~/domains/polls/api/polls";
import PollCategoryCount from "~/domains/polls/components/PollCategoryCount.component";
import { getAllRunsServerFn } from "~/domains/runs/api/runs";
import { CreditList } from "~/modules/account/profile/presentation/CreditList.ui";
import { SpecialThanksPanel } from "~/modules/account/profile/presentation/SpecialThanksPanel.component";

export const Route = createFileRoute("/stats")({
	component: RouteComponent,
	loader: async () => {
		return {
			polls: await getAllPolls(),
			creators: await getPollCreators(),
			runs: await getAllRunsServerFn(),
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
	const { polls, creators, runs } = Route.useLoaderData();

	const runStats = runs.success ? computeRunStats(runs.data) : null;

	return (
		<Screen>
			<section className="space-y-12">
				<div>
					<h1 className="text-3xl underline">Polls & categories</h1>

					{polls.success && <PollCategoryCount polls={polls.data} />}
				</div>
				{creators.success && (
					<CreditList title="Poll Editors" people={creators.data} />
				)}

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

				<SpecialThanksPanel />
			</section>
		</Screen>
	);
}
