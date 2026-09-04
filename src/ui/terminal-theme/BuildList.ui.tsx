import { clsx } from "clsx";

import { Dot, type DotVariant } from "./Dot.ui";
import { Figures } from "./Figures.ui";
import { IconButton } from "./IconButton.ui";
import { Meter } from "./Meter.ui";
import { Text } from "./Text.ui";

const LIST = "flex flex-col gap-3";
const LINE = "flex items-center gap-2";
const NAME = "min-w-0 flex-1 truncate";
const FIGURE = "shrink-0";
const ACTION_ROW = "flex flex-col gap-0.5 py-0.5";
const DETAIL = "pl-5";
const FOCUSED = "-mx-2 rounded-md bg-zinc-100/5 px-2";
const FOLD = "group/fold";
const FOLD_SUMMARY =
	"flex cursor-pointer list-none flex-col gap-1 py-0.5 select-none [&::-webkit-details-marker]:hidden";
const FOLD_CARET =
	"inline-block shrink-0 text-zinc-600 transition-transform group-open/fold:rotate-90";
const FOLD_BODY = "flex flex-col items-start gap-1.5 pt-1 pb-0.5 pl-5";
const SWAP_ICON = "⇄";
const SKIPPED = "group/skipped";
const SKIPPED_SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 py-0.5 select-none [&::-webkit-details-marker]:hidden";
const SKIPPED_CARET =
	"inline-block text-zinc-500 transition-transform group-open/skipped:rotate-90";
const SKIPPED_LIST = "flex flex-col gap-1.5 pt-1 pl-5";
const SKIPPED_ROW = "flex flex-col gap-0.5";
const TOTAL = "flex items-center gap-2 border-t border-edge pt-2";
const FOCUS_NOTE =
	"flex flex-col gap-0.5 border-t border-dashed border-edge pt-2";

export type BuildListRow = {
	name: string;
	detail: string;
	dot: DotVariant;
	figure?: string;
	meterPercent?: number;
	use?: {
		label: string;
		price: string;
		onUse?: () => void;
	};
	swap?: {
		label: string;
		onUse?: () => void;
	};
	focused?: boolean;
};

const SwapPress = ({ swap }: { swap: NonNullable<BuildListRow["swap"]> }) => (
	<IconButton
		label={swap.label}
		icon={SWAP_ICON}
		tone="cerulean"
		disabled={swap.onUse === undefined}
		onUse={swap.onUse}
	/>
);

export type BuildListProps = {
	rows: readonly BuildListRow[];
	total?: { label: string; value: string };
	skippedLabel?: string;
	className?: string;
};

const ActionRow = ({ row }: { row: BuildListRow }) => (
	<div className={clsx(ACTION_ROW, row.focused === true && FOCUSED)}>
		<span className={LINE}>
			<Dot variant={row.dot} />
			<Text className={NAME}>{row.name}</Text>
			{row.use === undefined ? null : (
				<IconButton
					label={`${row.use.label} · ${row.use.price}`}
					tone="cerulean"
					disabled={row.use.onUse === undefined}
					onUse={row.use.onUse}
				/>
			)}
		</span>
		<Text tone="muted" size="caption" className={DETAIL}>
			<Figures text={row.detail} />
		</Text>
	</div>
);

const RunningRow = ({ row }: { row: BuildListRow }) => (
	<details className={clsx(FOLD, row.focused === true && FOCUSED)}>
		<summary className={FOLD_SUMMARY}>
			<span className={LINE}>
				<Dot variant={row.dot} />
				<Text className={NAME}>{row.name}</Text>
				{row.figure === undefined ? null : (
					<span className={FIGURE}>
						{row.dot === "blocked" ? (
							<Text tone="cinnabar">{row.figure}</Text>
						) : (
							<Figures text={row.figure} />
						)}
					</span>
				)}
				<span aria-hidden className={FOLD_CARET}>
					›
				</span>
			</span>
			{row.meterPercent === undefined ? null : (
				<Meter percent={row.meterPercent} className="ml-5" />
			)}
		</summary>
		<div className={FOLD_BODY}>
			<Text tone="muted" size="caption">
				<Figures text={row.detail} />
			</Text>
			{row.swap === undefined ? null : <SwapPress swap={row.swap} />}
		</div>
	</details>
);

const SkippedFold = ({
	rows,
	label,
}: {
	rows: readonly BuildListRow[];
	label: string;
}) => (
	<details className={SKIPPED}>
		<summary className={SKIPPED_SUMMARY}>
			<span aria-hidden className={SKIPPED_CARET}>
				›
			</span>
			<Dot variant="off" />
			<Text tone="faint" size="caption" className={NAME}>
				{label} · {rows.length}
			</Text>
		</summary>
		<div className={SKIPPED_LIST}>
			{rows.map((row) => (
				<div key={row.name} className={SKIPPED_ROW}>
					<Text tone="muted" size="caption" className={NAME}>
						{row.name}
					</Text>
					<Text tone="faint" size="caption">
						<Figures text={row.detail} />
					</Text>
					{row.swap === undefined ? null : (
						<span className="pt-1">
							<SwapPress swap={row.swap} />
						</span>
					)}
				</div>
			))}
		</div>
	</details>
);

const focusedOf = (rows: readonly BuildListRow[]) =>
	rows.find((row) => row.focused === true);

export const BuildList = ({
	rows,
	total,
	skippedLabel = "Skipped",
	className,
}: BuildListProps) => {
	const usable = rows.filter((row) => row.dot === "action");
	const running = rows.filter(
		(row) => row.dot === "on" || row.dot === "blocked"
	);
	const out = rows.filter((row) => row.dot === "off");
	const focused = focusedOf(rows);

	return (
		<div className={clsx(LIST, className)}>
			{usable.map((row) => (
				<ActionRow key={row.name} row={row} />
			))}
			{running.map((row) => (
				<RunningRow key={row.name} row={row} />
			))}
			{out.length === 0 ? null : (
				<SkippedFold rows={out} label={skippedLabel} />
			)}
			{focused === undefined ? null : (
				<div className={FOCUS_NOTE}>
					<Text tone="default">{focused.name}</Text>
					<Text tone="muted" size="caption">
						{focused.detail}
					</Text>
				</div>
			)}
			{total === undefined ? null : (
				<span className={TOTAL}>
					<Text tone="muted" className={NAME}>
						{total.label}
					</Text>
					<span className={FIGURE}>
						<Figures text={total.value} />
					</span>
				</span>
			)}
		</div>
	);
};
