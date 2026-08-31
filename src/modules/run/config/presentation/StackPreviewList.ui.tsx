import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

import type { RoleRow } from "~/modules/run/gate/domain/configRole.model";
import {
	describeRow,
	emphasizeNumbers,
} from "~/modules/run/build/presentation/BuildReportRow.ui";
import { roleBadge } from "~/modules/run/gate/presentation/RoleList.ui";
import { StatusDot } from "~/ui/StatusDot.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";

type StackPreviewListProps = {
	rows: readonly RoleRow[];
};

/**
 * The picked stack's rows, trimmed to what matters for choosing (ADR-026):
 * each config's payoff on its own plain line. Secondary mechanics (a linter's
 * escalating fee) still wait until asked for. "Preset view = what matters for
 * choosing; expanded config = precise mechanics" (Marciano, 2026-08-10) — the
 * full RoleList detail is one tap away via `costs`.
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

	return (
		<li className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<Paragraph
					as="span"
					size="xs"
					tone="muted"
					className="w-4 shrink-0 text-right tabular-nums"
				>
					{index}
				</Paragraph>
				<StatusDot variant={roleBadge(row)} />
				<ConfigChip config={row.config} noTooltip />
			</div>
			<div className="flex flex-col gap-0.5 pl-6">
				{row.gives ? (
					<CompactFact icon="v">{emphasizeNumbers(row.gives)}</CompactFact>
				) : (
					<Paragraph size="xs" tone="muted">
						{describeRow(row.config, row.reason)}
					</Paragraph>
				)}
				{row.costs ? (
					<button
						type="button"
						onClick={() => setDetailsOpen((current) => !current)}
						className="cursor-pointer self-start text-xs text-pewter underline decoration-dotted underline-offset-2 hover:text-zinc-100"
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
