import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export type DexPanelProps = {
	label: string;
	count: string;
	meta: string;
	note: string;
	children: ReactNode;
};

export const DexPanel = ({
	label,
	count,
	meta,
	note,
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
		/>
		{children}
		<Panel.Footer>
			<Typography variant="hint">{note}</Typography>
		</Panel.Footer>
	</Panel>
);
