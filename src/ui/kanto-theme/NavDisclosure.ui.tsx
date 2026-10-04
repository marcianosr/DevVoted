import { useEffect, useRef, type ReactNode } from "react";

const ROOT = "relative";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1 text-theme-faint marker:content-[''] hover:bg-theme-raised";
const PANEL =
	"absolute z-30 mt-1 flex min-w-44 flex-col rounded-md border border-theme-faint bg-theme-faint py-1 shadow-lg";

const ALIGN = { left: "left-0", right: "right-0" } as const;

export type NavAlign = keyof typeof ALIGN;

export type NavDisclosureProps = {
	summary: ReactNode;
	children: ReactNode;
	align?: NavAlign;
};

const isOutside = (disclosure: HTMLElement, target: EventTarget | null) =>
	!(target instanceof Node && disclosure.contains(target));

export const NavDisclosure = ({
	summary,
	children,
	align = "right",
}: NavDisclosureProps) => {
	const disclosure = useRef<HTMLDetailsElement>(null);

	const close = () => {
		if (disclosure.current !== null) disclosure.current.open = false;
	};

	useEffect(() => {
		const closeOnOutsidePress = (event: PointerEvent) => {
			const details = disclosure.current;
			if (details === null || !details.open) return;
			if (isOutside(details, event.target)) details.open = false;
		};

		document.addEventListener("pointerdown", closeOnOutsidePress);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsidePress);
	}, []);

	return (
		<details ref={disclosure} className={ROOT}>
			<summary className={SUMMARY}>{summary}</summary>
			<div className={`${PANEL} ${ALIGN[align]}`} onClick={close}>
				{children}
			</div>
		</details>
	);
};

export const NavDivider = () => <hr className="my-1 border-theme-faint" />;
