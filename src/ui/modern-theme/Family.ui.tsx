import { clsx } from "clsx";

import { Text } from "./Text.ui";

/** The player-facing name for a config's `family`. Declared here rather than
 * imported from the run module: modern-theme is a standalone reskin, and mapping
 * `amplify` onto `multiplier` is a Tier-2 job. */
export type ConfigFamily =
	"category" | "multiplier" | "storage" | "tool" | "gamble";

export const FAMILY = {
	category: { label: "category", gloss: "one language pays more" },
	multiplier: { label: "multiplier", gloss: "everything pays more" },
	storage: { label: "storage", gloss: "earns you KB" },
	tool: { label: "tool", gloss: "something you press mid-poll" },
	gamble: { label: "gamble", gloss: "big upside, real cost" },
} as const satisfies Record<ConfigFamily, { label: string; gloss: string }>;

export const FAMILY_ORDER = [
	"category",
	"multiplier",
	"storage",
	"tool",
	"gamble",
] as const satisfies readonly ConfigFamily[];

const FAMILY_TAG = "uppercase tracking-wide";

export type FamilyProps = {
	family: ConfigFamily;
	className?: string;
};

export const Family = ({ family, className }: FamilyProps) => (
	<Text size="xxs" tone="muted" className={clsx(FAMILY_TAG, className)}>
		{FAMILY[family].label}
	</Text>
);
