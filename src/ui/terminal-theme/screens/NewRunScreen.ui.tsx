import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { clsx } from "clsx";

import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import { Callout } from "../Callout.ui";
import { DexChip } from "../DexChip.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { Panel } from "../Panel.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotDeal, type SlotDealRow } from "../SlotDeal.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";

const FOOTER = "flex items-center justify-end border-t border-edge pt-4";

const PICK =
	"block w-full cursor-pointer text-left transition-colors hover:bg-zinc-800/40";
const PICK_LOCKED = "block w-full text-left";

const MARK =
	"inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs";
const MARK_ON = "border-viridian bg-viridian/15 text-viridian";
const MARK_OFF = "border-zinc-600 text-zinc-500";

const PickMark = ({ selected }: { selected: boolean }) => (
	<span aria-hidden className={clsx(MARK, selected ? MARK_ON : MARK_OFF)}>
		{selected ? "✓" : "+"}
	</span>
);

const segmentsOf = (
	rows: readonly { slots: number }[]
): readonly SlotSegment[] => rows.map((row) => ({ slots: row.slots }));

export type DealRow = {
	name: string;
	detail: string;
	slots: number;
	version: number;
	selected: boolean;
	toggleLabel: string;
	onToggle?: () => void;
	locked?: boolean;
	recommended?: boolean;
};

export type NewRunScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	gitTag?: {
		title: string;
		detail: string;
	};
	dealt: {
		meta: string;
		rows: readonly DealRow[];
	};
	storage: {
		meta: string;
		slots: number;
		slotRows: readonly SlotDealRow[];
	};
	startLabel: string;
	onStart?: () => void;
};

const DealPick = ({ row }: { row: DealRow }) => (
	<button
		type="button"
		aria-pressed={row.selected}
		aria-label={row.toggleLabel}
		disabled={row.onToggle === undefined}
		onClick={row.onToggle}
		className={clsx(row.locked === true ? PICK_LOCKED : PICK)}
	>
		<Row
			leading={<PickMark selected={row.selected} />}
			name={
				<DexChip
					slots={row.slots}
					label={row.name}
					version={row.version}
					selected={row.selected}
					className="w-44 overflow-hidden @max-3xl:w-auto"
				/>
			}
			detail={row.detail}
			dimmed={row.locked}
			trailing={
				row.recommended === true ? (
					<Badge tone="cerulean" size="sm">
						suggested
					</Badge>
				) : undefined
			}
		/>
	</button>
);

export const NewRunScreen = ({
	header,
	theme,
	gitTag,
	dealt,
	storage,
	startLabel,
	onStart,
}: NewRunScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		{gitTag === undefined ? null : (
			<Callout
				mark={<GitTagIcon />}
				title={gitTag.title}
				detail={gitTag.detail}
			/>
		)}

		<div className="@container">
			<Section label="Dealt" meta={dealt.meta} divided>
				{dealt.rows.map((row) => (
					<DealPick key={row.name} row={row} />
				))}
			</Section>
		</div>

		<Section label="Build storage" meta={storage.meta}>
			<SlotTrack
				segments={segmentsOf(dealt.rows.filter((row) => row.selected))}
				slots={storage.slots}
			/>
			<div className="divide-y divide-edge">
				{storage.slotRows.map((row) => (
					<SlotDeal key={row.label} row={row} />
				))}
			</div>
		</Section>

		<footer className={FOOTER}>
			<Button
				label={startLabel}
				variant="primary"
				disabled={onStart === undefined}
				className="@max-md:w-full"
				onUse={onStart}
			/>
		</footer>
	</Panel>
);
