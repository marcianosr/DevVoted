import { clsx } from "clsx";

import { AUDIT, type AuditId } from "./audits";
import { Chip } from "./Chip.ui";
import { Entry } from "./Entry.ui";
import { Fold } from "./Fold.ui";
import { Glyph } from "./Glyph.ui";
import { Text } from "./Text.ui";

const STRUCK = "line-through";

const ALERTS = "flex flex-col gap-2";
const ALERT =
	"flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border border-saffron/40 bg-saffron/5 px-3 py-2";
const MARK = "self-center";
const LIVE = "text-saffron";
const SUPPRESSED = "text-zinc-500";

export type AuditRow = {
	/** The name and the icon come off the id, so an audit cannot be called one
	 * thing here and another in the Dex. The wording of its effect stays local:
	 * a screen says what it does to THIS gate, the Dex states the general rule. */
	id: AuditId;
	description: string;
	/** Volkswagen CI is reporting this one as passing. Struck through, never
	 * hidden: the fraud stays on the receipt (ADR-028). */
	suppressed?: boolean;
};

export type AuditsProps = {
	audits: readonly AuditRow[];
	defaultOpen?: boolean;
};

export type AuditAlertsProps = { audits: readonly AuditRow[] };

export const AuditAlerts = ({ audits }: AuditAlertsProps) =>
	audits.length === 0 ? null : (
		<ul className={ALERTS}>
			{audits.map((audit) => (
				<li key={audit.id} className={ALERT}>
					<Glyph
						name={AUDIT[audit.id].glyph}
						className={clsx(MARK, audit.suppressed ? SUPPRESSED : LIVE)}
					/>
					<Text
						size="meta"
						tone={audit.suppressed ? "muted" : "saffron"}
						className={audit.suppressed ? STRUCK : undefined}
					>
						{AUDIT[audit.id].label}
					</Text>
					<Text size="meta" tone="muted">
						{audit.description}
					</Text>
					{audit.suppressed ? (
						<Chip tone="celadon">reported passing</Chip>
					) : null}
				</li>
			))}
		</ul>
	);

const runningCount = (audits: readonly AuditRow[]) =>
	audits.filter((audit) => !audit.suppressed).length;

export const Audits = ({ audits, defaultOpen = false }: AuditsProps) => (
	<Fold
		title="Audits"
		defaultOpen={defaultOpen}
		value={
			<Text size="meta" tone="saffron">
				{runningCount(audits)} running
			</Text>
		}
		items={audits.map((audit) => ({
			id: audit.id,
			content: (
				<Entry
					leading={
						<Glyph
							name={AUDIT[audit.id].glyph}
							className={audit.suppressed ? "text-zinc-500" : "text-saffron"}
						/>
					}
					dimmed={audit.suppressed}
					label={
						audit.suppressed ? (
							<span className={STRUCK}>{AUDIT[audit.id].label}</span>
						) : (
							AUDIT[audit.id].label
						)
					}
					notes={
						<>
							<Text size="meta" tone="muted">
								{audit.description}
							</Text>
							{audit.suppressed ? (
								<Chip tone="celadon">reported passing</Chip>
							) : null}
						</>
					}
				/>
			),
		}))}
	/>
);
