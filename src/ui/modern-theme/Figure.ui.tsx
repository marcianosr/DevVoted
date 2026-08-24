import type { ConfigFigure } from "~/modules/run/config/domain/config.model";

import { Chip } from "./Chip.ui";
import { Delta } from "./Delta.ui";

export type FigureProps = { figure?: ConfigFigure };

/**
 * The one figure a config leads with, wherever its row appears. Every surface
 * that lists configs was building this mapping itself, so a new figure kind cost
 * four identical edits and a fifth surface silently got none.
 */
export const Figure = ({ figure }: FigureProps) => {
	if (!figure) return null;
	if (figure.kind === "multiplier") return <Delta multiplier={figure.value} />;
	if (figure.kind === "coverage") return <Delta coverage={figure.value} />;
	if (figure.kind === "kb") return <Delta kb={figure.value} />;
	if (figure.kind === "percent") return <Delta percent={figure.value} />;

	// Odds are not a delta: nothing is gained or lost, and a sign would claim a
	// direction the figure does not have.
	return <Chip tone="muted">1 in {figure.oneIn}</Chip>;
};
