import { Fragment, type ReactNode } from "react";

import type { ConfigFigure } from "~/modules/run/config/domain/config.model";
import type {
	ConfigStatus,
	SkipReason,
} from "~/modules/run/config/domain/effect.model";

import { Action, type ActionProps } from "./Action.ui";
import { Chip } from "./Chip.ui";
import { Dot, type DotTone } from "./Dot.ui";
import { Entry } from "./Entry.ui";
import { figureLabel } from "./Figure.ui";
import { Fold } from "./Fold.ui";
import { Text } from "./Text.ui";
import { capLabel, signed, valueTone } from "./format";
import { type Rarity } from "./rarity";

const STRUCK = "line-through";
const VALUE = "flex items-center gap-2";
const LEAD = "inline-flex items-center";
const COUNTS = "flex items-center gap-1.5";

const SEPARATOR = "·";

const DOT_TONE = {
	online: "celadon",
	skipped: "muted",
	offline: "cinnabar",
} as const satisfies Record<ConfigStatus["kind"], DotTone>;

const COUNT_TONE = {
	online: "celadon",
	skipped: "muted",
	offline: "cinnabar",
} as const;

const SKIP_COPY = {
	openerOnly: "the gate's first poll only",
	paysAtGateClear: "pays at the gate clear",
	billsAtGateClear: "bills at the gate clear",
	inShop: "applies in the shop",
	noAuditToSuppress: "no audit to suppress here",
	runCapReached: "the run's storage cap is spent",
	notThisPoll: "not on this poll",
} as const satisfies Record<
	Exclude<SkipReason["kind"], "otherCategories">,
	string
>;

const CATEGORY_LIST = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
});

const skipCopy = (why: SkipReason): string =>
	why.kind === "otherCategories"
		? `${CATEGORY_LIST.format([...why.categories])} only`
		: SKIP_COPY[why.kind];

export type PipelineRow = {
	id: string;
	label: string;
	rarity: Rarity;
	status: ConfigStatus;
	figure?: ConfigFigure;
	remainingKb?: number;
	summary?: ReactNode;
	explainer?: string;
	action?: ActionProps;
	fired?: number;
	firedKb?: number;
};

export type PipelineProps = {
	configs: readonly PipelineRow[];
	defaultOpen?: boolean;
	settled?: boolean;
};

const isApplied = (row: PipelineRow): boolean =>
	row.fired !== undefined || row.firedKb !== undefined;

const StatusDot = ({ status }: { status: ConfigStatus }) => (
	<span className={LEAD}>
		<Dot tone={DOT_TONE[status.kind]} hollow={status.kind === "skipped"} />
		{status.kind === "online" ? <span className="sr-only">online</span> : null}
	</span>
);

const SettledDot = ({ row }: { row: PipelineRow }) => {
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

const paidOf = (row: PipelineRow) => (
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

const trailingOf = (row: PipelineRow, settled: boolean) => {
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
	configs: readonly PipelineRow[],
	settled: boolean
): readonly StatusCount[] => {
	const offline = configs.filter((row) => row.status.kind === "offline").length;

	if (!settled) {
		const online = configs.filter((row) => row.status.kind === "online").length;
		return [
			{ label: "will apply", tone: COUNT_TONE.online, total: online },
			{ label: "offline", tone: COUNT_TONE.offline, total: offline },
		].filter((count) => count.total > 0);
	}

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

export const Pipeline = ({
	configs,
	defaultOpen = true,
	settled = false,
}: PipelineProps) => (
	<Fold
		title="Pipeline"
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
					rarity={row.rarity}
					value={trailingOf(row, settled)}
					summary={row.summary}
					explainer={row.explainer}
				/>
			),
		}))}
	/>
);
