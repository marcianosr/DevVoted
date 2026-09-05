import { clsx } from "clsx";

import { DexChip } from "../DexChip.ui";
import { Figures } from "../Figures.ui";
import { plural } from "../format";
import { Slots } from "../Slots.ui";
import { Tabs, type TabItem } from "../Tabs.ui";
import { Text } from "../Text.ui";
import { VersionFigure } from "../VersionFigure.ui";
import { VersionTrack } from "../VersionTrack.ui";

const PANEL = "flex flex-col gap-4 py-2";
const KEY = "flex flex-wrap items-center gap-x-4 gap-y-1";
const KEY_ITEM = "flex items-center gap-1.5";

const GROUPS = "divide-y divide-edge";
const GROUP = "flex flex-col gap-2 py-3";
const GROUP_HEAD = "flex items-center gap-2";
const COUNT = "ml-auto shrink-0";
const CHIPS = "flex flex-wrap gap-2";

const TABLE = "flex flex-col divide-y divide-edge";
const TABLE_HEAD = "flex items-center gap-3 pb-1";
const ROW =
	"flex items-center gap-2 py-2 text-left transition-colors hover:bg-zinc-100/5";
const ROW_SELECTED = "bg-zinc-100/5";
const FIGURE = "ml-auto shrink-0 tabular-nums";

const TAIL = "flex flex-col gap-2 border-t border-edge pt-3";
const TAIL_HEAD = "flex items-center gap-2";

const DETAIL = "flex flex-col gap-2 border-t border-edge pt-3";
const DETAIL_HEAD = "flex flex-wrap items-center gap-2";
const DETAIL_META = "ml-auto shrink-0";
const DETAIL_LADDER = "flex flex-wrap items-center gap-3";

const NEVER_INSTALLED = "seen but never installed";

type ConfigIdentity = {
	id: string;
	slots: number;
};

export type SeenConfig = ConfigIdentity & {
	seen?: true;
	label: string;
	/** Highest version ever dealt. Versions climb one rung at a time, so this
	 * single figure says which rungs you have held. */
	best: number;
	maxVersion: number;
	installs: number;
	firstSeenGate: number;
	effect: string;
};

/** An unseen config hands over its size only: enough to say what shape of thing
 * is missing, never which one. */
export type UnseenConfig = ConfigIdentity & {
	seen: false;
	label?: never;
	best?: never;
	maxVersion?: never;
	installs?: never;
	firstSeenGate?: never;
	effect?: never;
};

export type DexConfig = SeenConfig | UnseenConfig;

export const CONFIG_VIEWS = [
	{ id: "slots", label: "by slot" },
	{ id: "installs", label: "most installed" },
	{ id: "unseen", label: "unseen" },
] as const satisfies readonly TabItem[];

export type ConfigsPanelProps = {
	configs: readonly DexConfig[];
	view: string;
	onView: (id: string) => void;
	selectedId?: string;
	onSelect: (id: string) => void;
};

const isSeen = (config: DexConfig): config is SeenConfig =>
	config.seen !== false;

const slotSizes = (configs: readonly DexConfig[]) =>
	[...new Set(configs.map((config) => config.slots))].sort((a, b) => a - b);

const installLine = (installs: number) => {
	if (installs === 0) return NEVER_INSTALLED;
	return installs === 1 ? "installed once" : `installed ${installs} times`;
};

// The rung above your best is one the game has built and never handed you,
// which is the only thing a maxed config has left to say.
const versionLine = (best: number, maxVersion: number) => {
	if (best === 0) return "never dealt";
	if (best === maxVersion) return `best v${best} · nothing left to build`;
	return `best v${best} · v${best + 1} is built, never dealt`;
};

const SlotKey = ({ configs }: { configs: readonly DexConfig[] }) => (
	<div className={KEY}>
		{slotSizes(configs).map((slots) => (
			<span key={slots} className={KEY_ITEM}>
				<span aria-hidden>
					<Slots slots={slots} solid />
				</span>
				<Text tone="muted" size="caption">
					{plural(slots, "slot")}
				</Text>
			</span>
		))}
	</div>
);

const Entry = ({
	config,
	selected,
	onSelect,
}: {
	config: DexConfig;
	selected: boolean;
	onSelect: (id: string) => void;
}) => {
	if (!isSeen(config)) return <DexChip slots={config.slots} seen={false} />;

	return (
		<DexChip
			slots={config.slots}
			label={config.label}
			version={config.best}
			maxVersion={config.maxVersion}
			selected={selected}
			onSelect={() => onSelect(config.id)}
		/>
	);
};

const Group = ({
	slots,
	configs,
	selectedId,
	onSelect,
}: {
	slots: number;
	configs: readonly DexConfig[];
	selectedId?: string;
	onSelect: (id: string) => void;
}) => (
	<div className={GROUP}>
		<div className={GROUP_HEAD}>
			<span aria-hidden>
				<Slots slots={slots} solid />
			</span>
			<Text className="font-bold">{plural(slots, "slot")}</Text>
			<Text tone="faint" className={COUNT}>
				{configs.filter(isSeen).length} of {configs.length}
			</Text>
		</div>
		<div className={CHIPS}>
			{configs.map((config) => (
				<Entry
					key={config.id}
					config={config}
					selected={config.id === selectedId}
					onSelect={onSelect}
				/>
			))}
		</div>
	</div>
);

const Grouped = ({
	configs,
	selectedId,
	onSelect,
}: {
	configs: readonly DexConfig[];
	selectedId?: string;
	onSelect: (id: string) => void;
}) => (
	<div className={GROUPS}>
		{slotSizes(configs).map((slots) => (
			<Group
				key={slots}
				slots={slots}
				configs={configs.filter((config) => config.slots === slots)}
				selectedId={selectedId}
				onSelect={onSelect}
			/>
		))}
	</div>
);

const InstallRow = ({
	config,
	selected,
	onSelect,
}: {
	config: SeenConfig;
	selected: boolean;
	onSelect: (id: string) => void;
}) => (
	<button
		type="button"
		aria-pressed={selected}
		onClick={() => onSelect(config.id)}
		className={clsx(ROW, selected && ROW_SELECTED)}
	>
		{/* Width is the ranking's second reading: a wide bar next to a big install
		    count is a config people pay four slots for. */}
		<Slots slots={config.slots} solid className="mr-1" />
		<Text className="font-bold">{config.label}</Text>
		<VersionFigure version={config.best} maxVersion={config.maxVersion} />
		<Text tone="muted" className={FIGURE}>
			{config.installs}
		</Text>
	</button>
);

const ByInstalls = ({
	configs,
	selectedId,
	onSelect,
}: {
	configs: readonly DexConfig[];
	selectedId?: string;
	onSelect: (id: string) => void;
}) => {
	const seen = configs.filter(isSeen);
	const ranked = [...seen]
		.filter((config) => config.installs > 0)
		.sort((first, second) => second.installs - first.installs);
	const shelved = seen.filter((config) => config.installs === 0);

	return (
		<div className="flex flex-col gap-3">
			<div className={TABLE}>
				<div className={TABLE_HEAD}>
					<Text tone="faint" size="caption">
						config
					</Text>
					<Text tone="faint" size="caption" className={FIGURE}>
						installs
					</Text>
				</div>
				{ranked.map((config) => (
					<InstallRow
						key={config.id}
						config={config}
						selected={config.id === selectedId}
						onSelect={onSelect}
					/>
				))}
			</div>
			{shelved.length === 0 ? null : (
				<div className={TAIL}>
					<div className={TAIL_HEAD}>
						<Text tone="muted" size="caption">
							{NEVER_INSTALLED}
						</Text>
						<Text tone="faint" size="caption" className={COUNT}>
							{shelved.length}
						</Text>
					</div>
					<div className={CHIPS}>
						{shelved.map((config) => (
							<Entry
								key={config.id}
								config={config}
								selected={config.id === selectedId}
								onSelect={onSelect}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

const Detail = ({ config }: { config: SeenConfig }) => (
	<div className={DETAIL}>
		<div className={DETAIL_HEAD}>
			<Slots slots={config.slots} solid />
			<Text className="font-bold">{config.label}</Text>
			<Text tone="faint" size="caption" className={DETAIL_META}>
				first seen gate {config.firstSeenGate} · {installLine(config.installs)}
			</Text>
		</div>
		<Text tone="muted" size="caption">
			<Figures text={config.effect} />
		</Text>
		<div className={DETAIL_LADDER}>
			<VersionTrack best={config.best} maxVersion={config.maxVersion} />
			<Text tone="faint" size="caption">
				{versionLine(config.best, config.maxVersion)}
			</Text>
		</div>
	</div>
);

const viewOf = (
	view: string,
	configs: readonly DexConfig[]
): readonly DexConfig[] => {
	if (view === "unseen") return configs.filter((config) => !isSeen(config));
	return configs;
};

export const ConfigsPanel = ({
	configs,
	view,
	onView,
	selectedId,
	onSelect,
}: ConfigsPanelProps) => {
	const shown = viewOf(view, configs);
	const selected = configs.filter(isSeen).find((c) => c.id === selectedId);

	return (
		<section className={PANEL}>
			<Tabs
				items={CONFIG_VIEWS}
				activeId={view}
				onSelect={onView}
				label="how to read the configs"
				variant="pill"
			/>
			<SlotKey configs={configs} />
			{view === "installs" ? (
				<ByInstalls
					configs={shown}
					selectedId={selectedId}
					onSelect={onSelect}
				/>
			) : (
				<Grouped configs={shown} selectedId={selectedId} onSelect={onSelect} />
			)}
			{selected === undefined ? null : <Detail config={selected} />}
		</section>
	);
};
