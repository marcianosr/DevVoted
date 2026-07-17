import { cva } from "class-variance-authority";
import type {
	ConfigRole,
	RoleRow,
} from "~/modules/session-run/gate/configRole.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { stateRow, stateText } from "./checkStateStyles";

const ROLE_LABEL: Record<ConfigRole, string> = {
	requirement: "Requirement",
	conditional: "Conditional",
	perk: "Perk",
};

const roleBadge = cva(
	"shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
	{
		variants: {
			role: {
				requirement: "bg-cinnabar text-white",
				conditional: "bg-pewter text-black",
				perk: "bg-viridian text-black",
			} satisfies Record<ConfigRole, string>,
		},
	}
);

const RoleBadge = ({ role }: { role: ConfigRole }) => (
	<span className={roleBadge({ role })}>{ROLE_LABEL[role]}</span>
);

const removeButton = cva(
	"shrink-0 cursor-pointer text-lg text-pewter transition-colors hover:text-cinnabar",
	{
		variants: {
			hasStatus: {
				true: "",
				false: "ml-auto",
			},
		},
	}
);

type RoleListProps = {
	rows: readonly RoleRow[];
	onRemove?: (configId: string) => void;
};

export const RoleList = ({ rows, onRemove }: RoleListProps) => (
	<ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-700">
		{rows.map((row) => (
			<li
				key={row.config.id}
				className={`flex items-center gap-3 px-4 py-3 ${stateRow({ state: row.state })}`}
			>
				<RoleBadge role={row.role} />
				<Paragraph className="min-w-0 text-sm text-white">
					· {row.description}
				</Paragraph>
				{row.status ? (
					<span
						className={`ml-auto shrink-0 text-sm font-bold ${row.state ? stateText({ state: row.state }) : "text-pewter"}`}
					>
						{row.status}
					</span>
				) : null}
				{onRemove && !row.config.fixed ? (
					<button
						type="button"
						onClick={() => onRemove(row.config.id)}
						aria-label={`Remove ${row.config.label}`}
						className={removeButton({ hasStatus: Boolean(row.status) })}
					>
						✕
					</button>
				) : null}
			</li>
		))}
	</ul>
);
