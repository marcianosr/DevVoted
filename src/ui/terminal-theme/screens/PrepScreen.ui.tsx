import { Fragment } from "react";

import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import { CoverageBar } from "../CoverageBar.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
import { Redacted } from "../Redacted.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { Slots } from "../Slots.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import { Version } from "../Version.ui";

const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const CALLOUT =
	"flex items-center justify-between gap-4 rounded-lg border border-edge px-3 py-2 @max-md:flex-col @max-md:items-stretch @max-md:gap-3 @max-md:py-3";
const BUILD_TRACK = "border-b border-edge py-2";
const AUDIT_LIST = "flex flex-col items-end gap-0.5";
const TALLY = "flex flex-wrap items-center justify-end gap-x-2";
const TALLY_ITEM = "flex items-center gap-1";
const UNDER = "pl-4";
const AUDIT_LINE = "flex flex-wrap items-center justify-end gap-x-2";
const STRUCK = "line-through";
const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

const segmentsOf = (
	rows: readonly { family: ConfigFamily; slots: number }[]
): readonly SlotSegment[] =>
	rows.map((row) => ({ family: row.family, slots: row.slots }));

export type PrepBuildRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	version?: string;
};

export type PrepTally = {
	label: string;
	count: number;
};

export type PrepAudit = {
	label: string;
	suppressed?: boolean;
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

const Label = ({ text }: { text: string }) => <Text tone="muted">{text}</Text>;

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
							reported passing
						</Text>
					) : null}
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
				{index === 0 ? null : (
					<Text tone="faint" size="caption" aria-hidden>
						·
					</Text>
				)}
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

const Revealed = ({
	items,
	countFirst = false,
	source,
}: {
	items?: readonly PrepTally[];
	countFirst?: boolean;
	source?: string;
}) => {
	if (items === undefined) return <Redacted />;

	return (
		<>
			<TallyLine items={items} countFirst={countFirst} />
			{source === undefined ? null : <Badge tone="neutral">{source}</Badge>}
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
		source?: string;
		pollTypes?: readonly PrepTally[];
		audits: readonly PrepAudit[];
		categories?: readonly PrepTally[];
		nextCategories?: readonly PrepTally[];
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
								name={row.name}
								tag={
									<>
										{row.version === undefined ? null : (
											<Version label={row.version} />
										)}
										<Slots family={row.family} slots={row.slots} />
									</>
								}
								detail={row.detail}
							/>
						))}
					</div>
				</Section>
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
						name={<Label text="categories" />}
						trailing={
							<Revealed items={window.categories} source={window.source} />
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
