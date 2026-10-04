import type { ReactNode } from "react";

import { kbLabel } from "~/shared/lib/storage";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const COLUMN = "flex flex-col gap-3";
const LEAD = "text-sm text-theme-muted";
const LEAD_WORD = "font-extrabold text-theme";
const LEDGER = "flex flex-col gap-2";
const ROW = "flex items-center gap-3 text-sm";
const ROW_LABEL = "text-theme-muted";
const ROW_VALUE = "ml-auto flex shrink-0 items-center gap-2";
const ROW_TAIL = "text-theme-muted";

const GROWN_COLOR: KantoColor = "saffron";
const COST_COLOR: KantoColor = "cinnabar";
const FREE_COLOR: KantoColor = "viridian";
const NO_UPKEEP = 0;
const MINUS = "−";
const ARROW = "→";

const COPY = {
	doesNotFit: "Doesn't fit.",
	grows: "Installing grows your build.",
	billRises: "Your bill rises.",
	raises: "Installing raises what the build costs a gate.",
	weight: "weight",
	payNow: "pay now",
	upkeep: "upkeep",
	everyGate: "every gate",
	free: "free",
} as const;

export type BuildGrowth = {
	from: number;
	to: number;
	perGateKb: number;
};

export type InstallScaleProps = BuildGrowth & {
	price?: string;
};

export const ScaleColumn = ({ children }: { children: ReactNode }) => (
	<div className={COLUMN}>{children}</div>
);

export const ScaleLead = ({ bold, rest }: { bold: string; rest?: string }) => (
	<p className={LEAD}>
		<span className={LEAD_WORD}>{bold}</span>
		{rest === undefined ? null : ` ${rest}`}
	</p>
);

export const ScaleLedger = ({ children }: { children: ReactNode }) => (
	<dl className={LEDGER}>{children}</dl>
);

export const ScaleRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div className={ROW}>
		<dt className={ROW_LABEL}>{label}</dt>
		<dd className={ROW_VALUE}>{children}</dd>
	</div>
);

export const ScaleArrow = () => (
	<span aria-hidden className={ROW_TAIL}>
		{ARROW}
	</span>
);

export const PayNowRow = ({ price }: { price: string }) => (
	<ScaleRow label={COPY.payNow}>
		<Badge color={COST_COLOR}>{`${MINUS}${price}`}</Badge>
	</ScaleRow>
);

export const WeightRow = ({ from, to }: { from: number; to: number }) => (
	<ScaleRow label={COPY.weight}>
		<Badge>{from}</Badge>
		<ScaleArrow />
		<Badge color={GROWN_COLOR}>{to}</Badge>
	</ScaleRow>
);

export const UpkeepRow = ({ perGateKb }: { perGateKb: number }) => (
	<ScaleRow label={COPY.upkeep}>
		<UpkeepValue perGateKb={perGateKb} />
	</ScaleRow>
);

const UpkeepValue = ({ perGateKb }: { perGateKb: number }) =>
	perGateKb === NO_UPKEEP ? (
		<Badge color={FREE_COLOR}>{COPY.free}</Badge>
	) : (
		<>
			<Badge color={COST_COLOR}>{`${MINUS}${kbLabel(perGateKb)}`}</Badge>
			<span className={ROW_TAIL}>{COPY.everyGate}</span>
		</>
	);

export const InstallScale = ({
	from,
	to,
	perGateKb,
	price,
}: InstallScaleProps) => {
	const grows = from !== to;

	return (
		<ScaleColumn>
			<ScaleLead
				bold={grows ? COPY.doesNotFit : COPY.billRises}
				rest={grows ? COPY.grows : COPY.raises}
			/>
			<ScaleLedger>
				{!grows ? null : <WeightRow from={from} to={to} />}
				{price === undefined ? null : <PayNowRow price={price} />}
				<UpkeepRow perGateKb={perGateKb} />
			</ScaleLedger>
		</ScaleColumn>
	);
};
