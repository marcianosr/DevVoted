import type {
	ConfigRole,
	RoleRow,
} from "~/modules/session-run/gate/configRole.model";
import type { CheckState } from "~/modules/session-run/configs/effect.model";
import { ConfigChip } from "../configs/ConfigChip.ui";

/** Status color follows the gate-check state — passed green, failed red, running hot. */
const STATE_TEXT: Record<CheckState, string> = {
	running: "text-vermillion",
	skipped: "text-pewter",
	success: "text-viridian",
	failed: "text-cinnabar",
};

/** Soft row tint once a check resolves — green passed, red failed, grey skipped. */
const STATE_ROW: Record<CheckState, string> = {
	running: "",
	skipped: "bg-pewter/5",
	success: "bg-viridian/10",
	failed: "bg-cinnabar/10",
};

const ROLE_LABEL: Record<ConfigRole, string> = {
	requirement: "Requirement",
	conditional: "Conditional",
	perk: "Perk",
};

const ROLE_BADGE: Record<ConfigRole, string> = {
	requirement: "bg-cinnabar text-white",
	conditional: "bg-pewter text-black",
	perk: "bg-viridian text-black",
};

const RoleBadge = ({ role }: { role: ConfigRole }) => (
	<span
		className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_BADGE[role]}`}
	>
		{ROLE_LABEL[role]}
	</span>
);

type RoleListProps = {
	rows: readonly RoleRow[];
	/** Removes a slotted config; omitted rows and fixed configs show no remove control. */
	onRemove?: (configId: string) => void;
};

/** The "Review your build" rows: every config stacked in one box, each with its typed badge. */
export const RoleList = ({ rows, onRemove }: RoleListProps) => (
	<ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-700">
		{rows.map((row) => (
			<li
				key={row.config.id}
				className={`flex items-center gap-3 px-4 py-3 ${row.state ? STATE_ROW[row.state] : ""}`}
			>
				<RoleBadge role={row.role} />
				<ConfigChip config={row.config} noTooltip />
				<span className="min-w-0 text-sm text-white">— {row.description}</span>
				{row.status ? (
					<span
						className={`ml-auto shrink-0 text-sm font-bold ${row.state ? STATE_TEXT[row.state] : "text-pewter"}`}
					>
						{row.status}
					</span>
				) : null}
				{onRemove && !row.config.fixed ? (
					<button
						type="button"
						onClick={() => onRemove(row.config.id)}
						aria-label={`Remove ${row.config.label}`}
						className={`shrink-0 text-pewter transition-colors hover:text-cinnabar ${row.status ? "" : "ml-auto"}`}
					>
						✕
					</button>
				) : null}
			</li>
		))}
	</ul>
);
