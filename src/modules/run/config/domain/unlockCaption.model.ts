import {
	CONFIG_UNLOCKS,
	type EarnedConfigUnlock,
	isOneShotMetric,
} from "~/modules/run/config/domain/configUnlock.model";

export type UnlockPathCaption =
	| {
			readonly kind: "counted";
			readonly text: string;
			readonly count: number;
			readonly target: number;
	  }
	| {
			readonly kind: "one-shot";
			readonly text: string;
			readonly done: boolean;
	  };

export const thematicCaptionFor = (
	unlock: EarnedConfigUnlock,
	count: number
): UnlockPathCaption => {
	const { metric, target, caption } = unlock.objective;
	if (isOneShotMetric(metric)) {
		return { kind: "one-shot", text: caption, done: count >= target };
	}
	return { kind: "counted", text: caption, count, target };
};

export const fallbackCaptionFor = (
	unlock: EarnedConfigUnlock,
	pollsAnswered: number
): UnlockPathCaption => ({
	kind: "counted",
	text: `Answer ${unlock.fallbackPollsAnswered} polls`,
	count: pollsAnswered,
	target: unlock.fallbackPollsAnswered,
});

export const STARTER_PROVENANCE = "Starter config";

export const provenanceOf = (
	configId: string,
	viaMetric: string | null
): string => {
	if (viaMetric === null) return STARTER_PROVENANCE;
	const unlock = CONFIG_UNLOCKS[configId];
	if (unlock === undefined || unlock.kind === "free") return STARTER_PROVENANCE;
	if (viaMetric === "polls-answered")
		return `Earned: answered ${unlock.fallbackPollsAnswered} polls`;
	return `Earned: ${unlock.objective.earned}`;
};
