import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { getOrCreateRun } from "~/domains/runs/api/runs";
import { CHALLENGE_MODES } from "~/domains/runs/data/challengeModes";
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
	const navigate = useNavigate();
	const [selectedChallenge, setSelectedChallenge] = useState("tutorial");

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

				<h2 className="text-xl mb-12">
					To get started, select a challenge and click the button below to start
					your run!
				</h2>

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
				<section className="text-white mb-6">
					<h3 className="mt-4 text-2xl">How it works:</h3>
					<ul>
						<li>- Each day a new poll appears in a category</li>
						<li>- Answering polls increases your coverage for each category</li>
						<li>- Answering wrong answers will decrease your coverage</li>
						<li>- Meeting a CI gate allows you to continue the run</li>
						<li>- Failing a CI gate ends your run</li>
						<li>
							- Configs (so-called &quot;modifiers&quot;) are installed from the{" "}
							<span className="underline">Package Manager</span> and can help
							you increase your coverage. Use them wisely!
						</li>
						<li>- Compete with others on the leaderboard!</li>
					</ul>
					<p className="mt-8">
						Answer polls and earn coverage to beat the CI gates! Each run you
						start with 0% coverage. Can you beat all CI Gates? And can you get
						to <span className="text-yellow-500 underline">100%</span> coverage?
					</p>
				</section>

				<PrimaryButton
					onClick={() => startRunMutation.mutate()}
					disabled={startRunMutation.isPending || !selectedChallenge}
				>
					Start New Run
				</PrimaryButton>
			</div>
		</div>
	);
}
