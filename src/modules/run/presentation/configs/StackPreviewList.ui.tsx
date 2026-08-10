import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { emphasizeNumbers } from "~/modules/run/presentation/gate/PipelineReportRow.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "./ConfigChip.ui";

type StackPreviewListProps = {
	rows: readonly RoleRow[];
};

/**
 * The picked stack's rows, trimmed to what matters for choosing (ADR-026):
 * each config's demand and payoff, always visible — no live progress (there
 * is no run yet, see `preRunRoleRows`) and no secondary mechanics (a linter's
 * escalating fee) until asked for. "Preset view = what matters for choosing;
 * expanded config = precise mechanics" (Marciano, 2026-08-10) — the full
 * RoleList detail is one tap away via `costs`.
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
	<span className="flex items-center gap-1.5">
		<span
			className={clsx(
				"font-bold",
				cinnabar ? "text-cinnabar" : "text-viridian"
			)}
		>
			{icon}
		</span>
		<Paragraph as="span" size="xs" tone={cinnabar ? "cinnabar" : "viridian"}>
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
				<ConfigChip config={row.config} noTooltip />
			</div>
			{/* Check and reward share one row (Marciano, 2026-08-10): a stacked
			    pair of full-height fact rows per config made the picked stack read
			    taller than the pack picker it lives inside. */}
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6">
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
						className="cursor-pointer text-xs text-pewter underline decoration-dotted underline-offset-2 hover:text-zinc-300"
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
