import { cva } from "class-variance-authority";
import type { CheckState } from "~/modules/run/configs/effect.model";

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
