import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";

const TRACK = "flex flex-wrap items-center gap-3";

const CELLS = "flex flex-wrap items-center gap-1.5";

export type SwatchTrackItem = { gate: number } & (
	| { state: "earned" | "current"; theme: string }
	| { state: "locked"; theme?: never }
);

export type SwatchTrackProps = {
	items: readonly SwatchTrackItem[];
};

// Gates carry their own number and count from 0, so the label reads against the
// last gate on the ladder, not against how many squares happen to be drawn.
const describe = (items: readonly SwatchTrackItem[]) => {
	const current = items.find(({ state }) => state === "current");
	if (current) return `gate ${current.gate} / ${items[items.length - 1].gate}`;

	const cleared = items.filter(({ state }) => state === "earned").length;
	return `${cleared} / ${items.length} gates cleared`;
};

export const SwatchTrack = ({ items }: SwatchTrackProps) => (
	<div className={TRACK}>
		<span className={CELLS} aria-hidden="true">
			{items.map(({ gate, state, theme }) => (
				<Swatch key={gate} size="pip" state={state} theme={theme} />
			))}
		</span>
		<Text size="meta" tone="muted">
			{describe(items)}
		</Text>
	</div>
);
