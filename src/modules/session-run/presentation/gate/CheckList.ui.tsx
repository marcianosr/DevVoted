import type { ReactNode } from "react";
import {
	type Config,
	describeConfig,
} from "~/modules/session-run/configs/config.model";
import type {
	CheckState,
	CheckStatus,
} from "~/modules/session-run/configs/effect.model";
import { ConfigChip } from "../configs/ConfigChip.ui";

const STATE_TEXT: Record<CheckState, string> = {
	running: "text-vermillion",
	skipped: "text-pewter",
	success: "text-viridian",
	failed: "text-cinnabar",
};

const STATE_ICON: Record<CheckState, string> = {
	running: "●",
	skipped: "⊘",
	success: "✓",
	failed: "✕",
};

/** Row background tint per check state — green passed, red failed, grey skipped. */
const STATE_ROW: Record<CheckState, string> = {
	running: "bg-vermillion/10",
	skipped: "bg-pewter/5",
	success: "bg-viridian/30",
	failed: "bg-cinnabar/30",
};

const STATE_BOX: Record<CheckState, string> = {
	running: "border-vermillion divide-vermillion/25",
	skipped: "border-zinc-700 divide-zinc-800",
	success: "border-viridian divide-viridian/25",
	failed: "border-cinnabar divide-cinnabar/25",
};

const NEUTRAL_BOX = "border-zinc-700 divide-zinc-800";

const uniformState = (
	checks: readonly CheckStatus[]
): CheckState | undefined => {
	const [first] = checks;
	if (!first) return undefined;
	return checks.every((check) => check.state === first.state)
		? first.state
		: undefined;
};

type PipelineRow = {
	key: string;
	icon: ReactNode;
	config?: Config;
	text: ReactNode;
	textClass?: string;
	rowClass?: string;
	trailing?: ReactNode;
};

const PipelineRowList = ({
	rows,
	boxClass = NEUTRAL_BOX,
}: {
	rows: readonly PipelineRow[];
	boxClass?: string;
}) => (
	<ul className={`divide-y overflow-hidden rounded-xl border ${boxClass}`}>
		{rows.map((row) => (
			<li
				key={row.key}
				className={`flex items-center justify-between gap-3 px-4 py-2 ${row.rowClass ?? ""}`}
			>
				<span className="flex min-w-0 items-center gap-2">
					{row.icon}
					{row.config ? <ConfigChip config={row.config} noTooltip /> : null}
					<span className={`text-sm ${row.textClass ?? "text-white"}`}>
						{row.text}
					</span>
				</span>
				{row.trailing ? <span className="shrink-0">{row.trailing}</span> : null}
			</li>
		))}
	</ul>
);

type CheckListProps = {
	checks: readonly CheckStatus[];
	configs: readonly Config[];
};

/** Gate requirements as pipeline rows — state icon, source chip, description, progress. */
export const CheckList = ({ checks, configs }: CheckListProps) => {
	const tone = uniformState(checks);
	return (
		<PipelineRowList
			boxClass={tone ? STATE_BOX[tone] : NEUTRAL_BOX}
			rows={checks.map((check) => {
				const source = configs.find(
					(config) => config.id === check.sourceConfigId
				);
				return {
					key: check.label,
					icon: (
						<span className={STATE_TEXT[check.state]}>
							{STATE_ICON[check.state]}
						</span>
					),
					config: source,
					// Show the full description inline — the source chip's hover tooltip is
					// clipped by the box's overflow, so the row itself carries it.
					text: source
						? describeConfig(source)
						: (check.description ?? check.label),
					rowClass: STATE_ROW[check.state],
					trailing: (
						<span className={STATE_TEXT[check.state]}>{check.progress}</span>
					),
				};
			})}
		/>
	);
};

/** Always-on perks as pipeline rows — the same boxed style, marked with ＋. */
export const PerkList = ({ perks }: { perks: readonly Config[] }) => (
	<PipelineRowList
		rows={perks.map((perk) => ({
			key: perk.id,
			icon: <span className="text-viridian">＋</span>,
			config: perk,
			text: describeConfig(perk),
			textClass: "text-pewter",
		}))}
	/>
);
