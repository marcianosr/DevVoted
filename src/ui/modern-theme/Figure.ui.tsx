import type { ConfigFigure } from "~/modules/run/config/domain/config.model";

import { Chip } from "./Chip.ui";
import { Delta } from "./Delta.ui";
import { signed } from "./format";
import { Text } from "./Text.ui";

const PLAIN = "tabular-nums";

/**
 * The figure as one plain string. Two readings need it: a column shared down a
 * list, where a chip per row would frame every value separately, and the rail's
 * outlined "would pay" chip. `+` against `×` is the whole distinction between an
 * add and a multiplier, which is why the sign is never dropped.
 */
export const figureLabel = (figure: ConfigFigure): string => {
	if (figure.kind === "multiplier") return `×${figure.value}`;
	if (figure.kind === "coverage") return signed(figure.value);
	if (figure.kind === "kb") return `${signed(figure.value)} KB`;
	if (figure.kind === "percent") return `${signed(figure.value)}%`;
	return `1 in ${figure.oneIn}`;
};

export type FigureProps = {
	figure?: ConfigFigure;
	/** Reads as text in a shared column rather than as its own chip. */
	plain?: boolean;
};

/**
 * The one figure a config leads with, wherever its row appears. Every surface
 * that lists configs was building this mapping itself, so a new figure kind cost
 * four identical edits and a fifth surface silently got none.
 */
export const Figure = ({ figure, plain = false }: FigureProps) => {
	if (!figure) return null;

	if (plain)
		return (
			<Text size="meta" className={PLAIN}>
				{figureLabel(figure)}
			</Text>
		);

	if (figure.kind === "multiplier") return <Delta multiplier={figure.value} />;
	if (figure.kind === "coverage") return <Delta coverage={figure.value} />;
	if (figure.kind === "kb") return <Delta kb={figure.value} />;
	if (figure.kind === "percent") return <Delta percent={figure.value} />;

	// Odds are not a delta: nothing is gained or lost, and a sign would claim a
	// direction the figure does not have.
	return <Chip tone="muted">1 in {figure.oneIn}</Chip>;
};
