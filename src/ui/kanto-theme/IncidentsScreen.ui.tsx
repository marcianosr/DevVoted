import { clsx } from "clsx";

import { Audit } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const HEADER = "flex w-full flex-col gap-1";
const PARTIES = "flex min-w-0 flex-wrap items-baseline gap-2 text-sm";
const SENDER = "font-bold text-theme-soft";
const ARROW = "text-theme-muted";
const TARGET = "font-bold text-theme-soft";
const ROW = "flex w-full flex-col gap-2";
const OWN_ROW = "ring-1 ring-inset ring-theme-soft";

/** Audits are saffron throughout the kit; a log of them wears the same colour. */
const SCREEN_COLOR: KantoColor = "saffron";

export type IncidentStatusLabel =
	"queued" | "locked" | "survived" | "failed" | "lapsed";

const STATUS_COLOR = {
	queued: "pewter",
	locked: "saffron",
	survived: "viridian",
	failed: "cinnabar",
	lapsed: "pewter",
} satisfies Record<IncidentStatusLabel, KantoColor>;

export type IncidentRowProps = {
	id: number;
	sentBy: string;
	target: string;
	code: number;
	name: string;
	/** Where it lands, as the row states it: "gate 6 · Soul". */
	gate: string;
	status: IncidentStatusLabel;
	/** The viewer fired it or is its target. */
	own?: boolean;
};

export type IncidentsScreenProps = {
	title: string;
	subtitle: string;
	rows: readonly IncidentRowProps[];
	empty: string;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
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
				<span className={SENDER}>{sentBy}</span>
				<span className={ARROW} aria-hidden>
					→
				</span>
				<span className={TARGET}>{target}</span>
			</span>
			<Audit code={code} name={name} cue={gate} layout="row" />
		</div>
	</Panel.Row>
);

export const IncidentsScreen = ({
	title,
	subtitle,
	rows,
	empty,
	footer,
	width,
	ground = "bare",
}: IncidentsScreenProps) => (
	<Screen theme={SCREEN_COLOR} width={width} ground={ground}>
		<header className={HEADER}>
			<Typography variant="headline" as="h1">
				{title}
			</Typography>
			<Typography variant="hint" as="span">
				{subtitle}
			</Typography>
		</header>

		<Panel>
			{rows.length === 0 ? (
				<Panel.Body>
					<Typography variant="hint">{empty}</Typography>
				</Panel.Body>
			) : (
				<Panel.Rows>
					{rows.map((row) => (
						<IncidentRow key={row.id} {...row} />
					))}
				</Panel.Rows>
			)}
		</Panel>

		<Panel>
			<Panel.Body>
				<ScreenFooter {...footer} rule={false} />
			</Panel.Body>
		</Panel>
	</Screen>
);
