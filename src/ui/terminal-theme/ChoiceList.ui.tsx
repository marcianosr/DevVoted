import { useEffect } from "react";

import { clsx } from "clsx";

import { Choice, type ChoiceProps } from "./Choice.ui";
import { Text } from "./Text.ui";

const LIST = "flex flex-col gap-1.5";
const TIP = "pt-1";
const KEYS_TIP = "Tip: you can press keyboard letters to answer";

export type ChoiceListItem = Omit<ChoiceProps, "onPick">;

export type ChoiceListProps = {
	choices: readonly ChoiceListItem[];
	onPick?: (letter: string) => void;
	className?: string;
};

const isPickable = (choice: ChoiceListItem) => choice.state !== "crossedOut";

const isTyping = (target: EventTarget | null) =>
	target instanceof HTMLInputElement ||
	target instanceof HTMLTextAreaElement ||
	(target instanceof HTMLElement && target.isContentEditable);

export const ChoiceList = ({ choices, onPick, className }: ChoiceListProps) => {
	// The pickable letters as one string, so the effect re-subscribes when they
	// change and each index still reads back the letter its row was given.
	const keys = choices
		.filter(isPickable)
		.map((choice) => choice.letter)
		.join("");

	useEffect(() => {
		if (onPick === undefined) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.length !== 1 || event.repeat) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (isTyping(event.target)) return;

			const index = keys.toUpperCase().indexOf(event.key.toUpperCase());
			const letter = keys[index];
			if (letter === undefined) return;

			event.preventDefault();
			onPick(letter);
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [keys, onPick]);

	return (
		<div className={clsx(LIST, className)}>
			{choices.map((choice) => (
				<Choice
					key={choice.letter}
					{...choice}
					onPick={
						onPick === undefined || !isPickable(choice)
							? undefined
							: () => onPick(choice.letter)
					}
				/>
			))}
			{onPick === undefined ? null : (
				<Text tone="faint" size="caption" weight="thin" className={TIP}>
					{KEYS_TIP}
				</Text>
			)}
		</div>
	);
};
