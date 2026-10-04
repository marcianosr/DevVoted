import { findTitleById } from "~/modules/account/profile/domain/title.model";
import {
	type UnlockLine,
	unlockLinesFor,
} from "~/modules/run/run/application/unlockNotes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export type TitleLine = { readonly name: string; readonly detail: string };

export type GateGains = {
	readonly unlocked: readonly UnlockLine[];
	readonly titles: readonly TitleLine[];
};

const lastCloseAt = (view: RunView, gate: number) =>
	[...view.closes].reverse().find((close) => close.gate === gate);

const grantFor = (view: RunView, configId: string) =>
	view.unlockedThisRun.find((grant) => grant.configId === configId) ?? {
		configId,
		viaMetric: null,
	};

const titleLinesFor = (titleIds: readonly string[]): readonly TitleLine[] =>
	titleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title === undefined
			? []
			: [{ name: title.name, detail: title.earnedWhen }];
	});

export const gainsOfGate = (view: RunView, gate: number): GateGains => {
	const close = lastCloseAt(view, gate);
	return {
		unlocked: unlockLinesFor(
			(close?.unlockedConfigIds ?? []).map((configId) =>
				grantFor(view, configId)
			)
		),
		titles: titleLinesFor(close?.earnedTitleIds ?? []),
	};
};
