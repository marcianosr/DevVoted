import type { CheckState } from "~/modules/session-run/configs/effect.model";

export const STATE_TEXT: Record<CheckState, string> = {
	running: "text-saffron",
	skipped: "text-pewter",
	success: "text-viridian",
	failed: "text-cinnabar",
};

export const STATE_ROW: Record<CheckState, string> = {
	running: "bg-saffron/30",
	skipped: "bg-pewter/5",
	success: "bg-viridian/30",
	failed: "bg-cinnabar/30",
};
