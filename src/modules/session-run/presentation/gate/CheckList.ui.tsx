import { cva } from "class-variance-authority";
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
import { stateRow, stateText } from "./checkStateStyles";

const STATE_ICON: Record<CheckState, string> = {
	running: "●",
	skipped: "⊘",
	success: "✓",
	failed: "✕",
};

const NEUTRAL_TONE = "neutral";
type BoxTone = CheckState | typeof NEUTRAL_TONE;

const pipelineBox = cva("", {
	variants: {
		tone: {
			running: "border-saffron divide-saffron/25",
			skipped: "border-zinc-700 divide-zinc-800",
			success: "border-viridian divide-viridian/25",
			failed: "border-cinnabar divide-cinnabar/25",
			neutral: "border-zinc-700 divide-zinc-800",
		} satisfies Record<BoxTone, string>,
	},
	defaultVariants: {
		tone: NEUTRAL_TONE,
	},
});

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
	boxClass,
}: {
	rows: readonly PipelineRow[];
	boxClass?: string;
}) => (
	<ul
		className={`divide-y overflow-hidden rounded-xl border ${boxClass ?? pipelineBox({})}`}
	>
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

export const CheckList = ({ checks, configs }: CheckListProps) => {
	const tone = uniformState(checks);
	return (
		<PipelineRowList
			boxClass={pipelineBox({ tone })}
			rows={checks.map((check) => {
				const source = configs.find(
					(config) => config.id === check.sourceConfigId
				);
				return {
					key: check.label,
					icon: (
						<span className={stateText({ state: check.state })}>
							{STATE_ICON[check.state]}
						</span>
					),
					config: source,
					// Show the full description inline — the source chip's hover tooltip is
					// clipped by the box's overflow, so the row itself carries it.
					text: source
						? describeConfig(source)
						: (check.description ?? check.label),
					rowClass: stateRow({ state: check.state }),
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
