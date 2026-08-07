// @ts-nocheck — legacy game routes parked under /old (DVTD-7tof cleanup).
// Internal links still use pre-move paths; unmaintained, delete-on-cleanup.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { clsx } from "clsx";

import Content from "~/components/Content.component";
import { useArchiveState } from "~/domains/economy/hooks/useArchiveState";
import { getLastRunForGameOver } from "~/domains/runs/api/runs";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { parseCompletionReason } from "~/domains/runs/utils/parseCompletionReason";
import { formatStorage } from "~/lib/storage";
import { Button } from "~/ui/Button.component";

export const Route = createFileRoute("/old/game-over")({
	component: RouteComponent,
	loader: async ({ context: { user, activeRun } }) => {
		const lastRun = await getLastRunForGameOver();

		if (!lastRun.success) {
			return {
				user,
				activeRun,
				lastRun: null,
			};
		}

		return {
			user,
			activeRun,
			lastRun: lastRun.data,
		};
	},
});

function RouteComponent() {
	const { activeRun } = Route.useRouteContext();
	const { user, lastRun } = Route.useLoaderData();
	const navigate = useNavigate();
	const archiveQuery = useArchiveState(user?.id);
	const archivedStorage = archiveQuery.data?.archivedStorage ?? 0;

	if (activeRun && activeRun.success && activeRun.data?.id) {
		return (
			<div className="text-center py-8">
				<h1 className="text-3xl mb-4">Run is still in progress!</h1>
				<p className="mb-4 text-gray-300">
					You can continue your active run, or end it from the menu in the
					top-right (available once you&apos;ve reached gate 5).
				</p>

				<Link to="/daily-poll" className="underline text-theme">
					Continue Run
				</Link>
			</div>
		);
	}

	const completion = parseCompletionReason(
		lastRun?.run.completion_reason ?? null
	);

	return (
		<Content>
			<div className="py-8 space-y-8">
				<header>
					<h1 className="text-4xl">
						{completion.type === "victory" && "You passed all CI gates!"}
						{completion.type === "pipeline_failure" && "Pipeline failed."}
						{(completion.type === "manual" || completion.type === "unknown") &&
							"Run ended."}
					</h1>
					<p>Thank you for playing!</p>
				</header>

				{completion.type === "pipeline_failure" && (
					<section>
						<h2 className="text-2xl mb-2">Failure reason</h2>
						<ul className="space-y-1">
							{completion.failedSlots.map((slot) => (
								<li key={slot.gateTypeId} className="text-red-400">
									✗ {getSlotLabel(slot.gateTypeId)} {slot.difficulty} —{" "}
									{formatRequirement(slot.requirement)}
								</li>
							))}
						</ul>
					</section>
				)}

				<section>
					<h2 className="text-2xl">Your last performance</h2>
					<ul
						className={clsx("mb-4 border p-4", {
							"border-prismatic-first": true,
						})}
					>
						{(lastRun?.categoryCoverage ?? []).map((category) => (
							<li key={category.categoryCode}>
								<span className="text-theme">{category.categoryCode}</span> -
								Coverage: {category.currentCoverage}%, Best Streak:{" "}
								{category.bestStreak}
							</li>
						))}
					</ul>
				</section>

				<section>
					<h2 className="text-2xl">Run summary</h2>
					<ul>
						<li>Total polls answered: {lastRun?.totalPollsAnswered}</li>
						<li>Total shop rebuilds: {lastRun?.run.total_rerolls}</li>
					</ul>
				</section>

				<section>
					<h2 className="text-2xl">Archived storage</h2>
					<p className="text-gray-300">
						This run banked{" "}
						<span className="text-theme">
							+{formatStorage(lastRun?.archivedCredit ?? 0)}
						</span>{" "}
						of left-over storage into your profile. You now have{" "}
						<span className="text-theme">{formatStorage(archivedStorage)}</span>{" "}
						archived — spend it on a cool border for instance!
					</p>
				</section>

				<section className="space-y-4">
					{completion.type === "victory" && (
						<>
							<p className="text-green-400">
								Congratulations on mastering all CI gates! You can continue your
								run and try to reach the perfect 100% coverage!
							</p>
							<Button className="px-3 py-1 mr-4">
								<Link to="/daily-poll">Continue Run</Link>
							</Button>
							<span className="text-gray-400">
								Or start a new run below with a another set of CI gates!
							</span>
						</>
					)}
					<Button
						onClick={() => navigate({ to: "/start" })}
						className="px-3 py-1"
					>
						Start New Run
					</Button>
				</section>
			</div>
		</Content>
	);
}
