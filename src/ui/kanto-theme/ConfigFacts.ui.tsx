import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Version } from "./Version.ui";

const COPY = {
	sell: "uninstalls for",
} as const;

/**
 * A sentence, not a row of parts. `flex` made every text run and every badge a
 * flex item, so a figure mid-sentence broke onto a line of its own and the
 * clause it belongs to carried on beneath it. In normal flow the badge is an
 * inline box and the sentence wraps around it; `leading-relaxed` is the room
 * the badge's own padding needs between lines.
 */
const EFFECT = "text-xs leading-relaxed font-normal text-theme-soft";
const NOTE = "text-xs leading-8 font-normal text-theme-muted";
const META = "flex items-center gap-2 text-xs text-theme-muted";
const SELL = "ml-auto flex shrink-0 items-center gap-1.5";

const NOTE_GAIN: KantoColor = "saffron";

/** The name is the card's own, never restated here (ADR-102). */
export type ConfigFactsProps = {
	description: string;
	slots: number;
	/** Absent where no sale can happen: a settled run, another player's build. */
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
	/**
	 * The card's decorative badges, rendered by the card. A node rather than the
	 * badge data so this file need not know what a config badge is: the card owns
	 * that shape, and taking it here would put the two in a cycle.
	 */
	badges?: ReactNode;
};

/** The weight is the header's block, so the footer never states it twice. */
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
