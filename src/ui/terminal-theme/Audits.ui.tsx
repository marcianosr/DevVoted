import { clsx } from "clsx";

import { AuditIcon } from "./AuditIcon.ui";
import { DexChip } from "./DexChip.ui";
import { Text } from "./Text.ui";

const LIST = "flex flex-col gap-2";
const LINE =
	"flex items-start gap-x-2 rounded-lg border border-saffron/30 bg-saffron/5 px-3 py-1.5";
const MARK = "mt-0.5 text-saffron";
const MARK_PASSING = "mt-0.5 text-viridian";
const BODY = "flex min-w-0 flex-1 flex-col gap-y-0.5";
const TITLE = "flex flex-wrap items-center gap-x-2";
const CODE = "shrink-0 font-bold";
const NAME = "shrink-0 font-bold";
const CUE = "min-w-0";
const BY = "shrink-0 py-0 text-xs";

export type AuditNote = {
	code: string;
	name: string;
	cue: string;
	suppressed?: boolean;
	suppressedBy?: {
		label: string;
		slots: number;
		version: number;
		maxVersion: number;
	};
};

const SUPPRESSED_LINE = "border-edge bg-transparent";
const STRUCK = "line-through";
export const SUPPRESSED_CUE = "reported passing";

export type AuditsProps = {
	rows: readonly AuditNote[];
	className?: string;
};

export const Audits = ({ rows, className }: AuditsProps) => {
	if (rows.length === 0) return null;

	return (
		<div className={clsx(LIST, className)}>
			{rows.map((row) => (
				<span
					key={row.code}
					className={clsx(LINE, row.suppressed === true && SUPPRESSED_LINE)}
				>
					<AuditIcon
						passing={row.suppressed === true}
						className={row.suppressed === true ? MARK_PASSING : MARK}
					/>
					<span className={BODY}>
						<span className={TITLE}>
							<Text
								tone={row.suppressed === true ? "faint" : "saffron"}
								className={clsx(CODE, row.suppressed === true && STRUCK)}
							>
								{row.code}
							</Text>
							<Text
								tone={row.suppressed === true ? "faint" : "saffron"}
								className={clsx(NAME, row.suppressed === true && STRUCK)}
							>
								{row.name}
							</Text>
							{row.suppressedBy === undefined ? null : (
								<DexChip
									slots={row.suppressedBy.slots}
									label={row.suppressedBy.label}
									version={row.suppressedBy.version}
									maxVersion={row.suppressedBy.maxVersion}
									className={BY}
								/>
							)}
						</span>

						<Text
							tone={row.suppressed === true ? "viridian" : "muted"}
							size="caption"
							weight="thin"
							className={CUE}
						>
							{row.suppressed === true ? SUPPRESSED_CUE : row.cue}
						</Text>
					</span>
				</span>
			))}
		</div>
	);
};
