import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
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
		startLabel: string;
		onStart?: () => void;
	};
	build: {
		meta: string;
		count: string;
		slots: number;
		rows: readonly PrepBuildRow[];
	};
	required: {
		note: string;
		coverage: {
			detail: string;
		};
	};
	audits: {
		meta: string;
		rows: readonly AuditNote[];
	};
	bills?: {
		meta: string;
		rows: readonly BillRow[];
		total: BillRow;
	};
	prefetch?: {
		thisGate: readonly string[];
		nextGate: readonly string[];
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
	required,
	audits,
	bills,
	prefetch,
	onClear,
	footer,
}: PrepScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		<div className={CALLOUT}>
			<Text tone="muted">{ready.note}</Text>
			<Button
				label={ready.startLabel}
				variant="primary"
				onUse={ready.onStart}
			/>
		</div>

		<Section label="Build storage">
			<SlotTrack
				segments={segmentsOf(build.rows)}
				slots={build.slots}
				reading={build.meta}
			/>
		</Section>

		<div className={COLUMNS}>
			<div className="@container">
				<Section label="Build" meta={build.count}>
					<div className="divide-y divide-edge">
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
				<Section label="Audits" meta={audits.meta}>
					<Audits rows={audits.rows} className="pt-1 pb-2" />
				</Section>

				<Section label="Required" divided>
					<Row name={required.note} />
					<Row name="Coverage" detail={required.coverage.detail} />
				</Section>

				{prefetch === undefined ? null : (
					<Section label="Prefetch" divided>
						<Row
							name="This gate"
							trailing={
								<Text tone="muted" size="caption">
									{prefetch.thisGate.join(" · ")}
								</Text>
							}
						/>
						{prefetch.nextGate.length === 0 ? null : (
							<Row
								name="Next gate"
								trailing={
									<Text tone="muted" size="caption">
										{prefetch.nextGate.join(" · ")}
									</Text>
								}
							/>
						)}
					</Section>
				)}

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
			</div>
		</div>

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
