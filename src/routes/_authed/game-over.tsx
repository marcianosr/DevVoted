import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { ConfirmDialog } from "~/components/ConfirmDialog";
import { finishRunFn } from "~/domains/runs/api/runs";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import { SecondaryButton } from "~/ui/SecondaryButton";

export const Route = createFileRoute("/_authed/game-over")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();

	const { activeRun } = Route.useRouteContext();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const finishRunMutation = useMutation({
		mutationFn: () => finishRunFn(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
			setIsDialogOpen(false);
			navigate({ to: "/start" });
		},
	});

	const handleStartNewRunClick = () => {
		if (activeRun.success && activeRun.data?.id) setIsDialogOpen(true);
	};
	const handleConfirmFinishRun = () => finishRunMutation.mutate();
	const handleCancelFinishRun = () => setIsDialogOpen(false);

	if (activeRun.success && activeRun.data?.id) {
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

	return (
		<div className="text-center py-8 space-y-4">
			<h1 className="text-3xl">Game over!</h1>

			<p>Thank you for playing!</p>
			<p>Your results have been saved.</p>

			<SecondaryButton
				onClick={handleStartNewRunClick}
				className="px-3 py-1 text-sm"
			>
				Start New Run
			</SecondaryButton>
		</div>
	);
}
