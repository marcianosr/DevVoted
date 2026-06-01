import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { clsx } from "clsx";

import { ConfirmDialog } from "~/ui/ConfirmDialog.component";
import Content from "~/components/Content.component";
import { finishRunFn, getLastRunForGameOver } from "~/domains/runs/api/runs";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { parseCompletionReason } from "~/domains/runs/utils/parseCompletionReason";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { SecondaryButton } from "~/ui/SecondaryButton.component";

export const Route = createFileRoute("/_authed/game-over")({
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
	const { user, activeRun } = Route.useRouteContext();
	const { lastRun } = Route.useLoaderData();

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const finishRunMutation = useMutation({
		mutationFn: async () => {
			const result = await finishRunFn();
			if (!result.success) {
				throw new Error(result.error);
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
			setIsDialogOpen(false);
			navigate({ to: "/start" });
		},
		onError: (error) => {
			console.error("Failed to finish run:", error.message);
		},
	});

	const handleStartNewRunClick = () => {
		if (activeRun && activeRun.success && activeRun.data?.id)
			setIsDialogOpen(true);
		else navigate({ to: "/start" });
	};
	const handleConfirmFinishRun = () => finishRunMutation.mutate();
	const handleCancelFinishRun = () => setIsDialogOpen(false);

	if (activeRun && activeRun.success && activeRun.data?.id) {
		return (
			<div className="text-center py-8">
				<h1 className="text-3xl mb-4">Run is still in progress!</h1>
				<p className="mb-4 text-gray-300">
					Finish your run before viewing game over or reset your run.
				</p>

				<div className="flex gap-2 justify-center items-center">
					<Link to="/daily-poll" className="underline text-blue-400">
						Continue Run
					</Link>
					<SecondaryButton
						onClick={handleStartNewRunClick}
						className="px-3 py-1 text-sm"
					>
						Start New Run
					</SecondaryButton>
					<ConfirmDialog
						isOpen={isDialogOpen}
						onConfirm={handleConfirmFinishRun}
						onCancel={handleCancelFinishRun}
						title="Start New Run"
						message="Are you sure you want to break off your current run?"
					/>
				</div>
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
							<li
								key={category.categoryCode}
								data-category-theme={category.categoryCode}
							>
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

				<section className="space-y-4">
					{completion.type === "victory" && (
						<>
							<p className="text-green-400">
								Congratulations on mastering all CI gates! You can continue your
								run and try to reach the perfect 100% coverage!
							</p>
							<PrimaryButton className="px-3 py-1 mr-4">
								<Link to="/daily-poll">Continue Run</Link>
							</PrimaryButton>
							<span className="text-gray-400">
								Or start a new run below with a another set of CI gates!
							</span>
						</>
					)}
					<PrimaryButton onClick={handleStartNewRunClick} className="px-3 py-1">
						Start New Run
					</PrimaryButton>
				</section>
			</div>
		</Content>
	);
}
