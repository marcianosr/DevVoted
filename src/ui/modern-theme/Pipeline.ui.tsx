import { Fragment } from "react";

import type { ConfigFigure } from "~/modules/run/config/domain/config.model";
import type {
	ConfigStatus,
	SkipReason,
} from "~/modules/run/config/domain/effect.model";

import { Action, type ActionProps } from "./Action.ui";
import { Dot, type DotTone } from "./Dot.ui";
import { Entry } from "./Entry.ui";
import { Figure } from "./Figure.ui";
import { Fold } from "./Fold.ui";
import { Text } from "./Text.ui";
import { capLabel } from "./format";
import { type Rarity } from "./rarity";

const STRUCK = "line-through";
const VALUE = "flex items-center gap-2";
const LEAD = "inline-flex items-center";
const COUNTS = "flex items-center gap-1.5";

const SEPARATOR = "·";

/** The build's own order, so a row does not move when its status changes. */
const KINDS = ["online", "skipped", "offline"] as const;

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
	summary?: string;
	explainer?: string;
	action?: ActionProps;
};

export type PipelineProps = {
	configs: readonly PipelineRow[];
	defaultOpen?: boolean;
};

const StatusDot = ({ status }: { status: ConfigStatus }) => (
	<span className={LEAD}>
		<Dot tone={DOT_TONE[status.kind]} hollow={status.kind === "skipped"} />
		{status.kind === "online" ? <span className="sr-only">online</span> : null}
	</span>
);

const trailingOf = (row: PipelineRow) => {
	if (row.status.kind === "offline")
		return (
			<Text size="meta" tone="cinnabar">
				{`offline ${SEPARATOR} ${row.status.audit}`}
			</Text>
		);
	if (row.status.kind === "skipped")
		return (
			<Text size="meta" tone="muted">
				{`skipped ${SEPARATOR} ${skipCopy(row.status.why)}`}
			</Text>
		);
	return (
		<span className={VALUE}>
			{row.remainingKb === undefined ? null : (
				<Text size="meta" tone="muted">
					{`${capLabel(row.remainingKb)} left`}
				</Text>
			)}
			{row.action ? <Action {...row.action} /> : <Figure figure={row.figure} />}
		</span>
	);
};

const countsOf = (configs: readonly PipelineRow[]) =>
	KINDS.flatMap((kind) => {
		const total = configs.filter((row) => row.status.kind === kind).length;
		// A zero is not a state the build is in; the fold would read as a legend.
		return total === 0 ? [] : [{ kind, total }];
	});

export const Pipeline = ({ configs, defaultOpen = true }: PipelineProps) => (
	<Fold
		title="Pipeline"
		defaultOpen={defaultOpen}
		value={
			<span className={COUNTS}>
				{countsOf(configs).map((count, index) => (
					<Fragment key={count.kind}>
						{index > 0 ? (
							<Text size="meta" tone="muted">
								{SEPARATOR}
							</Text>
						) : null}
						<Text size="meta" tone={COUNT_TONE[count.kind]}>
							{`${count.total} ${count.kind}`}
						</Text>
					</Fragment>
				))}
			</span>
		}
		items={configs.map((row) => ({
			id: row.id,
			content: (
				<Entry
					leading={<StatusDot status={row.status} />}
					label={
						row.status.kind === "offline" ? (
							<span className={STRUCK}>{row.label}</span>
						) : (
							row.label
						)
					}
					rarity={row.rarity}
					value={trailingOf(row)}
					summary={row.summary}
					explainer={row.explainer}
				/>
			),
		}))}
	/>
);
