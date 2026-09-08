import { clsx } from "clsx";

import { Text } from "./Text.ui";

const PILL =
	"inline-flex shrink-0 cursor-pointer items-center rounded-lg border px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const IDLE =
	"border-edge-strong text-zinc-400 hover:border-control-edge hover:text-zinc-100";
const ON = "border-theme bg-theme-soft text-theme";

const GROUP = "flex flex-wrap items-center gap-2";

export type FilterOption = { id: string; label: string; count?: string };

export type FilterProps = {
	options: readonly FilterOption[];
	activeId: string;
	onSelect: (id: string) => void;
	/** Names the group: "seen / mastered / fumbled" says nothing on its own about
	 * what it is narrowing. */
	label: string;
};

// aria-pressed rather than radio semantics: correct radios would owe the reader
// arrow-key navigation, and these are buttons that happen to be exclusive.
export const Filter = ({ options, activeId, onSelect, label }: FilterProps) => (
	<div role="group" aria-label={label} className={GROUP}>
		{options.map(({ id, label: name, count }) => (
			<button
				key={id}
				type="button"
				aria-pressed={id === activeId}
				onClick={() => onSelect(id)}
				className={clsx(PILL, id === activeId ? ON : IDLE)}
			>
				<Text size="meta" tone="inherit">
					{count === undefined ? name : `${name} · ${count}`}
				</Text>
			</button>
		))}
	</div>
);

// Native <select>, so the platform supplies the popup, the keyboard and the
// mobile wheel. appearance-none strips the chrome; the caret is drawn behind it.
const SELECT_SHELL = "relative inline-flex shrink-0 items-center";
const SELECT = `${PILL} appearance-none bg-transparent pr-8`;
const CARET = "pointer-events-none absolute right-3 text-xs text-zinc-500";

export type FilterSelectProps = {
	options: readonly { id: string; label: string }[];
	value: string;
	onChange: (value: string) => void;
	label: string;
};

export const FilterSelect = ({
	options,
	value,
	onChange,
	label,
}: FilterSelectProps) => (
	<span className={SELECT_SHELL}>
		<select
			aria-label={label}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className={clsx(SELECT, IDLE, "text-xs")}
		>
			{options.map(({ id, label: name }) => (
				<option key={id} value={id}>
					{name}
				</option>
			))}
		</select>
		<span aria-hidden className={CARET}>
			▾
		</span>
	</span>
);
