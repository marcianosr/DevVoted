import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export type DexPanelProps = {
	label: string;
	count: string;
	meta: string;
	note: string;
	trailing?: ReactNode;
	children: ReactNode;
};

export const DexPanel = ({
	label,
	count,
	meta,
	note,
	trailing,
	children,
}: DexPanelProps) => (
	<Panel>
		<Panel.Header
			label={label}
			meta={
				<>
					{meta}
					<Badge>{count}</Badge>
				</>
			}
			trailing={trailing}
		/>
		<Panel.Body>
			<Typography variant="hint">{note}</Typography>
		</Panel.Body>
		{children}
	</Panel>
);
