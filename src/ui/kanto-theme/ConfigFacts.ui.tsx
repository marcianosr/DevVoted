import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Version } from "./Version.ui";

const COPY = {
	sell: "uninstalls for",
} as const;

const EFFECT = "text-xs leading-relaxed font-normal text-theme-soft";
const NOTE = "text-xs leading-8 font-normal text-theme-muted";
const META = "flex items-center gap-2 text-xs text-theme-muted";
const SELL = "ml-auto flex shrink-0 items-center gap-1.5";

const NOTE_GAIN: KantoColor = "saffron";

export type ConfigFactsProps = {
	description: string;
	slots: number;
	sellPrice?: string;
	version?: number;
	maxVersion?: number;
	note?: string;
};

export type ConfigEffectProps = Pick<ConfigFactsProps, "description" | "note">;

export const ConfigEffect = ({ description, note }: ConfigEffectProps) => (
	<>
		<p className={EFFECT}>
			<Figures text={description} />
		</p>

		{note === undefined ? null : (
			<p className={NOTE}>
				<Figures text={note} gain={NOTE_GAIN} />
			</p>
		)}
	</>
);

export type ConfigMetaProps = Pick<
	ConfigFactsProps,
	"sellPrice" | "version"
> & {
	badges?: ReactNode;
};

export const ConfigMeta = ({ sellPrice, version, badges }: ConfigMetaProps) => (
	<div className={META}>
		{version === undefined ? null : <Version version={version} />}

		{badges}

		{sellPrice === undefined ? null : (
			<span className={SELL}>
				<span>{COPY.sell}</span>
				<Badge>{sellPrice}</Badge>
			</span>
		)}
	</div>
);
