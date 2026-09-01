import { Fragment, type ReactNode } from "react";

import type { ConfigFigure } from "~/modules/run/config/domain/config.model";
import type { ConfigStatus } from "~/modules/run/config/domain/effect.model";

import { Action, type ActionProps } from "./Action.ui";
import { Chip } from "./Chip.ui";
import { Dot, type DotTone } from "./Dot.ui";
import { Entry } from "./Entry.ui";
import { figureLabel } from "./Figure.ui";
import { Fold } from "./Fold.ui";
import { skipCopy } from "./status";
import { Text } from "./Text.ui";
import { capLabel, signed, valueTone } from "./format";

const STRUCK = "line-through";
const VALUE = "flex items-center gap-2";
const LEAD = "inline-flex items-center";
const COUNTS = "flex items-center gap-1.5";

const SEPARATOR = "·";

const DOT_TONE = {
	online: "celadon",
	unknown: "muted",
	skipped: "muted",
	offline: "cinnabar",
} as const satisfies Record<ConfigStatus["kind"], DotTone>;

const COUNT_TONE = {
	online: "celadon",
	unknown: "muted",
	skipped: "muted",
	offline: "cinnabar",
} as const;

export type BuildRow = {
	id: string;
	label: string;
	slots: number;
	status: ConfigStatus;
	figure?: ConfigFigure;
	remainingKb?: number;
	summary?: ReactNode;
	explainer?: string;
	action?: ActionProps;
	fired?: number;
	firedKb?: number;
};

export type BuildProps = {
	configs: readonly BuildRow[];
	defaultOpen?: boolean;
	settled?: boolean;
};

const isApplied = (row: BuildRow): boolean =>
	row.fired !== undefined || row.firedKb !== undefined;

const StatusDot = ({ status }: { status: ConfigStatus }) => (
	<span className={LEAD}>
		<Dot
			tone={DOT_TONE[status.kind]}
			hollow={status.kind === "skipped" || status.kind === "unknown"}
		/>
		{status.kind === "online" ? <span className="sr-only">online</span> : null}
	</span>
);

const SettledDot = ({ row }: { row: BuildRow }) => {
	if (row.status.kind === "offline") return <StatusDot status={row.status} />;
	return (
		<span className={LEAD}>
			<Dot
				tone={isApplied(row) ? "celadon" : "muted"}
				hollow={!isApplied(row)}
			/>
			{isApplied(row) ? <span className="sr-only">applied</span> : null}
		</span>
	);
};

const paidOf = (row: BuildRow) => (
	<span className={VALUE}>
		{row.remainingKb === undefined ? null : (
			<Text size="meta" tone="muted">
				{`${capLabel(row.remainingKb)} left`}
			</Text>
		)}
		{row.fired === undefined ? null : (
			<Chip tone={valueTone(row.fired)}>{`paid ${signed(row.fired)}`}</Chip>
		)}
		{row.firedKb === undefined ? null : (
			<Chip tone={valueTone(row.firedKb)}>
				{`paid ${signed(row.firedKb)} KB`}
			</Chip>
		)}
	</span>
);

const trailingOf = (row: BuildRow, settled: boolean) => {
	if (row.status.kind === "offline")
		return (
			<Text size="meta" tone="cinnabar">
				{`offline ${SEPARATOR} ${row.status.audit}`}
			</Text>
		);
	if (row.status.kind === "skipped")
		return (
			<Text size="meta" tone="muted">
				{skipCopy(row.status.why)}
			</Text>
		);
	if (settled) {
		if (isApplied(row)) return paidOf(row);
		return (
			<Text size="meta" tone="muted">
				unused
			</Text>
		);
	}
	return (
		<span className={VALUE}>
			{row.remainingKb === undefined ? null : (
				<Text size="meta" tone="muted">
					{`${capLabel(row.remainingKb)} left`}
				</Text>
			)}
			{row.action ? (
				<Action {...row.action} />
			) : row.figure ? (
				<Chip tone="muted" outline>
					{figureLabel(row.figure)}
				</Chip>
			) : null}
		</span>
	);
};

type StatusCount = {
	label: string;
	tone: (typeof COUNT_TONE)[keyof typeof COUNT_TONE];
	total: number;
};

const countsOf = (
	configs: readonly BuildRow[],
	settled: boolean
): readonly StatusCount[] => {
	const offline = configs.filter((row) => row.status.kind === "offline").length;

	if (!settled)
		return [
			{ label: "offline", tone: COUNT_TONE.offline, total: offline },
		].filter((count) => count.total > 0);

	const applied = configs.filter(isApplied).length;
	return [
		{ label: "applied", tone: COUNT_TONE.online, total: applied },
		{
			label: "skipped",
			tone: COUNT_TONE.skipped,
			total: configs.length - applied - offline,
		},
		{ label: "offline", tone: COUNT_TONE.offline, total: offline },
	].filter((count) => count.total > 0);
};

export const Build = ({
	configs,
	defaultOpen = true,
	settled = false,
}: BuildProps) => (
	<Fold
		title="Build"
		defaultOpen={defaultOpen}
		value={
			<span className={COUNTS}>
				{countsOf(configs, settled).map((count, index) => (
					<Fragment key={count.label}>
						{index > 0 ? (
							<Text size="meta" tone="muted">
								{SEPARATOR}
							</Text>
						) : null}
						<Text size="meta" tone={count.tone}>
							{`${count.total} ${count.label}`}
						</Text>
					</Fragment>
				))}
			</span>
		}
		items={configs.map((row) => ({
			id: row.id,
			content: (
				<Entry
					leading={
						settled ? (
							<SettledDot row={row} />
						) : (
							<StatusDot status={row.status} />
						)
					}
					label={
						row.status.kind === "offline" ? (
							<span className={STRUCK}>{row.label}</span>
						) : (
							row.label
						)
					}
					slots={row.slots}
					value={trailingOf(row, settled)}
					summary={row.summary}
					explainer={row.explainer}
				/>
			),
		}))}
	/>
);
