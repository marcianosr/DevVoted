import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Subtitle } from "./Subtitle.ui";
import { SKIN_TONE, type SkinTone } from "./tones";

export type StakeConfig = "kept" | "peeled";

const BODY = "flex flex-col gap-2";
const CONFIGS = "flex items-center gap-1";
const CHIP = "inline-block h-2 w-5 rounded-sm bg-current";

const CONFIG_TONE = {
	kept: "viridian",
	peeled: "cinnabar",
} as const satisfies Record<StakeConfig, SkinTone>;

export type StakeProps = {
	configs: readonly StakeConfig[];
	summary: ReactNode;
	consequence?: ReactNode;
};

export const Stake = ({ configs, summary, consequence }: StakeProps) => (
	<div className={BODY}>
		<div className={CONFIGS}>
			{configs.map((config, index) => (
				<span
					// Position is the identity: a peel takes them in order.
					key={index}
					className={clsx(CHIP, SKIN_TONE[CONFIG_TONE[config]])}
				/>
			))}
		</div>
		<Subtitle>{summary}</Subtitle>
		{consequence ? <Subtitle as="p">{consequence}</Subtitle> : null}
	</div>
);
