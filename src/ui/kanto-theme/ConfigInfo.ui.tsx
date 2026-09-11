import { Badge } from "./Badge.ui";
import { Figures } from "./Figures.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Version } from "./Version.ui";
import { Weight } from "./Weight.ui";

const WIDTH = "w-80";
const TITLE_ROW = "flex items-center gap-2";
const NAME = "text-sm font-extrabold text-theme-faint";
const TRAILING = "ml-auto flex shrink-0 items-center gap-2";
const NO_UPGRADES = "text-xs text-theme-muted";

const PROSE =
	"flex flex-wrap items-center gap-1.5 text-xs font-normal text-theme-soft";
const NOTE =
	"flex flex-wrap items-center gap-1.5 text-xs font-normal text-theme-muted";

const DIVIDER = "border-t border-theme-faint";
const FOOTER = "flex items-center gap-2 text-xs text-theme-muted";
const SELL = "ml-auto flex shrink-0 items-center gap-1.5";
const WEIGHT = "flex shrink-0 items-center gap-1.5";

const NO_UPGRADES_LABEL = "no upgrades";
const SELL_LABEL = "sells for";
const WEIGHT_LABEL = "weight";
const SLOTS_LABEL = "slots";
const SINGLE_VERSION = 1;
const NOTE_GAIN: KantoColor = "saffron";

export type ConfigInfoProps = {
	name: string;
	description: string;
	slots: number;
	sellPrice: string;
	version?: number;
	maxVersion?: number;
	note?: string;
};

export const ConfigInfo = ({
	name,
	description,
	slots,
	sellPrice,
	version,
	maxVersion,
	note,
}: ConfigInfoProps) => {
	const rungs = maxVersion ?? SINGLE_VERSION;

	return (
		<Panel className={WIDTH}>
			<div className={TITLE_ROW}>
				<span className={NAME}>{name}</span>
				{version === undefined ? null : <Version version={version} />}
				{rungs <= SINGLE_VERSION ? (
					<span className={TRAILING}>
						<span className={NO_UPGRADES}>{NO_UPGRADES_LABEL}</span>
					</span>
				) : null}
			</div>

			<p className={PROSE}>
				<Figures text={description} />
			</p>

			{note === undefined ? null : (
				<p className={NOTE}>
					<Figures text={note} gain={NOTE_GAIN} />
				</p>
			)}

			<div className={DIVIDER} />

			<div className={FOOTER}>
				<span className={WEIGHT}>
					<span>{WEIGHT_LABEL}</span>
					<Weight slots={slots} />
					<span>{SLOTS_LABEL}</span>
				</span>
				<span className={SELL}>
					<span>{SELL_LABEL}</span>
					<Badge>{sellPrice}</Badge>
				</span>
			</div>
		</Panel>
	);
};
