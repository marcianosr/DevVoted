import type { ReactNode } from "react";

import { Storage, type StorageProps } from "./Storage.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchTrack, type SwatchTrackItem } from "./SwatchTrack.ui";
import { Text } from "./Text.ui";

const HEADER = "flex flex-col gap-4 border-b border-edge px-5 py-4";
const IDENTITY = "flex flex-wrap items-start justify-between gap-4";
const NAME = "flex min-w-0 items-start gap-3";

// Title and audit share a column so the audit line hangs off the title rather
// than the swatch; the indent falls out of the layout instead of a padding.
const NAMING = "flex min-w-0 flex-col gap-0.5";

// Optically centres the square on the title's first line, which items-start
// alone cannot do once a second line exists below it.
const BADGE = "mt-1";

export type GateHeaderProps = {
	title: ReactNode;
	audit?: ReactNode;
	storage?: StorageProps;
	track?: readonly SwatchTrackItem[];
};

export const GateHeader = ({
	title,
	audit,
	storage,
	track,
}: GateHeaderProps) => (
	<header className={HEADER}>
		<div className={IDENTITY}>
			<div className={NAME}>
				<Swatch size="badge" className={BADGE} />
				<div className={NAMING}>
					<Text as="h2" size="title">
						{title}
					</Text>
					{audit ? (
						<Text size="meta" tone="saffron">
							{audit}
						</Text>
					) : null}
				</div>
			</div>
			{storage ? <Storage {...storage} /> : null}
		</div>
		{track ? <SwatchTrack items={track} /> : null}
	</header>
);
