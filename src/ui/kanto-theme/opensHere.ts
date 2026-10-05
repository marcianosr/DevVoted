import type { MouseEvent } from "react";

export const opensHere = (event: MouseEvent<HTMLAnchorElement>): boolean =>
	event.button === 0 &&
	!event.metaKey &&
	!event.ctrlKey &&
	!event.shiftKey &&
	!event.altKey;
