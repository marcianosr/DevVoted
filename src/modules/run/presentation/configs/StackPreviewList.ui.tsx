import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { emphasizeNumbers } from "~/modules/run/presentation/gate/PipelineReportRow.ui";
import { roleBadge } from "~/modules/run/presentation/gate/RoleList.ui";
import { StatusDot } from "~/ui/StatusDot.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "./ConfigChip.ui";

type StackPreviewListProps = {
	rows: readonly RoleRow[];
};

/**
 * The picked stack's rows, trimmed to what matters for choosing (ADR-026):
 * each config's demand and payoff, always visible, its check and reward
 * stacked as two plain lines rather than side by side (Marciano, 2026-08-11)
 * — and its live state dot restored, the same one RoleList shows, since
 * `preRunRoleRows` never actually stripped `state` (only `status`/`note`).
 * Secondary mechanics (a linter's escalating fee) still wait until asked for.
 * "Preset view = what matters for choosing; expanded config = precise
 * mechanics" (Marciano, 2026-08-10) — the full RoleList detail is one tap
 * away via `costs`.
 */
export const StackPreviewList = ({ rows }: StackPreviewListProps) => (
	<ol className="flex flex-col gap-3">
		{rows.map((row, index) => (
			<StackPreviewRow key={row.config.id} index={index + 1} row={row} />
		))}
	</ol>
);

const CompactFact = ({
	icon,
	cinnabar,
	children,
}: {
	icon: string;
	cinnabar?: boolean;
	children: ReactNode;
}) => (
	<span className="flex items-center gap-1.5 leading-tight">
		<span
			className={clsx(
				"font-bold",
				cinnabar ? "text-cinnabar" : "text-viridian"
			)}
		>
			{icon}
		</span>
		<Paragraph
			as="span"
			size="xs"
			tone={cinnabar ? "cinnabar" : "viridian"}
			className="leading-tight"
		>
			{children}
		</Paragraph>
	</span>
);

const StackPreviewRow = ({ index, row }: { index: number; row: RoleRow }) => {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const hasFacts = Boolean(row.needs || row.gives);

	return (
		<li className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<Paragraph
					as="span"
					size="xs"
					tone="faint"
					className="w-4 shrink-0 text-right tabular-nums"
				>
					{index}
				</Paragraph>
				<StatusDot variant={roleBadge(row)} />
				<ConfigChip config={row.config} noTooltip />
			</div>
			{/* Check and reward each get their own line (Marciano, 2026-08-11) —
			    stacked reads closer to how the full RoleList row lays them out,
			    unlike the prior side-by-side wrap. */}
			<div className="flex flex-col gap-0.5 pl-6">
				{hasFacts ? (
					<>
						{row.needs ? (
							<CompactFact icon="!" cinnabar>
								{row.needs}
							</CompactFact>
						) : null}
						{row.gives ? (
							<CompactFact icon="v">{emphasizeNumbers(row.gives)}</CompactFact>
						) : null}
					</>
				) : (
					<Paragraph size="xs" tone="muted">
						{row.description}
					</Paragraph>
				)}
				{row.costs ? (
					<button
						type="button"
						onClick={() => setDetailsOpen((current) => !current)}
						className="cursor-pointer self-start text-xs text-pewter underline decoration-dotted underline-offset-2 hover:text-zinc-300"
					>
						{detailsOpen ? "▾ hide the fine print" : "▸ more details"}
					</button>
				) : null}
			</div>
			{row.costs && detailsOpen ? (
				<Paragraph as="span" size="xs" tone="vermillion" className="pl-6">
					{row.costs}
				</Paragraph>
			) : null}
		</li>
	);
};
