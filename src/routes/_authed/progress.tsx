import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Content from "~/components/Content.component";
import { removeConfigFromRunServerFn } from "~/domains/economy/api/configs";
import ActiveCard from "~/domains/economy/components/Cards/ActiveCard.component";
import { applyEffects } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import {
	getNextShopOfferingsServerFn,
	getShopOfferingsServerFn,
} from "~/domains/economy/api/shopOfferings";
import ShopContainer from "~/domains/economy/components/ShopContainer.component";
import { StorageBreakdown } from "~/domains/economy/components/StorageBreakdown.component";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import {
	getDailyPoll,
	getPollsSeenInRun,
	getRunPollHistoryServerFn,
} from "~/domains/polls/api/polls";
import { PollCountdown } from "~/domains/polls/components/PollCountdown.component";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid.component";
import { getWindowSize } from "~/domains/runs/services/pipelineEvaluator.service";

import { getTodayDateString } from "~/lib/dateUtils";

export const Route = createFileRoute("/_authed/progress")({
	component: RouteComponent,
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const runId = activeRun.data.id;
		const pollResponse = await getDailyPoll({ data: { runId } });

		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}
		const [pollsSeenResponse, pollHistoryResponse] = await Promise.all([
			getPollsSeenInRun({ data: { runId } }),
			getRunPollHistoryServerFn({ data: { runId } }),
		]);

		const pollsSeen = pollsSeenResponse.success ? pollsSeenResponse.data : 0;
		const pollHistory = pollHistoryResponse.success
			? pollHistoryResponse.data
			: [];

		const windowSize = getWindowSize(activeRun.data.pipelineSlots);
		const windowCount = Math.max(1, Math.ceil(pollsSeen / windowSize));
		const gates = Array.from({ length: windowCount }, (_, i) => ({
			gate: i + 1,
			pollsPerGate: windowSize,
		}));
		const currentGate = gates[gates.length - 1] ?? {
			gate: 1,
			pollsPerGate: windowSize,
		};

		const configEffects = applyEffects(
			{
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				run: activeRun.data,
			},
			activeRun.data.activeConfigIds
		);

		const today = getTodayDateString();
		const shopOfferingsResult = await getShopOfferingsServerFn({
			data: { runId: activeRun.data.id, date: today },
		});
		const offeredConfigs = shopOfferingsResult.success
			? shopOfferingsResult.data
			: [];

		// Fetch pre-generated next offerings from DB (only if showNextConfigs is enabled)
		const nextOfferingsResult = configEffects.showNextConfigs
			? await getNextShopOfferingsServerFn({
					data: { runId: activeRun.data.id, date: today },
				})
			: null;
		const nextOfferedConfigs = nextOfferingsResult?.success
			? nextOfferingsResult.data
			: [];

		return {
			dailyPoll: {
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				selectedOptions: pollResponse.data.selectedOptions,
			},
			activeRun: activeRun.data,
			offeredConfigs,
			nextOfferedConfigs,
			configEffects,
			currentGate,
			pollsSeen,
			pollHistory,
			gates,
		};
	},
});

function RouteComponent() {
	const {
		activeRun,
		offeredConfigs,
		nextOfferedConfigs,
		configEffects: { reductionCost, storage },
		dailyPoll,
	} = Route.useLoaderData();

	const router = useRouter();

	const {
		activeConfigs,
		storageAvailable,
		storageLimit,
		storageUsed,
		configsStorage,
		rerollsStorage,
	} = getStorageInfo(activeRun);

	const deinstallConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onSuccess: () => {
			router.invalidate();
		},
	});

	const today = getTodayDateString();

	const onDeinstallConfig = (config: Config) => {
		deinstallConfigMutation.mutate({
			data: {
				configIds: [config.id],
				runId: activeRun.id,
				date: today,
			},
		});
	};

	return (
		<Content poll={dailyPoll.poll}>
			<section className="max-w-5xl mx-auto space-y-12">
				<PollCountdown />

				<h1 className="text-3xl mb-8">Your progress this run</h1>

				<section className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* <div className="space-y-4">
						<h3 className="text-xl">Gate Progress</h3>
						{gates.map((gate) => {
							const status = getGateStatus(gate.gate, currentGate.gate);
							const isCurrent = gate.gate === currentGate.gate;

							return (
								<details
									key={gate.gate}
									className={`group border-b border-t border-white py-4 ${isCurrent ? "bg-white/5" : ""}`}
									open={isCurrent}
								>
									<summary className="list-none flex gap-4 items-center cursor-pointer before:content-['▸'] before:text-2xl before:w-6 group-open:before:content-['▾']">
										<Badge status={status} />
										<h2 className="text-2xl">
											Gate #{gate.gate} · {gate.pollsPerGate} polls
										</h2>
									</summary>
									<ol className="mt-3 space-y-1">
										{getPollsForGate(
											pollHistory,
											gate.gate,
											gate.pollsPerGate
										).map((poll, idx) => (
											<PollHistoryItem
												key={poll.pollId}
												poll={poll}
												dailyPoll={dailyPoll.poll}
												idx={idx + (gate.gate - 1) * gate.pollsPerGate}
											/>
										))}
									</ol>
								</details>
							);
						})}
					</div> */}
					<CategoryCoverageGrid
						categoryCoverage={activeRun.categoryCoverage}
						currentCategoryCode={dailyPoll.poll.categoryCode}
					/>
				</section>
				<ShopContainer
					activeRun={activeRun}
					offeredConfigs={offeredConfigs}
					nextOfferedConfigs={nextOfferedConfigs}
					reductionCost={reductionCost}
					isOpen={dailyPoll.hasAnswered && activeRun.shopSkippedDate !== today}
					storageBonus={storage.skipBonus}
					date={today}
				/>
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="col-span-1">
						<StorageBreakdown
							storageUsed={storageUsed}
							storageLimit={storageLimit}
							storageAvailable={storageAvailable}
							configsStorage={configsStorage}
							rerollsStorage={rerollsStorage}
							deinstallPenalty={activeRun.deinstallPenalty}
							injectedArchive={activeRun.injectedArchiveBytes}
						/>
					</div>

					<div className="space-y-4  col-span-2">
						<h3 className="text-xl">
							Your active configs ({activeConfigs.length})
						</h3>
						<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2">
							{activeConfigs.length === 0 ? (
								<p className="text-gray-400">
									No active configs installed. Your run is unconfigured.
								</p>
							) : (
								activeConfigs.map((config) => (
									<li key={config.id} className="shrink-0 snap-start">
										<ActiveCard
											config={config}
											onDeinstall={onDeinstallConfig}
											disabled={!dailyPoll.hasAnswered}
											size="large"
										/>
									</li>
								))
							)}
						</ul>
					</div>
				</section>
			</section>
		</Content>
	);
}
