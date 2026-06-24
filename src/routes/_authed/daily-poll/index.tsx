import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import Content from "~/components/Content.component";
import { DevPollNavigator } from "~/components/DevPollNavigator.component";
import { applyEffects } from "~/domains/economy/data/configs";
import {
	getNextShopOfferingsServerFn,
	getShopOfferingsServerFn,
} from "~/domains/economy/api/shopOfferings";
import { getDailyPoll } from "~/domains/polls/api/polls";
import DailyPollContainer, {
	getScoreBreakdown,
} from "~/domains/polls/components/DailyPollContainer.component";
import { getWindowContextFn } from "~/domains/runs/api/runs";
import { getTodayDateString } from "~/lib/dateUtils";
import { ErrorComponent } from "~/ui/ErrorComponent.component";

const DailyPoll: React.FC = () => {
	const { user, activeRun } = Route.useRouteContext();
	const {
		poll,
		options,
		hasAnswered,
		selectedOptions,
		creatorDisplayName,
		isAdmin,
		score,
		configEffects,
		offeredConfigs,
		nextOfferedConfigs,
		currentDate,
		initialWindowContext,
		lastSeenAt,
		lastEncounteredAt,
		timesEncountered,
	} = Route.useLoaderData();
	const { date } = Route.useSearch();

	// Type narrowing: beforeLoad ensures activeRun exists and has success=true
	if (!user || !activeRun?.success) {
		return <ErrorComponent text="User not found" />;
	}

	return (
		<Content poll={poll}>
			<DevPollNavigator currentDate={currentDate} hasCustomDate={!!date} />
			<DailyPollContainer
				key={poll.id}
				poll={poll}
				options={options}
				hasAnswered={hasAnswered}
				activeRun={activeRun.data}
				selectedOptions={selectedOptions}
				score={score}
				configEffects={configEffects}
				creatorDisplayName={creatorDisplayName}
				isAdmin={isAdmin}
				offeredConfigs={offeredConfigs}
				nextOfferedConfigs={nextOfferedConfigs}
				initialPendingUpgradeCards={activeRun.data.pendingUpgradeCards}
				initialWindowContext={initialWindowContext}
				date={currentDate}
				lastSeenAt={lastSeenAt}
				lastEncounteredAt={lastEncounteredAt}
				timesEncountered={timesEncountered}
			/>
		</Content>
	);
};

const searchParamsSchema = z.object({
	date: z.string().optional(),
});

export const Route = createFileRoute("/_authed/daily-poll/")({
	component: DailyPoll,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ date: search.date }),
	beforeLoad: async ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun?.data?.id) {
			throw redirect({
				to: "/start",
			});
		}
	},
	loader: async ({ context: { activeRun }, deps }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const currentDate = deps.date || getTodayDateString();

		const pollResponse = await getDailyPoll({
			data: { runId: activeRun.data.id, date: deps.date },
		});

		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}

		const configEffects = applyEffects(
			{
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				run: activeRun.data,
			},
			activeRun.data.activeConfigIds
		);

		const shopOfferingsResult = await getShopOfferingsServerFn({
			data: { runId: activeRun.data.id, date: currentDate },
		});
		const offeredConfigs = shopOfferingsResult.success
			? shopOfferingsResult.data
			: [];

		const nextOfferingsResult = configEffects.showNextConfigs
			? await getNextShopOfferingsServerFn({
					data: { runId: activeRun.data.id, date: currentDate },
				})
			: null;
		const nextOfferedConfigs = nextOfferingsResult?.success
			? nextOfferingsResult.data
			: [];

		const [score, windowContext] = await Promise.all([
			getScoreBreakdown({
				data: {
					pollId: pollResponse.data.poll.id,
					selectedOptions: pollResponse.data.selectedOptions,
					hasAnswered: pollResponse.data.hasAnswered,
				},
			}),
			getWindowContextFn(),
		]);

		return {
			poll: pollResponse.data.poll,
			options: pollResponse.data.options,
			hasAnswered: pollResponse.data.hasAnswered,
			selectedOptions: pollResponse.data.selectedOptions,
			creatorDisplayName: pollResponse.data.creatorDisplayName,
			isAdmin: pollResponse.isAdmin,
			score,
			configEffects,
			offeredConfigs,
			nextOfferedConfigs,
			currentDate,
			initialWindowContext: windowContext,
			lastSeenAt: pollResponse.data.lastSeenAt ?? null,
			lastEncounteredAt: pollResponse.data.lastEncounteredAt ?? null,
			timesEncountered: pollResponse.data.timesEncountered,
		};
	},
	pendingComponent: () => (
		<section className="max-w-5xl mx-auto p-4">
			<div className="animate-pulse">Loading poll...</div>
		</section>
	),
	pendingMs: 300,
	errorComponent: () => {
		return (
			<section className="max-w-5xl mx-auto">
				<h1 className="text-red-500 text-3xl">Error loading poll</h1>
			</section>
		);
	},
});
