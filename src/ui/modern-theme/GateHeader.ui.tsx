import { Fragment, type ReactNode } from "react";

import { AUDIT, type AuditId } from "./audits";
import { Glyph } from "./Glyph.ui";
import { Meter } from "./Meter.ui";
import { Storage, type StorageProps } from "./Storage.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchTrack, type SwatchTrackProps } from "./SwatchTrack.ui";
import { Text } from "./Text.ui";
import { plural } from "./format";

const HEADER = "flex flex-col gap-1 border-b border-edge px-5 py-4";
const IDENTITY = "flex flex-wrap items-start justify-between gap-4";
const NAME = "flex min-w-0 items-start gap-3";

const PROGRESS = "flex flex-wrap items-center justify-between gap-x-8 gap-y-2";
const COVERAGE = "flex items-center gap-3";
const BAR = "w-40 sm:w-56";

const NAMING = "flex min-w-0 flex-col gap-0.5";

const BADGE = "mt-1";

const AUDITS = "flex flex-wrap items-center gap-1.5";
const NAMED = "inline-flex items-center gap-1";

export type GateCoverage = {
	held: number;
	projected: number;
	required: number;
};

export type GateHeaderProps = {
	title: ReactNode;
	audits?: readonly AuditId[];
	storage?: StorageProps;
	track?: SwatchTrackProps;
	coverage?: GateCoverage;
};

const Coverage = ({ held, projected, required }: GateCoverage) => (
	<div className={COVERAGE}>
		<Text size="meta" tone="muted">
			Coverage
		</Text>
		<Text size="meta">
			{held} / {required}%
		</Text>
		<span className={BAR}>
			<Meter
				held={held}
				projected={projected}
				max={required}
				label={`${held} percent covered of ${required} required`}
			/>
		</span>
	</div>
);

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
	coverage,
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
		{track || coverage ? (
			<div className={PROGRESS}>
				{track ? <SwatchTrack {...track} /> : null}
				{coverage ? <Coverage {...coverage} /> : null}
			</div>
		) : null}
	</header>
);
