import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Text } from "./Text.ui";

const CHANGE = "inline-flex items-center gap-1 whitespace-nowrap";
const PROJECTED = "border-dashed";

export type ChangeStep = {
	from: string;
	to: string;
};

export type ChangeProps = ChangeStep & {
	projected?: boolean;
	className?: string;
};

export const Change = ({
	from,
	to,
	projected = false,
	className,
}: ChangeProps) => (
	<span className={clsx(CHANGE, className)}>
		<Badge tone="muted">{from}</Badge>
		<Text tone="faint" size="caption" aria-hidden>
			→
		</Text>
		<Badge tone="viridian" className={projected ? PROJECTED : undefined}>
			{to}
		</Badge>
	</span>
);
