// @ts-nocheck — legacy game routes parked under /old (DVTD-7tof cleanup).
// Internal links still use pre-move paths; unmaintained, delete-on-cleanup.
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";

import { SKIP_SHOP_REWARD } from "~/config/economy";
import {
	getNextShopOfferingsServerFn,
	getShopOfferingsServerFn,
} from "~/domains/economy/api/shopOfferings";
import ShopContainer from "~/domains/economy/components/ShopContainer.component";
import { applyEffects } from "~/domains/economy/data/configs";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { skipShopServerFn } from "~/domains/runs/api/runs";
import { getTodayDateString } from "~/lib/dateUtils";
import { formatStorage } from "~/lib/storage";
import { Screen } from "~/ui/Screen.ui";

export const Route = createFileRoute("/old/shop")({
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
		activeRun,
		offeredConfigs,
		nextOfferedConfigs,
		reductionCost,
		storageBonus,
		hasAnswered,
		today,
	} = Route.useLoaderData();
	const navigate = useNavigate();
	const router = useRouter();

	const isOpen = hasAnswered && activeRun.shopSkippedDate !== today;
	const hasSkippedShopToday = activeRun.shopSkippedDate === today;
	const hasInteractedWithShopToday = activeRun.shopInteractedDate === today;

	const skipShopMutation = useMutation({
		mutationFn: skipShopServerFn,
		onSuccess: () => {
			router.invalidate();
			navigate({ to: "/community" });
		},
	});

	const onSkipShop = () =>
		skipShopMutation.mutate({
			data: {
				runId: activeRun.id,
				date: today,
				storageBonus: storageBonus ?? 0,
			},
		});

	const canSkip = isOpen && !hasSkippedShopToday && !hasInteractedWithShopToday;

	const rightAction = canSkip
		? {
				label: skipShopMutation.isPending
					? "Skipping..."
					: "Skip shop and go to community",
				onClick: onSkipShop,
				disabled: skipShopMutation.isPending,
				hint: (
					<>
						Gain{" "}
						<span className="text-theme">
							+{formatStorage(SKIP_SHOP_REWARD + (storageBonus ?? 0))}
						</span>{" "}
						storage
					</>
				),
			}
		: {
				label: "Go to community →",
				onClick: () => navigate({ to: "/community" }),
			};

	return (
		<Screen
			transition="fade"
			center
			leftAction={{
				label: "← Back to pipelines",
				onClick: () => navigate({ to: "/pipelines" }),
			}}
			rightAction={rightAction}
		>
			<ShopContainer
				activeRun={activeRun}
				offeredConfigs={offeredConfigs}
				nextOfferedConfigs={nextOfferedConfigs}
				reductionCost={reductionCost}
				isOpen={isOpen}
				date={today}
			/>
		</Screen>
	);
}
