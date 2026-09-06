import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { DexChip } from "./DexChip.ui";
import { Text } from "./Text.ui";

const LIST = "flex flex-col gap-2";
const LINE =
	"flex flex-wrap items-center gap-x-2 rounded-lg border border-saffron/30 bg-saffron/5 px-3 py-1";
const CHIP = "shrink-0 py-0 text-xs";
const DETAIL = "min-w-0";

export type UnlockNote = {
	label: string;
	detail: string;
	slots: number;
	version: number;
	maxVersion: number;
};

export type UnlocksProps = {
	rows: readonly UnlockNote[];
	className?: string;
};

export const Unlocks = ({ rows, className }: UnlocksProps) => {
	if (rows.length === 0) return null;

	return (
		<div className={clsx(LIST, className)}>
			{rows.map((row) => (
				<span key={row.label} className={LINE}>
					<Badge tone="saffron" size="sm">
						unlocked
					</Badge>
					<DexChip
						slots={row.slots}
						label={row.label}
						version={row.version}
						maxVersion={row.maxVersion}
						className={CHIP}
					/>
					<Text tone="muted" size="caption" weight="thin" className={DETAIL}>
						{row.detail}
					</Text>
				</span>
			))}
		</div>
	);
};
