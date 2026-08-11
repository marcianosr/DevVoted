import { clsx } from "clsx";

export const RadioDot = ({ checked }: { checked: boolean }) => (
	<span
		aria-hidden
		className={clsx(
			"flex size-4 shrink-0 items-center justify-center rounded-full border-2",
			checked ? "border-celadon" : "border-zinc-600"
		)}
	>
		{checked ? <span className="size-1.5 rounded-full bg-celadon" /> : null}
	</span>
);
