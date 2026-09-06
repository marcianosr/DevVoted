import type { ConfigdexEntry } from "~/modules/collection/dex/domain/configdex.model";
import { grantedCountIn } from "~/modules/collection/dex/domain/configdex.model";
import {
	baseSlotsOf,
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
} from "~/modules/run/config/domain/config.model";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import type { UnlockPathCaption } from "~/modules/run/config/domain/unlockCaption.model";
import { plural } from "~/ui/modern-theme/format";
import { sizeFill } from "~/ui/sizes";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const SIZES_LARGEST_FIRST = [...CONFIG_SIZES].reverse();

const HEADER = "flex items-center gap-3";
const MARK = "h-3 shrink-0 rounded-xs";
const MARK_SLOT_REM = 0.3125;
const NAME = "text-xs font-bold uppercase tracking-wide text-zinc-200";
const FIGURES = "flex items-center gap-3 text-xs text-zinc-500";
const COUNT = "ml-auto text-xs tabular-nums text-zinc-500";
const LOCKED_CHIP =
	"flex w-fit items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-3 py-1.5";
const REDACTED = "???";

export type ConfigdexPanelProps = {
	entries: readonly ConfigdexEntry[];
};

const slotsOfEntry = (entry: ConfigdexEntry): number =>
	entry.state === "granted" ? baseSlotsOf(entry.config) : entry.slots;

const PathLine = ({
	path,
	prefix,
}: {
	path: UnlockPathCaption;
	prefix?: string;
}) => (
	<Paragraph as="span" size="xs" tone="muted">
		{prefix === undefined ? "" : `${prefix} `}
		{path.kind === "counted" ? (
			<>
				{path.text}
				<span className="tabular-nums">
					{" "}
					· {path.count}/{path.target}
				</span>
			</>
		) : (
			<>
				<span aria-hidden>{path.done ? "☑" : "☐"} </span>
				{path.text}
			</>
		)}
	</Paragraph>
);

const LockedCard = ({
	entry,
}: {
	entry: Extract<ConfigdexEntry, { state: "locked" }>;
}) => (
	<li className="flex flex-col gap-1">
		<div className={LOCKED_CHIP}>
			<span
				aria-hidden
				style={{ width: `${entry.slots * MARK_SLOT_REM}rem` }}
				className={`${MARK} ${sizeFill(entry.slots)} opacity-50`}
			/>
			<span className="text-sm font-semibold text-zinc-500">{REDACTED}</span>
		</div>
		<div className="flex flex-col gap-0.5 pl-1">
			<PathLine path={entry.thematic} />
			<PathLine path={entry.fallback} prefix="or" />
		</div>
	</li>
);

const GrantedCard = ({
	entry,
}: {
	entry: Extract<ConfigdexEntry, { state: "granted" }>;
}) => (
	<li className="flex flex-wrap items-center gap-2">
		<ConfigChip config={entry.config} />
		<Paragraph as="span" size="xs" tone="muted">
			{entry.provenance}
		</Paragraph>
	</li>
);

export const ConfigdexPanel = ({ entries }: ConfigdexPanelProps) => (
	<Stack gap="6">
		<Paragraph tone="muted">
			{grantedCountIn(entries)}/{entries.length} collected
		</Paragraph>
		{SIZES_LARGEST_FIRST.map((size) => {
			const group = entries.filter((entry) => slotsOfEntry(entry) === size);
			if (group.length === 0) return null;

			return (
				<div key={size} className="flex flex-col gap-3">
					<header className={HEADER}>
						<span
							aria-hidden
							style={{ width: `${size * MARK_SLOT_REM}rem` }}
							className={`${MARK} ${sizeFill(size)}`}
						/>
						<p className={NAME}>{plural(size, "slot")}</p>
						<span className={FIGURES}>
							<span>{DRAFT_COST_PER_SLOT_KB * size} KB</span>
						</span>
						<p className={COUNT}>
							{grantedCountIn(group)}/{group.length}
						</p>
					</header>
					<ul className="flex flex-col gap-3">
						{group.map((entry) =>
							entry.state === "granted" ? (
								<GrantedCard key={entry.config.id} entry={entry} />
							) : (
								<LockedCard key={entry.id} entry={entry} />
							)
						)}
					</ul>
				</div>
			);
		})}
	</Stack>
);
