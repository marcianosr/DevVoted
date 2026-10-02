import { useMutation } from "@tanstack/react-query";

import { submitCrowdPick } from "~/modules/run/community/application/community.serverfn";
import {
	abandonRun,
	dispatchRunAction,
	startRun,
	warmBootRun,
} from "~/modules/run/run/application/run.serverfn";
import type { WireRunAction } from "~/modules/run/run/application/run.validation";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	type RunActionResult,
	type RunActionSuccess,
	useRunCommit,
} from "~/modules/run/run/application/useRunCommit.hook";
import type { WarmBootPick } from "~/modules/run/run/domain/warmBoot.model";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";

export type { RunActionResult, RunActionSuccess };

type RunRequest =
	| { readonly kind: "action"; readonly action: WireRunAction }
	| { readonly kind: "crowd-pick" };

const requestRun = (request: RunRequest): Promise<RunActionResult> =>
	request.kind === "crowd-pick"
		? submitCrowdPick()
		: dispatchRunAction({ data: { action: request.action } });

const actionRequest = (action: WireRunAction): RunRequest => ({
	kind: "action",
	action,
});

export const useRunActions = () => {
	const { commit, refresh } = useRunCommit();

	const dispatch = useMutation({ mutationFn: requestRun });

	const send = (action: WireRunAction) =>
		dispatch.mutate(actionRequest(action), {
			onSuccess: (result) => {
				if (result.success) commit(result);
			},
		});

	const sendThen = (
		action: WireRunAction,
		onCommitted: (view: RunView) => void
	) =>
		dispatch.mutate(actionRequest(action), {
			onSuccess: (result) => {
				if (!result.success) return;
				commit(result);
				onCommitted(result.data);
			},
		});

	const sendWith = (
		action: WireRunAction,
		onResult: (result: RunActionResult) => void
	) =>
		dispatch.mutate(actionRequest(action), {
			onSuccess: (result) => onResult(result),
		});

	const sendCrowdPickWith = (onResult: (result: RunActionResult) => void) =>
		dispatch.mutate(
			{ kind: "crowd-pick" },
			{ onSuccess: (result) => onResult(result) }
		);

	const start = useApiMutation({
		mutationFn: () => startRun(),
		onSuccess: (result) => {
			if (result.success) commit(result);
		},
	});

	const warmBoot = useApiMutation({
		mutationFn: (pick: WarmBootPick) =>
			warmBootRun({ data: { ...pick, serviceIds: [...pick.serviceIds] } }),
		onSuccess: (result) => {
			if (result.success) commit(result);
		},
	});

	const abandon = useApiMutation({
		mutationFn: () => abandonRun(),
		onSuccess: (result) => {
			if (result.success) refresh();
		},
	});

	return {
		send,
		sendThen,
		sendWith,
		sendCrowdPickWith,
		commit,
		busy: dispatch.isPending,
		start,
		warmBoot,
		abandon,
	};
};
