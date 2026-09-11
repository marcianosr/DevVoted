import { clsx } from "clsx";

import { Redaction, type Redactable } from "./Redaction.ui";

const AUDIT_COLOR = "saffron";
const LOCKED_LABEL = "Locked audit";

const AUDIT =
	"flex items-stretch overflow-hidden rounded-lg border border-theme-faint";
const CODE =
	"flex shrink-0 items-center bg-theme-raised px-3 text-sm font-bold text-theme-soft";
const BODY = "flex min-w-0 flex-col gap-0.5 px-3 py-2";
const NAME = "text-sm font-bold text-theme-soft";
const CUE = "text-xs text-theme-faint opacity-60";

const ROW = "flex w-full flex-wrap items-baseline gap-3";
const ROW_CODE =
	"shrink-0 rounded-md bg-theme-raised px-2 py-0.5 text-sm font-bold text-theme-soft";

export type AuditLayout = "fit" | "full" | "row";

const CARD_WIDTH = {
	fit: "w-fit",
	full: "w-full",
} satisfies Record<Exclude<AuditLayout, "row">, string>;

export type AuditProps = Redactable<{
	code: number;
	name: string;
	cue: string;
}> & { layout?: AuditLayout };

export const Audit = ({ layout = "fit", ...props }: AuditProps) => {
	const code = props.locked ? <Redaction label={LOCKED_LABEL} /> : props.code;
	const name = props.locked ? <Redaction /> : props.name;
	const cue = props.locked ? <Redaction /> : props.cue;

	if (layout === "row") {
		return (
			<div data-screen-theme={AUDIT_COLOR} className={ROW}>
				<span className={ROW_CODE}>{code}</span>
				<span className={NAME}>{name}</span>
				<span className={CUE}>{cue}</span>
			</div>
		);
	}

	return (
		<div
			data-screen-theme={AUDIT_COLOR}
			className={clsx(AUDIT, CARD_WIDTH[layout])}
		>
			<span className={CODE}>{code}</span>
			<span className={BODY}>
				<span className={NAME}>{name}</span>
				<span className={CUE}>{cue}</span>
			</span>
		</div>
	);
};
