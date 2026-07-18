import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { sessionRunQueryKeys } from "~/domains/shared/queryKeys";
import { getTodayDateString } from "~/lib/dateUtils";
import {
	abandonRun,
	dispatchRunAction,
	getTodaysRun,
	startRun,
} from "~/modules/run/api/run";
import type { RunActionInput } from "~/modules/run/validation/schemas.validation";
import type { RunView } from "~/modules/run/view/runView.viewmodel";
import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { AnsweringScreen } from "../screens/AnsweringScreen.ui";
import { ConfiguringScreen } from "../screens/ConfiguringScreen.ui";
import { RewardScreen } from "../screens/RewardScreen.ui";
import { ShopScreen } from "../screens/ShopScreen.ui";
import { StripScreen } from "../screens/StripScreen.ui";
import { HudBar } from "../run/HudBar.ui";
import { RunHud } from "../run/RunHud.ui";
import { RunSummary } from "../run/RunSummary.ui";

/**
 * Tier 2 wiring for the daily run (DVTD-czuc): the server owns the state,
 * this component only sends RunActions and renders the RunView it gets back.
 */
export const RunGame = () => {
	const date = getTodayDateString();
	const queryKey = sessionRunQueryKeys.today(date);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const todaysRun = useQuery({
		queryKey,
		queryFn: () => getTodaysRun(),
	});

	const start = useMutation({
		mutationFn: () => startRun(),
		onSuccess: (result) => {
			if (result.success) queryClient.setQueryData(queryKey, result);
		},
	});

	const dispatch = useMutation({
		mutationFn: (action: RunActionInput) =>
			dispatchRunAction({ data: { action } }),
		onSuccess: (result) => {
			if (result.success) queryClient.setQueryData(queryKey, result);
		},
	});

	// Shop → "How you compared": commit the reward step, then detour to the
	// community page. The climb itself resumes from there ("Climb on →").
	const finishShopToCommunity = async () => {
		const result = await dispatch.mutateAsync({ type: "finish-reward" });
		if (result.success) {
			await navigate({ to: "/run/community" });
		}
	};

	// Abandoning is destructive (half the leftover storage forfeits), so the
	// button arms on first click and only fires on the second.
	const [abandonArmed, setAbandonArmed] = useState(false);
	const abandon = useMutation({
		mutationFn: () => abandonRun(),
		onSuccess: (result) => {
			setAbandonArmed(false);
			if (result.success) {
				queryClient.invalidateQueries({ queryKey });
			}
		},
	});
	const onAbandonClick = () => {
		if (!abandonArmed) return setAbandonArmed(true);
		abandon.mutate();
	};

	const view: RunView | null =
		todaysRun.data?.success === true ? todaysRun.data.data : null;

	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
		setAbandonArmed(false);
	}, [view?.poll?.id]);
	// The reward flows over two pages: the rewards summary, then the shop. Reset to the
	// summary each time a new gate clears.
	const [rewardStep, setRewardStep] = useState<"summary" | "shop">("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [view?.gatesCleared]);

	if (todaysRun.isPending) {
		return (
			<Screen width="narrow">
				<Paragraph>Loading today’s climb…</Paragraph>
			</Screen>
		);
	}

	console.log(todaysRun.data);
	if (todaysRun.data?.success === false) {
		return (
			<Screen width="narrow">
				<Title>Something broke</Title>
				<Paragraph>{todaysRun.data.error}</Paragraph>
			</Screen>
		);
	}

	if (!view) {
		return (
			<Screen
				width="narrow"
				rightAction={{
					label: "Start today’s climb →",
					onClick: () => start.mutate(),
					disabled: start.isPending,
				}}
			>
				<Title>Today’s climb</Title>
				<Paragraph>
					One shared seed a day: everyone gets the same polls, in the same
					order. Build your pipeline, clear the gates, keep what you earn.
				</Paragraph>
				{start.data?.success === false && (
					<Paragraph>{start.data.error}</Paragraph>
				)}
			</Screen>
		);
	}

	const send = (action: RunActionInput) => dispatch.mutate(action);
	const busy = dispatch.isPending;
	const canSubmit = selected.length > 0 && !busy;
	const canStart = view.configs.filter((config) => !config.fixed).length > 0;
	const quotaMet = view.stripsRemaining === 0;
	const runOver = view.status === "won" || view.status === "dead";

	const onSelect = (optionId: string) => {
		if (view.poll?.answerType === "single") return setSelected([optionId]);
		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};

	return (
		<>
			{runOver ? null : (
				<HudBar>
					<RunHud
						storage={view.storage}
						gateNumber={view.gatesCleared + 1}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						streak={view.streak}
						category={view.poll?.category}
						coverage={view.coverage}
						coverageByCategory={view.coverageByCategory}
						configs={view.configs}
						slots={view.slots}
						checks={view.checks}
					/>
				</HudBar>
			)}

			{view.status === "configuring" && (
				<Screen
					rightAction={{
						label: "Start run →",
						onClick: () => send({ type: "start" }),
						disabled: !canStart || busy,
						hint: canStart ? undefined : "Slot a config to start",
					}}
				>
					<ConfiguringScreen
						configs={view.configs}
						slots={view.slots}
						bench={view.available}
						checks={view.checks}
						gateReward={view.gateReward}
						rewardMultiplier={view.rewardMultiplier}
						coverageMultiplier={view.coverageMultiplier}
						coverageAdd={view.coverageAdd}
						onSlot={(id) => send({ type: "slot", configId: id })}
						onUnslot={(id) => send({ type: "unslot", configId: id })}
					/>
				</Screen>
			)}

			{view.status === "answering" && view.poll && (
				<Screen
					categoryCode={view.poll.category}
					leftAction={{
						label: abandonArmed ? "Really abandon? (½ storage)" : "Abandon run",
						onClick: onAbandonClick,
						disabled: abandon.isPending,
					}}
				>
					<AnsweringScreen
						configs={view.configs}
						checks={view.checks}
						category={view.poll.category}
						question={view.poll.question}
						answerType={view.poll.answerType}
						options={view.poll.options}
						selectedOptionIds={selected}
						disabledOptionIds={view.disabledOptionIds}
						canLint={view.canLint}
						lintReady={view.lintReady && !busy}
						linter={view.linter ?? undefined}
						lintCost={view.lintCost}
						canSubmit={canSubmit}
						onSelect={onSelect}
						onSubmit={() => send({ type: "answer", optionIds: [...selected] })}
						onLint={() => send({ type: "lint-poll" })}
					/>
				</Screen>
			)}

			{view.status === "rewarding" && rewardStep === "summary" && (
				<Screen
					rightAction={{
						label: "Continue →",
						onClick: () => setRewardStep("shop"),
					}}
				>
					<RewardScreen
						gatesCleared={view.gatesCleared}
						gateReward={view.gateReward}
						answered={view.answeredThisGate}
						coverageGainedByCategory={view.coverageGainedThisGate}
						passedChecks={view.passedChecks}
						configs={view.configs}
					/>
				</Screen>
			)}

			{view.status === "rewarding" && rewardStep === "shop" && (
				<Screen
					width="wide"
					leftAction={{
						label: "← Back",
						onClick: () => setRewardStep("summary"),
					}}
					rightAction={{
						label: "How you compared →",
						onClick: () => finishShopToCommunity(),
						disabled: busy,
					}}
				>
					<ShopScreen
						storage={view.storage}
						coverageByCategory={view.coverageByCategory}
						checks={view.checks}
						gateNumber={view.gatesCleared + 1}
						configs={view.configs}
						gateReward={view.gateReward}
						rewardMultiplier={view.rewardMultiplier}
						coverageMultiplier={view.coverageMultiplier}
						coverageAdd={view.coverageAdd}
						newConfigIds={view.newConfigIds}
						draftOptions={view.draftOptions}
						onDraft={(id) => send({ type: "draft", configId: id })}
						rebuildCost={view.rebuildCost}
						canRebuild={view.canRebuild && !busy}
						onRebuild={() => send({ type: "rebuild-draft" })}
						slots={view.slots}
						coverage={view.coverage}
						slotCoverageRequired={view.slotCoverageRequired}
						canAddSlot={view.canAddSlot && !busy}
						onAddSlot={() => send({ type: "add-slot" })}
						onUpgrade={(id) => send({ type: "upgrade", configId: id })}
						onSell={(id) => send({ type: "sell", configId: id })}
					/>
				</Screen>
			)}

			{view.status === "awaiting-strip" && (
				<Screen
					rightAction={{
						label: "Climb on →",
						onClick: () => send({ type: "resume-climb" }),
						disabled: !quotaMet || busy,
						hint: quotaMet
							? undefined
							: `Peel ${view.stripsRemaining} more to continue`,
					}}
				>
					<StripScreen
						stripsRemaining={view.stripsRemaining}
						gateNumber={view.gatesCleared + 1}
						configs={view.configs}
						checks={view.checks}
						answered={view.answeredThisGate}
						onStrip={(id) => send({ type: "strip", configId: id })}
					/>
				</Screen>
			)}

			{runOver && (
				<Screen
					width="narrow"
					rightAction={{
						label: "Start a new run →",
						onClick: () => start.mutate(),
						disabled: start.isPending,
					}}
				>
					<RunSummary
						won={view.status === "won"}
						gatesCleared={view.gatesCleared}
						coverage={view.coverage}
						storage={view.storage}
					/>
					<Paragraph>
						Leftover storage is archived. A fresh seed drops tomorrow.
					</Paragraph>
					{start.data?.success === false && (
						<Paragraph>{start.data.error}</Paragraph>
					)}
				</Screen>
			)}
		</>
	);
};
