import type { PipelineFailureSlot } from "~/domains/runs/services/runCompletion.service";

export type ParsedCompletion =
	| { type: "victory" }
	| { type: "pipeline_failure"; failedSlots: PipelineFailureSlot[] }
	| { type: "manual" }
	| { type: "unknown" };

export const parseCompletionReason = (
	reason: string | null
): ParsedCompletion => {
	if (!reason) return { type: "unknown" };
	if (reason === "victory") return { type: "victory" };
	if (reason === "manual_break_off") return { type: "manual" };

	try {
		const parsed: unknown = JSON.parse(reason);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			(parsed as { type?: unknown }).type === "pipeline_failure" &&
			Array.isArray((parsed as { failedSlots?: unknown }).failedSlots)
		) {
			return {
				type: "pipeline_failure",
				failedSlots: (parsed as { failedSlots: PipelineFailureSlot[] })
					.failedSlots,
			};
		}
	} catch {
		// Fall through to unknown
	}

	console.warn(
		"[parseCompletionReason] unrecognized completion_reason:",
		reason
	);
	return { type: "unknown" };
};
