import { Dot } from "./Dot.ui";
import { RARITY_ORDER } from "./rarity";
import { Text } from "./Text.ui";

const LEGEND = "flex flex-wrap items-center gap-4 border-t border-edge pt-3";
const ITEM = "inline-flex items-center gap-2";

export const Legend = () => (
	<ul className={LEGEND}>
		{RARITY_ORDER.map((rarity) => (
			<li key={rarity} className={ITEM}>
				<Dot rarity={rarity} />
				<Text size="meta" tone="muted">
					{rarity}
				</Text>
			</li>
		))}
	</ul>
);
