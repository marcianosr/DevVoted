import { Fragment, type ReactNode } from "react";

import { AUDIT, type AuditId } from "./audits";
import { Glyph } from "./Glyph.ui";
import { Storage, type StorageProps } from "./Storage.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchTrack, type SwatchTrackProps } from "./SwatchTrack.ui";
import { Text } from "./Text.ui";
import { plural } from "./format";

const HEADER = "flex flex-col gap-4 border-b border-edge px-5 py-4";
const IDENTITY = "flex flex-wrap items-start justify-between gap-4";
const NAME = "flex min-w-0 items-start gap-3";

const NAMING = "flex min-w-0 flex-col gap-0.5";

const BADGE = "mt-1";

const AUDITS = "flex flex-wrap items-center gap-1.5";
const NAMED = "inline-flex items-center gap-1";

export type GateHeaderProps = {
	title: ReactNode;
	/** Ids, not a sentence: the count is then read off the list rather than
	 * written beside it, where the two could disagree. */
	audits?: readonly AuditId[];
	storage?: StorageProps;
	track?: SwatchTrackProps;
};

const Audits = ({ audits }: { audits: readonly AuditId[] }) => (
	<span className={AUDITS}>
		<Text size="meta" tone="saffron">
			{plural(audits.length, "audit")}
		</Text>
		{audits.map((id) => (
			<Fragment key={id}>
				<Text size="meta" tone="saffron" aria-hidden>
					·
				</Text>
				<span className={NAMED}>
					<Glyph name={AUDIT[id].glyph} className="text-saffron" />
					<Text size="meta" tone="saffron">
						{AUDIT[id].label}
					</Text>
				</span>
			</Fragment>
		))}
	</span>
);

export const GateHeader = ({
	title,
	audits,
	storage,
	track,
}: GateHeaderProps) => (
	<header className={HEADER}>
		<div className={IDENTITY}>
			<div className={NAME}>
				<Swatch size="badge" state="pending" className={BADGE} />
				<div className={NAMING}>
					<Text as="h2" size="title">
						{title}
					</Text>
					{audits?.length ? <Audits audits={audits} /> : null}
				</div>
			</div>
			{storage ? <Storage {...storage} /> : null}
		</div>
		{track ? <SwatchTrack {...track} /> : null}
	</header>
);
