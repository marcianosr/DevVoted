import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge, type BadgeTone } from "../Badge.ui";
import { Button } from "../Button.ui";
import { Ledger, type LedgerRow } from "../Ledger.ui";
import { Meter } from "../Meter.ui";
import { Panel } from "../Panel.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { Slots } from "../Slots.ui";
import { Swatch } from "../Swatch.ui";
import { SwatchTrack, type TrackSwatch } from "../SwatchTrack.ui";
import { Text } from "../Text.ui";

const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

export type ChangedRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	badge?: {
		label: string;
		tone: BadgeTone;
	};
	meterPercent?: number;
};

export type CoverageRow = {
	category: string;
	polls: string;
	gain: string;
};

export type GateClearScreenProps = {
	theme?: SwatchTheme;
	title: string;
	subtitle: string;
	nextUp: string;
	chips: readonly { label: string; tone?: BadgeTone }[];
	swatches: readonly TrackSwatch[];
	rewards: readonly LedgerRow[];
	coverage: {
		rows: readonly CoverageRow[];
		total: string;
	};
	changed: {
		meta: string;
		rows: readonly ChangedRow[];
	};
	reviewLabel: string;
	onReview?: () => void;
	audits?: readonly AuditNote[];
	shopLabel: string;
	onShop?: () => void;
};

const changedTrailing = (row: ChangedRow) => {
	if (row.badge !== undefined) {
		return <Badge tone={row.badge.tone}>{row.badge.label}</Badge>;
	}
	if (row.meterPercent !== undefined) {
		return <Meter percent={row.meterPercent} className="w-24" />;
	}
	return undefined;
};

export const GateClearScreen = ({
	theme,
	title,
	subtitle,
	nextUp,
	chips,
	swatches,
	rewards,
	coverage,
	changed,
	audits = [],
	reviewLabel,
	onReview,
	shopLabel,
	onShop,
}: GateClearScreenProps) => (
	<Panel theme={theme}>
		<header className="flex items-start justify-between gap-4 @max-md:flex-col @max-md:gap-2">
			<div className="flex items-center gap-3">
				<Swatch theme={theme} size="hero" />
				<div className="flex flex-col gap-0.5">
					<Text size="score" tone="theme" className="font-bold">
						{title}
					</Text>
					<Text tone="muted">{subtitle}</Text>
				</div>
			</div>
			<Text tone="muted" className="shrink-0">
				{nextUp}
			</Text>
		</header>

		<div className="flex flex-wrap items-center gap-2">
			{chips.map((chip) => (
				<Badge key={chip.label} tone={chip.tone ?? "neutral"} size="md">
					{chip.label}
				</Badge>
			))}
		</div>

		<SwatchTrack swatches={swatches} />

		<Audits rows={audits} />

		<div className="grid grid-cols-2 gap-x-6 border-t border-edge pt-2 @max-md:grid-cols-1">
			<Section label="Rewards">
				<Ledger rows={rewards} />
			</Section>
			<Section label="Coverage">
				<div className="divide-y divide-edge">
					{coverage.rows.map((row) => (
						<Row
							key={row.category}
							leading={
								<Text tone="viridian" aria-hidden>
									✓
								</Text>
							}
							name={row.category}
							trailing={
								<>
									<Badge tone="neutral">{row.polls}</Badge>
									<Text tone="viridian" size="caption">
										{row.gain}
									</Text>
								</>
							}
						/>
					))}
					<Row
						name={<Text tone="muted">total</Text>}
						trailing={<Text className="font-bold">{coverage.total}</Text>}
					/>
				</div>
			</Section>
		</div>

		<Section label="What changed" meta={changed.meta} divided>
			{changed.rows.map((row) => (
				<Row
					key={row.name}
					name={row.name}
					tag={<Slots family={row.family} slots={row.slots} />}
					detail={row.detail}
					trailing={changedTrailing(row)}
				/>
			))}
		</Section>

		<footer className={FOOTER}>
			<Button label={reviewLabel} onUse={onReview} />
			<Button
				label={shopLabel}
				variant="primary"
				className="@max-md:flex-1"
				onUse={onShop}
			/>
		</footer>
	</Panel>
);
