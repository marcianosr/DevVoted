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
	/** Spoken name for an activatable row — required for it to be operable. */
	activateLabel?: string;
	/**
	 * Where the row sits in its parent grid. Defaults to the whole three-column
	 * table; a numbered list passes the offset span so the number stays a sibling
	 * cell outside the row's own box. The subgrid renumbers from 1 either way, so
	 * the cells inside never change.
	 */
	placement?: string;
};

export const FoldableRow = ({
	summary,
	detail,
	onActivate,
	foldable = true,
	className,
	activateLabel,
	placement = "col-span-3",
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
				placement,
				"grid grid-cols-subgrid items-start gap-x-4 py-2",
				"cursor-pointer transition-colors hover:bg-zinc-900/60",
				className
			)}
			onClick={handleClick}
			role={onActivate ? "button" : undefined}
			aria-label={onActivate ? activateLabel : undefined}
			tabIndex={onActivate ? 0 : undefined}
			onKeyDown={onActivate ? handleKeyDown : undefined}
		>
			{summary({ expanded, toggle })}
			{expanded ? detail : null}
		</div>
	);
};
