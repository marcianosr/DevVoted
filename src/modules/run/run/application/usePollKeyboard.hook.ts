import { useEffect } from "react";

export type PollKey = { readonly letter: string; readonly id: string };

export type PollKeyboard = {
	readonly keys: readonly PollKey[];
	readonly onPick?: (id: string) => void;
	readonly onEnter?: () => void;
};

const ENTER = "Enter";
const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isTyping = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement &&
	(EDITABLE_TAGS.has(target.tagName) || target.isContentEditable);

const hasModifier = (event: KeyboardEvent): boolean =>
	event.metaKey || event.ctrlKey || event.altKey;

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
