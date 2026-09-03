import { Redacted } from "../Redacted.ui";
import { Text } from "../Text.ui";

const PANEL = "flex flex-col divide-y divide-edge py-2";
const CLASS_BLOCK = "flex flex-col gap-2 py-3";
const CLASS_HEAD = "flex items-baseline gap-2";
const COUNT = "ml-auto shrink-0";
const LIST = "flex flex-col";
const CHIPS = "flex flex-wrap gap-2";

// Four columns at width, and at narrow the rule drops to its own line under the
// name rather than squeezing three readings into one row.
const AUDIT_ROW =
	"grid grid-cols-[3.5rem_11rem_1fr_3.5rem] items-baseline gap-x-3 gap-y-1 py-1.5 @max-md:grid-cols-[3.5rem_1fr_3.5rem]";
const CODE =
	"justify-self-start rounded border border-zinc-700 px-1.5 py-0.5 text-xs tabular-nums text-zinc-300";
const RULE = "@max-md:col-span-2 @max-md:col-start-2 @max-md:row-start-2";
const FACED =
	"text-right whitespace-nowrap @max-md:col-start-3 @max-md:row-start-1";

export type DexAudit = {
	code: number;
	name: string;
	rule: string;
	/** Climbs that played a gate carrying it, and climbs that got past it. */
	faced: number;
	beaten: number;
};

export type DexAuditClass = {
	/** The HTTP status class, "4xx". Its first character is also the shape its
	 * redactions keep, so an unreached client fault still reads as one. */
	code: string;
	label: string;
	audits: readonly DexAudit[];
	unseen: number;
	/** Why the unreached ones are unreached, where the game has an answer. */
	note?: string;
};

export type AuditsPanelProps = { classes: readonly DexAuditClass[] };

const AuditRow = ({ audit }: { audit: DexAudit }) => (
	<div className={AUDIT_ROW}>
		<span className={CODE}>{audit.code}</span>
		<Text className="font-bold">{audit.name}</Text>
		<Text tone="muted" size="caption" className={RULE}>
			{audit.rule}
		</Text>
		<Text tone="faint" size="caption" className={FACED}>
			{audit.beaten} / {audit.faced}
		</Text>
	</div>
);

const AuditClass = ({ group }: { group: DexAuditClass }) => (
	<section className={CLASS_BLOCK}>
		<header className={CLASS_HEAD}>
			<Text className="font-bold">{group.code}</Text>
			<Text tone="faint">·</Text>
			<Text tone="muted">{group.label}</Text>
			<Text tone="faint" size="caption" className={COUNT}>
				{group.audits.length} of {group.audits.length + group.unseen}
			</Text>
		</header>
		{group.audits.length === 0 ? null : (
			<div className={LIST}>
				{group.audits.map((audit) => (
					<AuditRow key={audit.code} audit={audit} />
				))}
			</div>
		)}
		{group.unseen === 0 ? null : (
			<div className={CHIPS}>
				{Array.from({ length: group.unseen }, (_, index) => (
					<Redacted key={index} label={`${group.code.charAt(0)}??`} />
				))}
			</div>
		)}
		{group.note === undefined ? null : (
			<Text tone="faint" size="caption">
				{group.note}
			</Text>
		)}
	</section>
);

export const AuditsPanel = ({ classes }: AuditsPanelProps) => (
	<div className={PANEL}>
		{classes.map((group) => (
			<AuditClass key={group.code} group={group} />
		))}
	</div>
);
