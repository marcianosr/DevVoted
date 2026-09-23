import { LOCKED_CONFIG } from "~/shared/lib/copy";
import { Badge } from "./Badge.ui";
import { DexPanel } from "./DexPanel.ui";
import { Figures } from "./Figures.ui";
import { Meter } from "./Meter.ui";
import { Panel } from "./Panel.ui";
import { Redaction } from "./Redaction.ui";
import { Tooltip } from "./Tooltip.ui";
import { Weight } from "./Weight.ui";

const COPY = {
	baseRung: "on install",
	unlockLead: "unlock",
	alternativeLead: "or",
	starterTag: "starter",
	earnedTag: "earned",
} as const;

const GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
const CARD =
	"flex flex-col gap-2 rounded-lg border border-theme-faint bg-theme-raised p-3";

const HEAD = "flex items-center gap-2";
const NAME = "min-w-0 truncate text-sm font-bold text-theme-faint";
const LOCKED_NAME = "text-sm font-bold text-theme-muted";
const TAG = "ml-auto shrink-0 text-xs text-theme-muted";

const LADDER = "flex flex-wrap items-center gap-1.5";
const EFFECT = "text-sm text-theme-soft";
const PRICE = "flex items-center gap-1.5 text-xs text-theme-muted";

const PATHS = "flex flex-col gap-1.5 text-xs text-theme-muted";
const PATH = "flex flex-wrap items-center gap-1.5";
const ALTERNATIVE = "flex items-center gap-2";
const ALTERNATIVE_BAR = "min-w-0 flex-1";
const COUNT = "shrink-0 tabular-nums";
const READER_ONLY = "sr-only";

const FIRST_VERSION = 1;
const SEPARATOR = "·";

/** One rung of a config's in-run version ladder. `price` and `odds` are null
 * for v1, which is what installing it already gives you. */
export type DexVersionRung = {
	version: number;
	effect: string;
	price: string | null;
	odds: string | null;
};

export type UnlockProgress = { count: number; target: number };

export type DexUnlockPath = {
	text: string;
	/** Null for a one-shot objective, which has nothing to count. */
	progress: UnlockProgress | null;
};

/**
 * A locked config carries no name or effect at all — the domain entry withholds
 * them, so the silhouette is the only thing a card could leak.
 */
export type DexConfigRow = { id: string; slots: number } & (
	| {
			state: "granted";
			name: string;
			effect: string;
			provenance: string;
			starter: boolean;
			versions?: readonly DexVersionRung[];
	  }
	| { state: "locked"; paths: readonly DexUnlockPath[] }
);

type GrantedRow = Extract<DexConfigRow, { state: "granted" }>;
type LockedRow = Extract<DexConfigRow, { state: "locked" }>;

/** What the presenter derives from the domain, with no wiring in it. */
export type DexConfigsData = {
	rows: readonly DexConfigRow[];
	count: string;
	meta: string;
	note: string;
};

export type DexConfigsProps = DexConfigsData & {
	/** Which rung each card is currently reading; absent means v1. */
	selected?: Readonly<Record<string, number>>;
	onVersion: (configId: string, version: number) => void;
};

export const unlockLabelOf = (path: DexUnlockPath): string =>
	`${COPY.unlockLead} ${SEPARATOR} ${path.text}`;

export const alternativeLabelOf = (path: DexUnlockPath): string =>
	`${COPY.alternativeLead} ${SEPARATOR} ${path.text}`;

export const progressLabelOf = ({ count, target }: UnlockProgress): string =>
	`${count}/${target}`;

export const provenanceTagOf = (starter: boolean): string =>
	starter ? COPY.starterTag : COPY.earnedTag;

export const rungHintOf = (name: string, version: number): string =>
	`Read ${name} v${version}`;

const rungFor = (
	rungs: readonly DexVersionRung[],
	version: number
): DexVersionRung => rungs.find((rung) => rung.version === version) ?? rungs[0];

const effectOf = (row: GrantedRow, rung?: DexVersionRung): string =>
	rung === undefined || rung.effect === "" ? row.effect : rung.effect;

const RungPrice = ({ rung }: { rung: DexVersionRung }) => {
	if (rung.price === null)
		return <span className={PRICE}>{COPY.baseRung}</span>;

	return (
		<span className={PRICE}>
			<Badge>{rung.price}</Badge>
			{rung.odds === null ? null : (
				<>
					<span aria-hidden>{SEPARATOR}</span>
					<span>{rung.odds}</span>
				</>
			)}
		</span>
	);
};

const Provenance = ({ row }: { row: GrantedRow }) => (
	<span className={TAG}>
		<Tooltip label={`${row.name} provenance`} hint={row.provenance} align="end">
			{provenanceTagOf(row.starter)}
		</Tooltip>
	</span>
);

const Ladder = ({
	name,
	rungs,
	held,
	onPress,
}: {
	name: string;
	rungs: readonly DexVersionRung[];
	held: number;
	onPress: (version: number) => void;
}) => (
	<span className={LADDER}>
		{rungs.map((rung) => (
			<Badge
				key={rung.version}
				onPress={() => onPress(rung.version)}
				armed={rung.version === held}
				hint={rungHintOf(name, rung.version)}
			>
				v{rung.version}
			</Badge>
		))}
	</span>
);

const GrantedCard = ({
	row,
	held,
	onVersion,
}: {
	row: GrantedRow;
	held: number;
	onVersion: (configId: string, version: number) => void;
}) => {
	const rung =
		row.versions === undefined ? undefined : rungFor(row.versions, held);

	return (
		<div className={CARD}>
			<span className={HEAD}>
				<Weight slots={row.slots} />
				<span className={NAME}>{row.name}</span>
				<Provenance row={row} />
			</span>
			{row.versions === undefined ? null : (
				<Ladder
					name={row.name}
					rungs={row.versions}
					held={held}
					onPress={(version) => onVersion(row.id, version)}
				/>
			)}
			<p className={EFFECT}>
				<Figures text={effectOf(row, rung)} />
			</p>
			{rung === undefined ? null : <RungPrice rung={rung} />}
		</div>
	);
};

/**
 * Every path after the first reads as an alternative to it. The bar carries no
 * visible text of its own, so the path names itself to a reader instead.
 */
const Alternative = ({ path }: { path: DexUnlockPath }) => {
	if (path.progress === null)
		return <span className={PATH}>{alternativeLabelOf(path)}</span>;

	return (
		<span className={ALTERNATIVE}>
			<span className={READER_ONLY}>{alternativeLabelOf(path)}</span>
			<span aria-hidden>{COPY.alternativeLead}</span>
			<span className={ALTERNATIVE_BAR}>
				<Meter value={path.progress.count} max={path.progress.target} />
			</span>
			<span className={COUNT}>{progressLabelOf(path.progress)}</span>
		</span>
	);
};

const LockedCard = ({ row }: { row: LockedRow }) => {
	const [required, ...alternatives] = row.paths;

	return (
		<div className={CARD}>
			<span className={HEAD}>
				<Weight slots={row.slots} />
				<span className={LOCKED_NAME}>
					<Redaction label={LOCKED_CONFIG} />
				</span>
			</span>
			<span className={PATHS}>
				<span className={PATH}>
					{unlockLabelOf(required)}
					{required.progress === null ? null : (
						<Badge>{progressLabelOf(required.progress)}</Badge>
					)}
				</span>
				{alternatives.map((path) => (
					<Alternative key={path.text} path={path} />
				))}
			</span>
		</div>
	);
};

export const DexConfigs = ({
	rows,
	count,
	meta,
	note,
	selected = {},
	onVersion,
}: DexConfigsProps) => (
	<DexPanel label="configs" count={count} meta={meta} note={note}>
		<Panel.Body>
			<div className={GRID}>
				{rows.map((row) =>
					row.state === "locked" ? (
						<LockedCard key={row.id} row={row} />
					) : (
						<GrantedCard
							key={row.id}
							row={row}
							held={selected[row.id] ?? FIRST_VERSION}
							onVersion={onVersion}
						/>
					)
				)}
			</div>
		</Panel.Body>
	</DexPanel>
);
