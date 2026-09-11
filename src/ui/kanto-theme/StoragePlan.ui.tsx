import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Figures } from "./Figures.ui";
import type { KantoColor } from "./colors";
import { Redaction } from "./Redaction.ui";
import { Typography } from "./Typography.ui";

const LADDER = "flex w-full flex-col";

const ROW = "flex items-center gap-3 py-1.5";

const GUTTER = "flex w-2 shrink-0 flex-col items-center self-stretch";
const SEGMENT = "w-px flex-1";
const DOT = "size-2 shrink-0 rounded-full";

const HIDDEN = "invisible";

const LIT = "bg-theme";
const DIM = "bg-theme-raised";
const REACHED = "badge-theme";
const GLOW = "glow-theme-soft";

const IDENTITY = "flex min-w-0 flex-col";
const HEADLINE = "flex items-baseline gap-1.5";
const CAP_HELD = "";
const CAP_OPEN = "opacity-75";
const CAP_REACHED = "opacity-50";
const FREE_NOTE = "text-sm text-theme-muted";
const CONTROL = "ml-auto shrink-0";

const NOTE_GAIN: KantoColor = "pewter";

const SEPARATOR = "·";
const FREE_LABEL = "free";
const CURRENT_LABEL = "current";
const DOWNGRADE_LABEL = "downgrade";
const LOCKED_LABEL = "locked";
const MASK_LABEL = "Locked storage plan";
const LADDER_LABEL = "storage plan rungs";

const PRESS_COLOR: KantoColor = "cerulean";

const NOOP = () => {};

export type StorageRung = {
	cap: string;
	bill?: string;
	held?: boolean;
	revealed?: boolean;
	refusal?: string;
	opensAt?: string;
	onPress?: () => void;
};

export type StoragePlanProps = { rungs: readonly StorageRung[] };

type RungPlace = "reached" | "held" | "open" | "masked";

const DOT_PAINT = {
	reached: REACHED,
	held: `${LIT} ${GLOW}`,
	open: LIT,
	masked: DIM,
} satisfies Record<RungPlace, string>;

const DOT_THEME = {
	reached: undefined,
	held: undefined,
	open: PRESS_COLOR,
	masked: undefined,
} satisfies Record<RungPlace, KantoColor | undefined>;

const CAP_TONE = {
	reached: CAP_REACHED,
	held: CAP_HELD,
	open: CAP_OPEN,
	masked: CAP_OPEN,
} satisfies Record<RungPlace, string>;

const placeOf = (
	index: number,
	heldIndex: number,
	revealed: boolean
): RungPlace => {
	if (index === heldIndex) return "held";
	if (index < heldIndex) return "reached";
	return revealed ? "open" : "masked";
};

const Gutter = ({
	place,
	litAbove,
	litBelow,
	first,
	last,
}: {
	place: RungPlace;
	litAbove: boolean;
	litBelow: boolean;
	first: boolean;
	last: boolean;
}) => (
	<span aria-hidden className={GUTTER}>
		<span className={clsx(SEGMENT, litAbove ? LIT : DIM, first && HIDDEN)} />
		<span
			data-screen-theme={DOT_THEME[place]}
			className={clsx(DOT, DOT_PAINT[place])}
		/>
		<span className={clsx(SEGMENT, litBelow ? LIT : DIM, last && HIDDEN)} />
	</span>
);

const Control = ({ place, rung }: { place: RungPlace; rung: StorageRung }) => {
	if (place === "held") {
		return <Typography variant="accent">{CURRENT_LABEL}</Typography>;
	}

	if (place === "reached") {
		return (
			<Button
				tone="danger"
				label={DOWNGRADE_LABEL}
				hint={`drop to ${rung.cap}`}
				onPress={rung.onPress}
			/>
		);
	}

	if (place === "masked") {
		return <Badge>{LOCKED_LABEL}</Badge>;
	}

	const bill = rung.bill ?? FREE_LABEL;
	const refused = rung.refusal !== undefined || rung.onPress === undefined;

	return (
		<Badge
			hint={`rent ${rung.cap} ${SEPARATOR} ${bill}`}
			disabled={refused}
			onPress={rung.onPress ?? NOOP}
		>
			{bill}
		</Badge>
	);
};

const Rung = ({
	rung,
	place,
	litAbove,
	litBelow,
	first,
	last,
}: {
	rung: StorageRung;
	place: RungPlace;
	litAbove: boolean;
	litBelow: boolean;
	first: boolean;
	last: boolean;
}) => {
	const note = place === "masked" ? rung.opensAt : rung.refusal;
	const free = rung.bill === undefined && place !== "open";

	return (
		<li className={ROW}>
			<Gutter
				place={place}
				litAbove={litAbove}
				litBelow={litBelow}
				first={first}
				last={last}
			/>

			<span className={IDENTITY}>
				<span className={HEADLINE}>
					{place === "masked" ? (
						<Redaction label={MASK_LABEL} />
					) : (
						<span className={CAP_TONE[place]}>
							<Badge>{rung.cap}</Badge>
						</span>
					)}
					{free ? (
						<span className={FREE_NOTE}>
							<span aria-hidden>{SEPARATOR} </span>
							{FREE_LABEL}
						</span>
					) : null}
				</span>
				{note === undefined ? null : (
					<Typography variant="hint">
						<Figures text={note} gain={NOTE_GAIN} />
					</Typography>
				)}
			</span>

			<span className={CONTROL}>
				<Control place={place} rung={rung} />
			</span>
		</li>
	);
};

export const StoragePlan = ({ rungs }: StoragePlanProps) => {
	const heldIndex = rungs.findIndex((rung) => rung.held === true);

	return (
		<ul aria-label={LADDER_LABEL} className={LADDER}>
			{rungs.map((rung, index) => (
				<Rung
					key={rung.cap}
					rung={rung}
					place={placeOf(index, heldIndex, rung.revealed === true)}
					litAbove={index <= heldIndex}
					litBelow={index < heldIndex}
					first={index === 0}
					last={index === rungs.length - 1}
				/>
			))}
		</ul>
	);
};
