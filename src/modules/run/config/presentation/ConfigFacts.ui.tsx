import { Fragment, type ReactNode } from "react";

import {
	type Config,
	headlineFigureOf,
	isUpgradable,
	rarityOf,
} from "~/modules/run/config/domain/config.model";
import { figureLabel } from "~/ui/modern-theme/Figure.ui";
import { RarityWord } from "~/ui/modern-theme/RarityWord.ui";

/**
 * Where a config stands on its ladder, base level included — one that has never
 * been upgraded is still level 1. A config with no ladder at all says nothing,
 * since "level 1" implies a level 2 it will never have.
 */
const levelFact = (config: Config): string | undefined => {
	if (config.level !== undefined) return `level ${config.level}`;
	return isUpgradable(config) ? "level 1" : undefined;
};

export type ConfigFactsProps = {
	config: Config;
	/**
	 * What selling it out of this build refunds. Owned surfaces pass it; the
	 * opening deal does not, since nothing has been bought yet and a config with
	 * no purchase behind it has no refund to quote.
	 */
	refundKb?: number;
	/** Anything the surface needs to add — a refused paid action, say. */
	note?: ReactNode;
};

/**
 * The facts under an opened config, in the order a player asks for them: what
 * grade it is, how far it is levelled, what it pays, what it would give back.
 * One line shared by every surface that lists configs, so the deal, the shop,
 * prep and the rail cannot describe the same config differently.
 *
 * The grade is spelled out here because the row itself only wears the stripe,
 * and a colour with no word to it is the one fact a row cannot state.
 */
export const ConfigFacts = ({ config, refundKb, note }: ConfigFactsProps) => {
	const figure = headlineFigureOf(config);
	const level = levelFact(config);
	const facts: readonly ReactNode[] = [
		<RarityWord key="rarity" rarity={rarityOf(config)} />,
		...(level === undefined ? [] : [level]),
		...(figure === undefined ? [] : [figureLabel(figure)]),
		...(refundKb === undefined ? [] : [`sells for ${refundKb} KB`]),
		...(note == null ? [] : [note]),
	];

	return facts.map((fact, index) => (
		<Fragment key={index}>
			{index > 0 ? <span aria-hidden> · </span> : null}
			{fact}
		</Fragment>
	));
};
