import { clsx } from "clsx";

const MARK =
	"inline-flex items-center rounded-lg border border-dashed border-zinc-800 px-2.5 py-1 text-sm whitespace-nowrap text-zinc-600";

export const REDACTED = "???";

/** A slot in the catalogue you have not reached. It holds the shape of the
 * thing — a status class, a count — and never its name. */
export type RedactedProps = {
	label?: string;
	className?: string;
};

export const Redacted = ({ label = REDACTED, className }: RedactedProps) => (
	<span className={clsx(MARK, className)}>{label}</span>
);
