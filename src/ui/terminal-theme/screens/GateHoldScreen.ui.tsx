import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge, badgeNumbers, type BadgeTone } from "../Badge.ui";
import { Button } from "../Button.ui";
import { Ledger, type LedgerRow } from "../Ledger.ui";
import { Panel } from "../Panel.ui";
import { PickBox } from "../PickBox.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { Slots } from "../Slots.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";
import { Version } from "../Version.ui";

const FOOTER =
	"flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4";

export type RemoveRow = {
	name: string;
	detail: string;
	version?: string;
	slots: number;
	checked: boolean;
	onToggle?: () => void;
};

export type GateHoldScreenProps = {
	theme?: SwatchTheme;
	title: string;
	subtitle: string;
	retryNote: string;
	chips: readonly { label: string; tone?: BadgeTone }[];
	audits?: readonly AuditNote[];
	storage: readonly LedgerRow[];
	remove: {
		meta: string;
		rows: readonly RemoveRow[];
	};
	reviewLabel: string;
	onReview?: () => void;
	removeLabel: string;
	onRemove?: () => void;
};

export const GateHoldScreen = ({
	theme,
	title,
	subtitle,
	retryNote,
	chips,
	audits = [],
	storage,
	remove,
	reviewLabel,
	onReview,
	removeLabel,
	onRemove,
}: GateHoldScreenProps) => (
	<Panel theme={theme}>
		<header className="flex items-start justify-between gap-4 @max-md:flex-col @max-md:gap-2">
			<div className="flex items-center gap-3">
				<Swatch state="pending" size="hero" />
				<div className="flex flex-col gap-0.5">
					<Text size="score" className="font-bold">
						{title}
					</Text>
					<Text
						tone="muted"
						className="inline-flex flex-wrap items-center gap-1"
					>
						{badgeNumbers(subtitle)}
					</Text>
				</div>
			</div>
			<Text tone="muted" className="shrink-0">
				{retryNote}
			</Text>
		</header>

		<div className="flex flex-wrap items-center gap-2">
			{chips.map((chip) => (
				<Badge key={chip.label} tone={chip.tone ?? "neutral"} size="md">
					{chip.label}
				</Badge>
			))}
		</div>

		<Audits rows={audits} />

		<Section label="Storage" className="border-t border-edge pt-2">
			<Ledger rows={storage} />
		</Section>

		<Section label="Remove" meta={remove.meta} divided>
			{remove.rows.map((row) => (
				<Row
					key={row.name}
					leading={
						<PickBox
							checked={row.checked}
							label={`remove ${row.name}`}
							onToggle={row.onToggle}
						/>
					}
					name={row.name}
					tag={
						<>
							{row.version === undefined ? null : (
								<Version label={row.version} />
							)}
							<Slots slots={row.slots} />
						</>
					}
					detail={row.detail}
				/>
			))}
		</Section>

		<footer className={FOOTER}>
			<Button label={reviewLabel} onUse={onReview} />
			<Button
				label={removeLabel}
				variant="danger"
				disabled={onRemove === undefined}
				className="@max-md:flex-1"
				onUse={onRemove}
			/>
		</footer>
	</Panel>
);
