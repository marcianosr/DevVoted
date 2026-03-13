import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { clsx } from "clsx";

import Content from "~/components/Content";
import { removeConfigFromRunServerFn } from "~/domains/configs/api/configs";
import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import { applyEffects } from "~/domains/configs/data/configs";
import { Config } from "~/domains/configs/models/config";
import {
	getNextShopOfferingsServerFn,
	getShopOfferingsServerFn,
} from "~/domains/economy/api/shopOfferings";
import ShopContainer from "~/domains/economy/components/ShopContainer";
import { StorageBreakdown } from "~/domains/economy/components/StorageBreakdown";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import {
	getCurrentGate as getCurrentGateServerFn,
	getGatePath,
} from "~/domains/gates/api/gates";
import { RunPathDisplayCompact } from "~/domains/gates/components/RunPathDisplay";
import { getCurrentGateDefinition } from "~/domains/gates/services/gateDefinition.service";
import {
	getDailyPoll,
	getRunPollHistoryServerFn,
} from "~/domains/polls/api/polls";
import { RunPollHistory } from "~/domains/polls/api/queries";
import { PollCountdown } from "~/domains/polls/components/PollCountdown";
import { Poll } from "~/domains/polls/models/poll";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid";
import { formatGateRequirements } from "~/domains/runs/utils/gateFormatting";
import {
	CATEGORY_METADATA,
	type CategoryCode,
} from "~/domains/shared/categories";
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

		// Fetch gate info from database and poll history
		const [currentGateInfo, gatePath, pollHistoryResponse] = await Promise.all([
			getCurrentGateServerFn({ data: { runId } }),
			getGatePath({ data: { runId } }),
			getRunPollHistoryServerFn({ data: { runId } }),
		]);

		const pollHistory = pollHistoryResponse.success
			? pollHistoryResponse.data
			: [];

		// Build gate definition from current gate type
		const currentGate = getCurrentGateDefinition(
			currentGateInfo.gateType,
			currentGateInfo.gateNumber
		);

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
			currentGateNumber: currentGateInfo.gateNumber,
			gatePath,
			pollHistory,
		};
	},
});

type BadgeStatus = "pass" | "fail" | "pending";

const BADGE_CONFIG: Record<
	BadgeStatus,
	{ icon: string; label: string; className: string }
> = {
	pass: { icon: "✓", label: "PASS", className: "bg-green-400" },
	fail: { icon: "✗", label: "FAIL", className: "bg-red-400" },
	pending: { icon: "❯", label: "PENDING", className: "bg-yellow-400" },
};

const Badge = ({ status }: { status: BadgeStatus }) => {
	const config = BADGE_CONFIG[status];
	if (!config) return null;

	return (
		<span className={`${config.className} p-2 text-black`}>
			{config.icon} {config.label}
		</span>
	);
};

const getGateStatus = (
	gateNumber: number,
	currentRound: number
): BadgeStatus => {
	if (gateNumber < currentRound) return "pass";
	if (gateNumber === currentRound) return "pending";
	return "pending";
};

const getPollsForGate = (
	pollHistory: RunPollHistory[],
	gateNumber: number,
	pollsPerGate: number
): RunPollHistory[] => {
	const startIndex = (gateNumber - 1) * pollsPerGate;
	const endIndex = startIndex + pollsPerGate;
	return pollHistory.slice(startIndex, endIndex);
};

const PollHistoryItem = ({
	poll,
	dailyPoll,
	idx,
}: {
	poll: RunPollHistory;
	dailyPoll: Poll;
	idx: number;
}) => {
	const categoryName =
		CATEGORY_METADATA[poll.categoryCode as CategoryCode]?.name ??
		poll.categoryCode;
	const isAnswered = poll.answeredAt !== null;

	const isCurrentDailyPoll = dailyPoll && dailyPoll.id === poll.pollId;

	if (!isAnswered) {
		return (
			<li
				className={clsx(
					"flex items-center gap-2",
					isCurrentDailyPoll ? "text-yellow-400" : "text-gray-500"
				)}
			>
				<span className="w-4 text-center">{idx + 1}</span>
				<span data-category-theme={poll.categoryCode}>{categoryName}</span>
				<span className="text-xs">(not answered)</span>
				<span>{!isCurrentDailyPoll && <span>Missed!</span>}</span>
				<span>{isCurrentDailyPoll && <span>(Today)</span>}</span>
			</li>
		);
	}

	const outcomeStyles = {
		full: "text-green-400",
		partial: "text-amber-400",
		wrong: "text-red-400",
	};

	const outcomeIcons = {
		full: "✓",
		partial: "~",
		wrong: "✗",
	};

	return (
		<li className="flex items-center gap-2">
			<span className="w-4 text-center">{idx + 1}</span>
			{isAnswered ? (
				<span className={`w-4 text-center ${outcomeStyles[poll.outcome]}`}>
					{outcomeIcons[poll.outcome]}
				</span>
			) : (
				<span className="text-yellow-400 w-4 text-center">❯</span>
			)}
			<span data-category-theme={poll.categoryCode}>{categoryName}</span>
			<span>{isCurrentDailyPoll && <span>(Today)</span>}</span>
		</li>
	);
};

function RouteComponent() {
	const {
		activeRun,
		offeredConfigs,
		nextOfferedConfigs,
		configEffects: { reductionCost, storage },
		currentGate,
		currentGateNumber,
		gatePath,
		pollHistory,
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
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-xl">Gate Progress</h3>
							<RunPathDisplayCompact
								gatePath={gatePath}
								currentGateNumber={currentGateNumber}
							/>
						</div>
						{gatePath.map((gateHistory) => {
							const gate = getCurrentGateDefinition(
								{
									id: 0,
									code: gateHistory.gateTypeCode,
									name: gateHistory.gateTypeName,
									description: null,
									stake: gateHistory.stake,
									pollsPerGate: currentGate.pollsPerGate,
									modifierConfig: { wrongAnswerCoverageRate: 1 },
									unlockCondition: null,
									constraint: null,
									reward: null,
									createdAt: new Date(),
									updatedAt: null,
								},
								gateHistory.gateNumber
							);
							const status = getGateStatus(gate.gate, currentGateNumber);
							const isCurrent = gate.gate === currentGateNumber;

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
											<span className="ml-2 text-sm text-gray-400">
												({gateHistory.gateTypeName})
											</span>
										</h2>
									</summary>
									<div className="mt-2">
										<p className="text-gray-400">
											Score atleast: {formatGateRequirements(gate)}
										</p>
									</div>
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
					</div>
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
