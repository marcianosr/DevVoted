import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { clsx } from "clsx";

import { Button } from "../Button.ui";
import { Callout } from "../Callout.ui";
import { Dot } from "../Dot.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { Panel } from "../Panel.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotDeal, type SlotDealRow } from "../SlotDeal.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { Slots } from "../Slots.ui";

const FOOTER = "flex items-center justify-end border-t border-edge pt-4";

const PICK =
	"block w-full cursor-pointer text-left transition-colors hover:bg-zinc-800/40";
const PICK_LOCKED = "block w-full text-left";

const segmentsOf = (
	rows: readonly { family: ConfigFamily; slots: number }[]
): readonly SlotSegment[] =>
	rows.map((row) => ({ family: row.family, slots: row.slots }));

export type DealRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	selected: boolean;
	toggleLabel: string;
	onToggle?: () => void;
	locked?: boolean;
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
			leading={<Dot variant={row.selected ? "on" : "off"} />}
			name={row.name}
			tag={<Slots family={row.family} slots={row.slots} />}
			detail={row.detail}
			dimmed={row.locked}
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
