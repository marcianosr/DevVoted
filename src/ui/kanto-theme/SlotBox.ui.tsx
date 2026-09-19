const BOX =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-theme-faint px-4 py-2 text-sm";

const EMPTY_WORDS = "text-theme-muted";

const EMPTY_LABEL = "empty slot";

export type SlotBoxProps = {
	label?: string;
};

export const SlotBox = ({ label = EMPTY_LABEL }: SlotBoxProps) => (
	<div aria-hidden className={BOX}>
		<span className={EMPTY_WORDS}>{label}</span>
	</div>
);
