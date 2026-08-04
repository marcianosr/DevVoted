import {
	useState,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
} from "react";
import { clsx } from "clsx";

export type Fold = { expanded: boolean; toggle: () => void };

const hitsRowControl = (event: { target: EventTarget }): boolean =>
	event.target instanceof HTMLElement &&
	event.target.closest("button") !== null;

type FoldableRowProps = {
	summary: (fold: Fold) => ReactNode;
	detail: ReactNode;
	onActivate?: () => void;
	foldable?: boolean;
	className?: string;
};

export const FoldableRow = ({
	summary,
	detail,
	onActivate,
	foldable = true,
	className,
}: FoldableRowProps) => {
	const [expanded, setExpanded] = useState(true);
	const toggle = () => setExpanded((open) => !open);

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (hitsRowControl(event)) return;
		if (onActivate) {
			onActivate();
			return;
		}
		if (!foldable) return;
		toggle();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onActivate?.();
		}
	};

	return (
		<div
			className={clsx(
				"col-span-3 grid grid-cols-subgrid items-start gap-x-4 py-2",
				"cursor-pointer transition-colors hover:bg-zinc-900/60",
				className
			)}
			onClick={handleClick}
			role={onActivate ? "button" : undefined}
			tabIndex={onActivate ? 0 : undefined}
			onKeyDown={onActivate ? handleKeyDown : undefined}
		>
			{summary({ expanded, toggle })}
			{expanded ? detail : null}
		</div>
	);
};
