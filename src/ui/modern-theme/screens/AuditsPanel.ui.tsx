import { clsx } from "clsx";

import { AUDIT, type AuditId } from "../audits";
import { Glyph } from "../Glyph.ui";
import { Mark } from "../Mark.ui";
import { Text } from "../Text.ui";

const PANEL = "flex flex-col gap-3 py-2";
const LIST = "flex flex-col gap-3";

const AUDIT_ROW =
	"grid grid-cols-[1.25rem_1fr] items-start gap-x-3 gap-y-1 px-2";
const HEAD = "flex flex-wrap items-baseline gap-2";
const NAME = "min-w-0";
const STATUS = "ml-auto shrink-0";
const RULE = "col-start-2";

const ICON = "mt-0.5";

const DIMMED = "opacity-50";

const REDACTED = "???";

export type AuditTier = "faced" | "unlocked" | "unseen";

export type DexAudit =
	| {
			id: AuditId;
			tier: "faced" | "unlocked";
			gates: readonly number[];
			rule: string;
	  }
	| { id: string; tier: "unseen"; gates?: never };

export type AuditsPanelProps = { audits: readonly DexAudit[] };

const gateLabel = (gates: readonly number[]) =>
	gates.length === 1 ? `gate ${gates[0]}` : `gates ${gates.join(", ")}`;

const AuditRow = ({ audit }: { audit: DexAudit }) => {
	if (audit.tier === "unseen")
		return (
			<li className={clsx(AUDIT_ROW, DIMMED)}>
				<Mark variant="blank" />
				<span className={HEAD}>
					<Text size="body" tone="muted">
						{REDACTED}
					</Text>
				</span>
				<Text as="p" size="meta" tone="muted" className={RULE}>
					{REDACTED}
				</Text>
			</li>
		);

	const faced = audit.tier === "faced";

	return (
		<li className={clsx(AUDIT_ROW, faced ? undefined : DIMMED)}>
			<Glyph
				name={AUDIT[audit.id].glyph}
				className={clsx(ICON, faced ? "text-saffron" : "text-zinc-500")}
			/>
			<span className={HEAD}>
				<Text size="body" className={NAME}>
					{AUDIT[audit.id].label}
				</Text>
				<Text size="meta" tone="muted">
					{gateLabel(audit.gates)}
				</Text>
				{faced ? (
					<Text size="meta" tone="celadon" className={STATUS}>
						faced
					</Text>
				) : null}
			</span>
			<Text as="p" size="meta" tone="muted" className={RULE}>
				{audit.rule}
			</Text>
		</li>
	);
};

export const AuditsPanel = ({ audits }: AuditsPanelProps) => (
	<section className={PANEL}>
		<Text as="p" size="meta" tone="muted">
			Fixed rules a gate carries. One from gate 3, two from gate 8, three from
			gate 11.
		</Text>
		<ul className={LIST}>
			{audits.map((audit) => (
				<AuditRow key={audit.id} audit={audit} />
			))}
		</ul>
	</section>
);
