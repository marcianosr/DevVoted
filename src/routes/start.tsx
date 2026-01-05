import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";

import { getOrCreateRun } from "~/domains/runs/api/runs";
import { CHALLENGE_MODES } from "~/domains/runs/data/challengeModes";
import { GameLoopExplainer } from "~/ui/GameLoopExplainer";
import { PrimaryButton } from "~/ui/PrimaryButton";

export const Route = createFileRoute("/start")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.activeRun?.success && context.activeRun?.data?.id) {
			throw redirect({
				to: "/daily-poll",
			});
		}
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();
	const [selectedChallenge, setSelectedChallenge] = useState("vanilla");

	const startRunMutation = useMutation({
		mutationFn: () =>
			getOrCreateRun({ data: { challengeModeId: selectedChallenge } }),
		onSuccess: () => {
			navigate({ to: "/daily-poll" });
		},
	});

	return (
		<div className="p-4">
			<div className="mx-auto max-w-2xl py-8">
				<h1 className="text-4xl mb-4">Welcome to the developer roguelike!</h1>

				<h2 className="text-xl mb-8">
					To get started, select a challenge and click the button below to start
					your run!
				</h2>

				<GameLoopExplainer />

				{user && (
					<section className="my-8">
						<h3 className="text-xl mb-2">Select a challenge</h3>
						{Object.values(CHALLENGE_MODES).map((mode) => (
							<div key={mode.id} className="mb-4">
								<label className="flex items-center space-x-2">
									<input
										type="radio"
										name="challengeMode"
										value={mode.id}
										checked={selectedChallenge === mode.id}
										onChange={() => setSelectedChallenge(mode.id)}
									/>
									<p>{mode.name}</p>
								</label>
								<small className="ml-6 text-gray-300">{mode.description}</small>
							</div>
						))}
					</section>
				)}
				<section className="text-white mb-6">
					<p className="text-gray-300">
						Each run starts at 0% coverage. Answer polls, pass checkpoints, and
						compete on the leaderboard. Can you reach{" "}
						<span className="text-yellow-500 font-bold">100%</span> coverage?
					</p>
				</section>

				{user ? (
					<PrimaryButton
						onClick={() => startRunMutation.mutate()}
						disabled={startRunMutation.isPending || !selectedChallenge}
					>
						Start New Run
					</PrimaryButton>
				) : (
					<Link to="/login" className="py-8  text-3xl underline">
						Login to Start
					</Link>
				)}
			</div>
		</div>
	);
}
