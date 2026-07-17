import { cva } from "class-variance-authority";
import type { CheckState } from "~/modules/session-run/configs/effect.model";

export const stateText = cva("", {
	variants: {
		state: {
			running: "text-saffron",
			skipped: "text-pewter",
			success: "text-viridian",
			failed: "text-cinnabar",
		} satisfies Record<CheckState, string>,
	},
});

export const stateRow = cva("", {
	variants: {
		state: {
			running: "bg-saffron/30",
			skipped: "bg-pewter/5",
			success: "bg-viridian/30",
			failed: "bg-cinnabar/30",
		} satisfies Record<CheckState, string>,
	},
});
