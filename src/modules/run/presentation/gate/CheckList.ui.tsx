import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import {
	type Config,
	describeConfig,
} from "~/modules/run/configs/config.model";
import type {
	CheckState,
	CheckStatus,
} from "~/modules/run/configs/effect.model";
import {
	gateRowDescription,
	roleOf,
} from "~/modules/run/gate/configRole.model";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { stateText } from "./checkStateStyles";

export const STATE_ICON: Record<CheckState, string> = {
	running: "●",
	skipped: "⊘",
	success: "✓",
	failed: "✕",
};

const NEUTRAL_TONE = "neutral";
type RowTone = CheckState | typeof NEUTRAL_TONE;

// No outline — every row carries its own state-colored accent bar on the left
// with a soft gradient fading out of it (Marciano's pipeline-row design).
// Success stays green, running saffron, skipped/stateless gray.
const rowTone = cva(
	"flex items-center justify-between gap-3 border-l-4 px-4 py-3",
	{
		variants: {
			tone: {
				running: "border-saffron bg-linear-to-r from-saffron/10 to-transparent",
				skipped: "border-zinc-700",
				success:
					"border-viridian bg-linear-to-r from-viridian/10 to-transparent",
				failed:
					"border-cinnabar bg-linear-to-r from-cinnabar/10 to-transparent",
				neutral: "border-zinc-700",
			} satisfies Record<RowTone, string>,
		},
		defaultVariants: {
			tone: NEUTRAL_TONE,
		},
	}
);

type PipelineRow = {
	key: string;
	icon: ReactNode;
	config?: Config;
	text: ReactNode;
	textClass?: string;
	trailing?: ReactNode;
	state?: CheckState;
};

export const PipelineRowList = ({ rows }: { rows: readonly PipelineRow[] }) => (
	<ul className="divide-y divide-white/5 overflow-hidden rounded-r-xl bg-zinc-900/30">
		{rows.map((row) => (
			<li key={row.key} className={rowTone({ tone: row.state })}>
				{/* Inline flow, not flex: long descriptions wrap under the chip
				    instead of hanging in their own column beside it. */}
				<span className="min-w-0 text-sm leading-7">
					{row.config ? <ConfigChip config={row.config} noTooltip /> : row.icon}
					<span
						className={`ml-2 align-middle ${row.textClass ?? "text-white"}`}
					>
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

export const CheckList = ({ checks, configs }: CheckListProps) => {
	return (
		<PipelineRowList
			rows={checks.map((check) => {
				const source = configs.find(
					(config) => config.id === check.sourceConfigId
				);
				return {
					key: check.label,
					state: check.state,
					icon: (
						<span className={stateText({ state: check.state })}>
							{STATE_ICON[check.state]}
						</span>
					),
					config: source,
					// The row states the demand the gate actually judges (escalated),
					// inline — the source chip's hover tooltip is clipped by the box.
					text: source
						? gateRowDescription(source, roleOf(source, checks), check)
						: (check.description ?? check.label),
					trailing: (
						<span className={stateText({ state: check.state })}>
							{check.progress}
						</span>
					),
				};
			})}
		/>
	);
};

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
