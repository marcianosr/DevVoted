import { useRef, type ReactNode } from "react";

const ROOT = "relative";
const SUMMARY =
	"flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1 text-theme-faint marker:content-[''] hover:bg-theme-raised";
const PANEL =
	"absolute z-20 mt-1 flex min-w-44 flex-col rounded-md border border-theme-faint bg-surface py-1 shadow-lg";

const ALIGN = { left: "left-0", right: "right-0" } as const;

export type NavAlign = keyof typeof ALIGN;

export type NavDisclosureProps = {
	/** What the closed control shows — a burger glyph, or the signed-in player. */
	summary: ReactNode;
	children: ReactNode;
	align?: NavAlign;
};

/**
 * A native disclosure rather than a scripted dropdown: `<details>` already
 * carries the keyboard and screen-reader behaviour, so the only script left is
 * closing the panel once a link inside it has been followed.
 */
export const NavDisclosure = ({
	summary,
	children,
	align = "right",
}: NavDisclosureProps) => {
	const disclosure = useRef<HTMLDetailsElement>(null);

	return (
		<details ref={disclosure} className={ROOT}>
			<summary className={SUMMARY}>{summary}</summary>
			<div
				className={`${PANEL} ${ALIGN[align]}`}
				onClick={() => {
					if (disclosure.current !== null) disclosure.current.open = false;
				}}
			>
				{children}
			</div>
		</details>
	);
};

export const NavDivider = () => <hr className="my-1 border-theme-faint" />;
