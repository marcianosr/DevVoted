import { Fragment, type ReactNode } from "react";

import { Crumb, type CrumbProps } from "./Crumb.ui";
import { Row } from "./Row.ui";

const BAR = "border-b border-edge bg-surface";
const SEPARATOR = "shrink-0 text-zinc-600";

export type TrailItem = CrumbProps & { id: string };

export type TrailProps = {
	items: readonly TrailItem[];
	label: string;
	trailing?: ReactNode;
};

export const Trail = ({ items, label, trailing }: TrailProps) => (
	<nav aria-label={label} className={BAR}>
		<Row spacing="compact" trailing={trailing}>
			{items.map(({ id, ...crumb }, index) => (
				<Fragment key={id}>
					{index > 0 ? (
						<span aria-hidden className={SEPARATOR}>
							›
						</span>
					) : null}
					<Crumb {...crumb} />
				</Fragment>
			))}
		</Row>
	</nav>
);
