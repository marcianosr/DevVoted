import { useEffect } from "react";

export type PollKey = { readonly letter: string; readonly id: string };

export type PollKeyboard = {
	readonly keys: readonly PollKey[];
	readonly onPick?: (id: string) => void;
	/** What Enter does: submit while answering, continue once answered. */
	readonly onEnter?: () => void;
};

const ENTER = "Enter";
const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isTyping = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement &&
	(EDITABLE_TAGS.has(target.tagName) || target.isContentEditable);

const hasModifier = (event: KeyboardEvent): boolean =>
	event.metaKey || event.ctrlKey || event.altKey;

/**
 * Letter keys pick and Enter presses the footer's action. Enter is claimed
 * only while there is an action to press: a mouse click leaves focus on the
 * answer row it landed on, and left to the browser Enter would toggle that
 * row again instead of submitting.
 */
export const usePollKeyboard = ({ keys, onPick, onEnter }: PollKeyboard) => {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isTyping(event.target) || hasModifier(event) || event.repeat) return;

			if (event.key === ENTER) {
				if (onEnter === undefined) return;
				event.preventDefault();
				return onEnter();
			}

			const pressed = event.key.toUpperCase();
			const key = keys.find((candidate) => candidate.letter === pressed);
			if (key === undefined || onPick === undefined) return;
			event.preventDefault();
			onPick(key.id);
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [keys, onPick, onEnter]);
};
