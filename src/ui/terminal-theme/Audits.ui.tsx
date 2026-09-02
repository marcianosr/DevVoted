import { clsx } from "clsx";

import { Text } from "./Text.ui";

const LIST = "flex flex-col gap-2";
const LINE =
	"flex flex-wrap items-center gap-x-2 rounded-lg border border-saffron/30 bg-saffron/5 px-3 py-1";
const MARK = "shrink-0 text-saffron";
const CODE = "shrink-0 font-bold";
const NAME = "shrink-0";
const CUE = "min-w-0";
const AUDIT_MARK = "⚠";

export type AuditNote = {
	code: string;
	name: string;
	cue: string;
	suppressed?: boolean;
};

const SUPPRESSED_LINE = "border-edge bg-transparent";
const STRUCK = "line-through";
const SUPPRESSED_CUE = "reported passing";

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
					<span aria-hidden className={MARK}>
						{AUDIT_MARK}
					</span>
					<Text
						tone={row.suppressed === true ? "faint" : "saffron"}
						size="caption"
						className={clsx(CODE, row.suppressed === true && STRUCK)}
					>
						{row.code}
					</Text>
					<Text
						tone={row.suppressed === true ? "faint" : "saffron"}
						size="caption"
						className={clsx(NAME, row.suppressed === true && STRUCK)}
					>
						{row.name}
					</Text>
					<Text
						tone={row.suppressed === true ? "viridian" : "muted"}
						size="caption"
						className={CUE}
					>
						{row.suppressed === true ? SUPPRESSED_CUE : row.cue}
					</Text>
				</span>
			))}
		</div>
	);
};
