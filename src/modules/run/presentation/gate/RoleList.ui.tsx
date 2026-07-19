import type { ReactNode } from "react";
import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { PipelineRowList, STATE_ICON } from "./CheckList.ui";
import { stateText } from "./checkStateStyles";

const roleIcon = (row: RoleRow): ReactNode => {
	if (row.state)
		return (
			<span className={stateText({ state: row.state })}>
				{STATE_ICON[row.state]}
			</span>
		);
	if (row.role === "perk") return <span className="text-viridian">＋</span>;
	return <span className="text-pewter">●</span>;
};

type RoleListProps = {
	rows: readonly RoleRow[];
	onRemove?: (configId: string) => void;
};

export const RoleList = ({ rows, onRemove }: RoleListProps) => (
	<PipelineRowList
		rows={rows.map((row) => ({
			key: row.config.id,
			state: row.state,
			icon: roleIcon(row),
			config: row.config,
			text: row.description,
			trailing:
				row.status || (onRemove && !row.config.fixed) ? (
					<span className="flex items-center gap-3">
						{row.status ? (
							<span
								className={`text-sm font-bold ${row.state ? stateText({ state: row.state }) : "text-pewter"}`}
							>
								{row.status}
							</span>
						) : null}
						{onRemove && !row.config.fixed ? (
							<button
								type="button"
								onClick={() => onRemove(row.config.id)}
								aria-label={`Remove ${row.config.label}`}
								className="shrink-0 cursor-pointer text-lg text-pewter transition-colors hover:text-cinnabar"
							>
								✕
							</button>
						) : null}
					</span>
				) : undefined,
		}))}
	/>
);
