import { clsx } from "clsx";

export type PickBoxProps = {
	checked: boolean;
	label: string;
	onToggle?: () => void;
};

export const PickBox = ({ checked, label, onToggle }: PickBoxProps) => (
	<button
		type="button"
		role="checkbox"
		aria-checked={checked}
		aria-label={label}
		onClick={onToggle}
		className={clsx(
			"size-4 shrink-0 rounded border transition-colors",
			checked
				? "border-vermillion bg-vermillion/80"
				: "border-zinc-500 hover:border-zinc-300"
		)}
	/>
);
