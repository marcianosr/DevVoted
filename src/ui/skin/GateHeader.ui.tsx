import type { ReactNode } from "react";

import { Row } from "./Row.ui";
import { Streak, type StreakProps } from "./Streak.ui";
import { Subtitle } from "./Subtitle.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchTrack, type SwatchTrackItem } from "./SwatchTrack.ui";
import { Title } from "./Title.ui";

const HEADER = "border-b border-edge bg-surface";

// A separate element rather than border-t: border-theme and border-edge both set
// every side, so stacking them on one box makes the winner a cascade accident.
const RAIL = "h-1 bg-theme";

const HEADING = "flex flex-col gap-0.5";
const ASIDE = "flex items-center gap-4";

export type GateHeaderProps = {
	title: ReactNode;
	detail: ReactNode;
	streak?: StreakProps;
	gates?: readonly SwatchTrackItem[];
	count?: ReactNode;
};

export const GateHeader = ({
	title,
	detail,
	streak,
	gates,
	count,
}: GateHeaderProps) => (
	<header className={HEADER}>
		<div className={RAIL} />
		<Row
			spacing="spacious"
			leading={<Swatch size="badge" state="earned" />}
			trailing={
				<span className={ASIDE}>
					{streak ? <Streak {...streak} /> : null}
					{gates?.length ? <SwatchTrack items={gates} /> : null}
					{count ? <Subtitle>{count}</Subtitle> : null}
				</span>
			}
		>
			<span className={HEADING}>
				<Title as="h2">{title}</Title>
				<Subtitle>{detail}</Subtitle>
			</span>
		</Row>
	</header>
);
