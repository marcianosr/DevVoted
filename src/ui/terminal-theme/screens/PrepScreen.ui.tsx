import { Fragment } from "react";

import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { type AuditNote, SUPPRESSED_CUE } from "../Audits.ui";
import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import { CoverageBar } from "../CoverageBar.ui";
import { DexChip } from "../DexChip.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { IconButton } from "../IconButton.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
import { Redacted } from "../Redacted.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";

const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const CALLOUT =
	"flex items-center justify-between gap-4 rounded-lg border border-edge px-3 py-2 @max-md:flex-col @max-md:items-stretch @max-md:gap-3 @max-md:py-3";
const BUILD_TRACK = "border-b border-edge py-2";
const AUDIT_LIST = "flex flex-col items-end gap-0.5";
const BLANKS = "flex flex-wrap items-center justify-end gap-1";
const TALLY = "flex flex-wrap items-center justify-end gap-x-2";
const TALLY_ITEM = "flex items-center gap-1";
const UNDER = "pl-4";
const AUDIT_LINE = "flex flex-wrap items-center justify-end gap-x-2";
const STRUCK = "line-through";
const PICK = "flex items-center gap-2";
const MOVES = "flex items-center gap-1";

const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

const segmentsOf = (
	rows: readonly { slots: number }[]
): readonly SlotSegment[] => rows.map((row) => ({ slots: row.slots }));

export type PrepBuildRow = {
	name: string;
	detail: string;
	slots: number;
	version: number;
	maxVersion: number;
};

export type PrepTally = {
	label: string;
	count: number;
};

export type PrepAudit = {
	label: string;
	suppressed?: boolean;
	suppressedBy?: AuditNote["suppressedBy"];
};

export type RebaseSlot = {
	id: string;
	category: string;
	coverage: string;
};

export type BillRow = {
	name: string;
	figure: string;
	note?: string;
};

const BULLET = (
	<Text tone="faint" aria-hidden>
		•
	</Text>
);

const Label = ({ text }: { text: string }) => (
	<Text tone="muted" size="caption">
		{text}
	</Text>
);

const AuditReading = ({ audits }: { audits: readonly PrepAudit[] }) => {
	if (audits.length === 0)
		return (
			<Text tone="muted" size="caption">
				none
			</Text>
		);

	return (
		<span className={AUDIT_LIST}>
			{audits.map((audit) => (
				<span key={audit.label} className={AUDIT_LINE}>
					<Text
						tone={audit.suppressed === true ? "faint" : "saffron"}
						size="caption"
						className={clsx(audit.suppressed === true && STRUCK)}
					>
						{audit.label}
					</Text>
					{audit.suppressed === true ? (
						<Text tone="viridian" size="caption">
							{SUPPRESSED_CUE}
						</Text>
					) : null}
					{audit.suppressedBy === undefined ? null : (
						<DexChip
							slots={audit.suppressedBy.slots}
							label={audit.suppressedBy.label}
							version={audit.suppressedBy.version}
							maxVersion={audit.suppressedBy.maxVersion}
							className="shrink-0 py-0 text-xs"
						/>
					)}
				</span>
			))}
		</span>
	);
};

const Count = ({ value }: { value: number }) => (
	<Text tone="viridian" size="caption">
		{value}
	</Text>
);

const Divider = () => (
	<Text tone="faint" size="caption" aria-hidden>
		·
	</Text>
);

const Source = ({ label }: { label?: string }) =>
	label === undefined ? null : <Badge tone="neutral">{label}</Badge>;

const TallyLine = ({
	items,
	countFirst = false,
}: {
	items: readonly PrepTally[];
	countFirst?: boolean;
}) => (
	<span className={TALLY}>
		{items.map((item, index) => (
			<Fragment key={item.label}>
				{index === 0 ? null : <Divider />}
				<span className={TALLY_ITEM}>
					{countFirst ? <Count value={item.count} /> : null}
					<Text tone="muted" size="caption">
						{item.label}
					</Text>
					{countFirst ? null : <Count value={item.count} />}
				</span>
			</Fragment>
		))}
	</span>
);

const CountLine = ({ values }: { values: readonly number[] }) => (
	<span className={TALLY}>
		{values.map((value, position) => (
			<Fragment key={`${value}-${position}`}>
				{position === 0 ? null : <Divider />}
				<Count value={value} />
			</Fragment>
		))}
	</span>
);

const Blanks = ({ count }: { count: number }) => (
	<span className={BLANKS}>
		{Array.from({ length: count }, (_, position) => (
			<Redacted key={position} label="?" />
		))}
	</span>
);

const Revealed = ({
	items,
	countFirst = false,
	source,
	blanks,
}: {
	items?: readonly PrepTally[];
	countFirst?: boolean;
	source?: string;
	blanks?: number;
}) => {
	if (items === undefined)
		return blanks === undefined ? <Redacted /> : <Blanks count={blanks} />;

	return (
		<>
			<TallyLine items={items} countFirst={countFirst} />
			<Source label={source} />
		</>
	);
};

const RevealedCounts = ({
	values,
	source,
}: {
	values?: readonly number[];
	source?: string;
}) => {
	if (values === undefined) return <Redacted />;

	return (
		<>
			<CountLine values={values} />
			<Source label={source} />
		</>
	);
};

const BillTrailing = ({ row }: { row: BillRow }) => (
	<>
		<PriceTag label={row.figure} variant="bill" />
		{row.note === undefined ? null : (
			<Text tone="muted" size="caption">
				{row.note}
			</Text>
		)}
	</>
);

const RebaseList = ({
	slots,
	onMove,
}: {
	slots: readonly RebaseSlot[];
	onMove?: (from: number, to: number) => void;
}) => (
	<div className="divide-y divide-edge">
		{slots.map((slot, index) => (
			<Row
				key={slot.id}
				name={
					<span className={PICK}>
						<Text tone="faint" size="caption">
							pick
						</Text>
						<Badge tone="neutral">{slot.category}</Badge>
						<Text tone="muted" size="caption">
							{slot.coverage} coverage
						</Text>
					</span>
				}
				trailing={
					<span className={MOVES}>
						<IconButton
							icon="↑"
							iconOnly
							tone="cerulean"
							label="Move up"
							hint={`Move ${slot.category} up`}
							disabled={index === 0}
							onUse={() => onMove?.(index, index - 1)}
						/>
						<IconButton
							icon="↓"
							iconOnly
							tone="cerulean"
							label="Move down"
							hint={`Move ${slot.category} down`}
							disabled={index === slots.length - 1}
							onUse={() => onMove?.(index, index + 1)}
						/>
					</span>
				}
			/>
		))}
	</div>
);

export type PrepScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	ready: {
		note: string;
	};
	build: {
		slots: number;
		slotsUsed: number;
		rows: readonly PrepBuildRow[];
	};
	window: {
		title: string;
		swatch?: SwatchTheme;
		target: {
			reading: string;
			held: number;
			demand: number;
		};
		polls: string;
		pollCount: number;
		source?: string;
		pollTypes?: readonly PrepTally[];
		optionCounts?: readonly number[];
		audits: readonly PrepAudit[];
		categories?: readonly PrepTally[];
		nextCategories?: readonly PrepTally[];
	};
	rebase?: {
		label: string;
		note: string;
		slots: readonly RebaseSlot[];
		onMove?: (from: number, to: number) => void;
	};
	bills?: {
		meta: string;
		rows: readonly BillRow[];
		total: BillRow;
	};
	onClear: {
		reward: string;
		swatchLabel: string;
		swatch?: SwatchTheme;
		missPenalty: string;
	};
	footer: {
		changeLabel: string;
		onChange?: () => void;
		communityLabel: string;
		onCommunity?: () => void;
		startLabel: string;
		onStart?: () => void;
	};
};

export const PrepScreen = ({
	header,
	theme,
	ready,
	build,
	window,
	rebase,
	bills,
	onClear,
	footer,
}: PrepScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		<div className={CALLOUT}>
			<Text tone="muted">{ready.note}</Text>
		</div>

		<div className={COLUMNS}>
			<div className="@container">
				<Section label="Build">
					<div className={BUILD_TRACK}>
						<SlotTrack segments={segmentsOf(build.rows)} slots={build.slots} />
					</div>
					<div className="divide-y divide-edge">
						<Row
							name={<Label text="configs" />}
							trailing={<Text>{build.rows.length}</Text>}
						/>
						<Row
							name={<Label text="slots" />}
							trailing={
								<Text>
									{build.slotsUsed} / {build.slots}
								</Text>
							}
						/>
						{build.rows.map((row) => (
							<Row
								key={row.name}
								name={
									<DexChip
										slots={row.slots}
										label={row.name}
										version={row.version}
										maxVersion={row.maxVersion}
									/>
								}
								detail={row.detail}
							/>
						))}
					</div>
				</Section>

				{rebase === undefined ? null : (
					<Section label={rebase.label} meta={rebase.note} divided>
						<RebaseList slots={rebase.slots} onMove={rebase.onMove} />
					</Section>
				)}
			</div>

			<div className="@container">
				<Section
					label={window.title}
					mark={<Swatch theme={window.swatch} state="pending" size="badge" />}
					divided
				>
					<Row
						name={<Label text="target" />}
						trailing={
							<>
								<Text tone="muted" size="caption">
									{window.target.reading}
								</Text>
								<CoverageBar
									held={window.target.held}
									demand={window.target.demand}
								/>
							</>
						}
					/>
					<div>
						<Row
							name={<Label text="polls" />}
							trailing={<Text>{window.polls}</Text>}
						/>
						<Row
							className={UNDER}
							name={<Label text="type" />}
							trailing={
								<Revealed
									items={window.pollTypes}
									countFirst
									source={window.source}
								/>
							}
						/>
						<Row
							className={UNDER}
							name={<Label text="options" />}
							trailing={
								<RevealedCounts
									values={window.optionCounts}
									source={window.source}
								/>
							}
						/>
						<Row
							className={UNDER}
							name={<Label text="categories" />}
							trailing={
								<Revealed
									items={window.categories}
									source={window.source}
									blanks={window.pollCount}
								/>
							}
						/>
						{window.nextCategories === undefined ? null : (
							<Row
								className={UNDER}
								name={<Label text="next gate" />}
								trailing={
									<Revealed
										items={window.nextCategories}
										source={window.source}
									/>
								}
							/>
						)}
					</div>
					<Row
						name={<Label text="audits" />}
						trailing={<AuditReading audits={window.audits} />}
					/>
				</Section>

				{bills === undefined ? null : (
					<Section label="Bills" meta={bills.meta} divided>
						{bills.rows.map((row) => (
							<Row
								key={row.name}
								leading={BULLET}
								name={row.name}
								trailing={<BillTrailing row={row} />}
							/>
						))}
						<Row
							leading={BULLET}
							name={<Text className="font-bold">{bills.total.name}</Text>}
							trailing={<BillTrailing row={bills.total} />}
						/>
					</Section>
				)}

				<Section label="On a clear" divided>
					<Row
						name="Gate cleared"
						trailing={<Badge tone="viridian">{onClear.reward}</Badge>}
					/>
					<Row
						name="Swatch"
						trailing={
							<>
								<Text tone="muted">{onClear.swatchLabel}</Text>
								<Swatch theme={onClear.swatch} state="pending" />
							</>
						}
					/>
					<Row
						name="Gate missed"
						trailing={<Badge tone="cinnabar">{onClear.missPenalty}</Badge>}
					/>
				</Section>
			</div>
		</div>

		<footer className={FOOTER}>
			<span className="flex flex-wrap items-center gap-3">
				<Button label={footer.changeLabel} onUse={footer.onChange} />
				<Button label={footer.communityLabel} onUse={footer.onCommunity} />
			</span>
			<Button
				label={footer.startLabel}
				variant="primary"
				className="@max-md:w-full"
				onUse={footer.onStart}
			/>
		</footer>
	</Panel>
);
