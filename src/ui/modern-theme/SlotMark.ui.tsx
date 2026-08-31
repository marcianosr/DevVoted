import { plural } from "./format";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const MARK = "shrink-0 tabular-nums text-zinc-400";

export type SlotMarkProps = {
	slots: number;
	hint?: string;
};

export const SlotMark = ({ slots, hint }: SlotMarkProps) => {
	const mark = (
		<span className={MARK}>
			<Text size="meta" tone="inherit">
				{plural(slots, "slot")}
			</Text>
		</span>
	);

	return hint === undefined ? mark : <Tooltip hint={hint}>{mark}</Tooltip>;
};
