import { createFileRoute } from "@tanstack/react-router";

import Content from "~/components/Content.component";
import {
	getNextShopOfferingsServerFn,
	getShopOfferingsServerFn,
} from "~/domains/economy/api/shopOfferings";
import ShopContainer from "~/domains/economy/components/ShopContainer.component";
import { applyEffects } from "~/domains/economy/data/configs";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { getTodayDateString } from "~/lib/dateUtils";

export const Route = createFileRoute("/_authed/shop")({
	component: ShopRoute,
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}
		const run = activeRun.data;
		const today = getTodayDateString();

		const pollResponse = await getDailyPoll({ data: { runId: run.id } });
		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}
		const { poll, options, hasAnswered } = pollResponse.data;

		const configEffects = applyEffects(
			{ poll, options, hasAnswered, run },
			run.activeConfigIds
		);

		const shopOfferingsResult = await getShopOfferingsServerFn({
			data: { runId: run.id, date: today },
		});
		const offeredConfigs = shopOfferingsResult.success
			? shopOfferingsResult.data
			: [];

		const nextOfferingsResult = configEffects.showNextConfigs
			? await getNextShopOfferingsServerFn({
					data: { runId: run.id, date: today },
				})
			: null;
		const nextOfferedConfigs = nextOfferingsResult?.success
			? nextOfferingsResult.data
			: [];

		return {
			poll,
			activeRun: run,
			offeredConfigs,
			nextOfferedConfigs,
			reductionCost: configEffects.reductionCost,
			storageBonus: configEffects.storage.skipBonus,
			hasAnswered,
			today,
		};
	},
});

function ShopRoute() {
	const {
		poll,
		activeRun,
		offeredConfigs,
		nextOfferedConfigs,
		reductionCost,
		storageBonus,
		hasAnswered,
		today,
	} = Route.useLoaderData();

	return (
		<Content poll={poll} transition="fade" center>
			<ShopContainer
				activeRun={activeRun}
				offeredConfigs={offeredConfigs}
				nextOfferedConfigs={nextOfferedConfigs}
				reductionCost={reductionCost}
				isOpen={hasAnswered && activeRun.shopSkippedDate !== today}
				storageBonus={storageBonus}
				date={today}
			/>
		</Content>
	);
}
