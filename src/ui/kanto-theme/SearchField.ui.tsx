import { Icon } from "./Icon.ui";

const FIELD =
	"flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-theme-faint ring-1 ring-inset ring-theme-faint transition-colors focus-within:ring-theme-soft";
const INPUT =
	"min-w-0 flex-1 bg-transparent text-xs font-bold leading-none outline-none placeholder:font-normal placeholder:text-theme-muted";
const GLYPH = "size-3.5 text-theme-muted";
const HIDDEN = "sr-only";

export type SearchFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

export const SearchField = ({
	label,
	value,
	onChange,
	placeholder,
}: SearchFieldProps) => (
	<label className={FIELD}>
		<span className={HIDDEN}>{label}</span>
		<Icon name="search" className={GLYPH} />
		<input
			type="search"
			value={value}
			placeholder={placeholder}
			onChange={(event) => onChange(event.target.value)}
			className={INPUT}
		/>
	</label>
);
