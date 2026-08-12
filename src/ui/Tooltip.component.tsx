import { clsx } from "clsx";
import {
	useEffect,
	useRef,
	useState,
	type PointerEvent,
	type ReactNode,
} from "react";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type TooltipProps = {
	content: ReactNode;
	children: ReactNode;
	surfaceClassName?: string;
	className?: string;
	compact?: boolean;
	interactive?: boolean;
	nested?: boolean;
	pinned?: boolean;
	onDismiss?: () => void;
};

export const Tooltip = ({
	content,
	children,
	surfaceClassName = "border-zinc-700 bg-zinc-900",
	className = "",
	compact = false,
	interactive = false,
	nested = false,
	pinned,
	onDismiss,
}: TooltipProps) => {
	const [internalPinned, setInternalPinned] = useState(false);
	const controlled = pinned !== undefined;
	const isPinned = pinned ?? internalPinned;
	const triggerRef = useRef<HTMLSpanElement>(null);
	const panelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!isPinned) return;
		const dismiss = () => {
			if (controlled) {
				onDismiss?.();
				return;
			}
			setInternalPinned(false);
		};
		const closeOnOutsideTap = (event: globalThis.PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && triggerRef.current?.contains(target))
				return;
			if (target instanceof Node && panelRef.current?.contains(target)) return;
			dismiss();
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") dismiss();
		};
		document.addEventListener("pointerdown", closeOnOutsideTap);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideTap);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isPinned, controlled, onDismiss]);

	const togglePin = (event: PointerEvent<HTMLSpanElement>) => {
		if (controlled) return;
		if (event.pointerType === "mouse") return;
		setInternalPinned((open) => !open);
	};

	const reveal = nested
		? "hidden group-hover/nested:block group-focus-within/nested:block"
		: "hidden group-hover:block group-focus-within:block";

	return (
		<Paragraph
			as="span"
			className={clsx(
				nested ? "group/nested" : "group",
				"relative inline-flex",
				className
			)}
		>
			<span ref={triggerRef} className="contents" onPointerUp={togglePin}>
				{children}
			</span>
			<span
				ref={panelRef}
				role="tooltip"
				className={clsx(
					"absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-lg border text-left shadow-lg",
					interactive
						? "pointer-events-auto before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
						: "pointer-events-none",
					isPinned ? "block" : reveal,
					compact ? "w-max px-2 py-1" : "w-64 p-3",
					surfaceClassName
				)}
			>
				{content}
			</span>
		</Paragraph>
	);
};
