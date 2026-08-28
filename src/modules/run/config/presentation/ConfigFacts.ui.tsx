import { Fragment, type ReactNode } from "react";

import {
	type Config,
	headlineFigureOf,
	isUpgradable,
} from "~/modules/run/config/domain/config.model";
import { figureLabel } from "~/ui/modern-theme/Figure.ui";

const levelFact = (config: Config): string | undefined => {
	if (config.level !== undefined) return `level ${config.level}`;
	return isUpgradable(config) ? "level 1" : undefined;
};

export type ConfigFactsProps = {
	config: Config;
	refundKb?: number;
	note?: ReactNode;
};

export const ConfigFacts = ({ config, refundKb, note }: ConfigFactsProps) => {
	const figure = headlineFigureOf(config);
	const level = levelFact(config);
	const facts: readonly ReactNode[] = [
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
