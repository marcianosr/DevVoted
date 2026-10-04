import { clsx } from "clsx";

import { Audit } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import { Climber, type ClimberProps } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";

const PARTIES = "flex min-w-0 flex-wrap items-center gap-2 text-sm";
const PARTY = "flex items-center gap-1.5 font-bold text-theme-soft";
const ARROW = "text-theme-muted";
const ROW = "flex w-full flex-col gap-2";
const OWN_ROW = "ring-1 ring-inset ring-theme-soft";

export type IncidentStatusLabel =
	"queued" | "locked" | "survived" | "failed" | "lapsed";

const STATUS_COLOR = {
	queued: "pewter",
	locked: "saffron",
	survived: "viridian",
	failed: "cinnabar",
	lapsed: "pewter",
} satisfies Record<IncidentStatusLabel, KantoColor>;

export type IncidentParty = Pick<
	ClimberProps,
	"userId" | "name" | "photoUrl" | "borderUrl" | "you"
>;

const Party = ({ party }: { party: IncidentParty }) => (
	<span className={PARTY}>
		<Climber {...party} />
		{party.name}
	</span>
);

export type IncidentRowProps = {
	id: number;
	sentBy: IncidentParty;
	target: IncidentParty;
	code: number;
	name: string;
	gate: string;
	status: IncidentStatusLabel;
	own?: boolean;
};

export type IncidentsPanelProps = {
	title: string;
	summary: string;
	rows: readonly IncidentRowProps[];
	empty: string;
};

const IncidentRow = ({
	sentBy,
	target,
	code,
	name,
	gate,
	status,
	own = false,
}: IncidentRowProps) => (
	<Panel.Row
		className={clsx(own && OWN_ROW)}
		trailing={<Badge color={STATUS_COLOR[status]}>{status}</Badge>}
	>
		<div className={ROW}>
			<span className={PARTIES}>
				<Party party={sentBy} />
				<span className={ARROW} aria-hidden>
					→
				</span>
				<Party party={target} />
			</span>
			<Audit code={code} name={name} cue={gate} layout="row" />
		</div>
	</Panel.Row>
);

export const IncidentsPanel = ({
	title,
	summary,
	rows,
	empty,
}: IncidentsPanelProps) => (
	<Panel>
		<Panel.Header label={title} summary={rows.length === 0 ? empty : summary} />
		{rows.length === 0 ? null : (
			<Panel.Rows>
				{rows.map((row) => (
					<IncidentRow key={row.id} {...row} />
				))}
			</Panel.Rows>
		)}
	</Panel>
);
