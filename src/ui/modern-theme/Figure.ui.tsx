import type { ConfigFigure } from "~/modules/run/config/domain/config.model";

import { Delta } from "./Delta.ui";
import { signed } from "./format";
import { Text } from "./Text.ui";

const PLAIN = "tabular-nums";

export const figureLabel = (figure: ConfigFigure): string => {
	if (figure.kind === "multiplier") return `×${figure.value}`;
	if (figure.kind === "coverage") return signed(figure.value);
	if (figure.kind === "kb") return `${signed(figure.value)} KB`;
	return `${signed(figure.value)}%`;
};

export type FigureProps = {
	figure?: ConfigFigure;
	plain?: boolean;
};

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

	return <Delta percent={figure.value} />;
};
