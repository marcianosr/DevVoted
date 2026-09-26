export const REDACTED = "???";

export const REDACTED_ITEM = "?";

export type Redactable<Secret, Stated = unknown> =
	| ({ locked: true } & { [Field in keyof Secret]?: never } & Stated)
	| ({ locked?: false } & Secret & Stated);

const REDACTION = "select-none opacity-40";
const READER_ONLY = "sr-only";

export type RedactionProps = {
	label?: string;
	short?: boolean;
};

export const Redaction = ({ label, short = false }: RedactionProps) => (
	<span className={REDACTION}>
		<span aria-hidden>{short ? REDACTED_ITEM : REDACTED}</span>
		{label === undefined ? null : <span className={READER_ONLY}>{label}</span>}
	</span>
);
