import { ConfigCard } from "~/ui/economy/ConfigCard.ui";
import { Popover } from "~/ui/Popover.component";
import type { Rarity } from "~/ui/rarityColors";

import { MarkdownText } from "./PollMarkdown.ui";

/** The config that removed an option, shown as a card beside it. */
export type RemovedByConfig = {
	name: string;
	rarity: Rarity;
	description: string;
};

type PollOptionRowProps = {
	id: string;
	inputType: "radio" | "checkbox";
	text: string;
	checked: boolean;
	disabled?: boolean;
	removedByConfig?: RemovedByConfig;
	markerEmoji?: string;
	markerTitle?: string;
	onToggle: () => void;
};

/**
 * A single answer as a text line: a themed radio/checkbox control next to the
 * markdown-rendered option, with an optional peer-pick marker and, when a config
 * has removed the option, that config's card explaining why it is disabled.
 */
export const PollOptionRow = ({
	id,
	inputType,
	text,
	checked,
	disabled = false,
	removedByConfig,
	markerEmoji,
	markerTitle,
	onToggle,
}: PollOptionRowProps) => {
	const inputId = `option-${id}`;
	return (
		<li className="text-xl flex flex-wrap gap-2 items-center">
			<div className={`flex items-start gap-2 ${disabled ? "opacity-50" : ""}`}>
				<input
					type={inputType}
					name="selectedOptions"
					id={inputId}
					value={id}
					checked={checked}
					onChange={onToggle}
					disabled={disabled}
					className={`mt-1 w-5 h-5 bg-zinc-900 border-2 border-theme accent-theme ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
				/>
				<label
					htmlFor={inputId}
					className={`markdown flex-1 ${disabled ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-white"}`}
				>
					<MarkdownText>{text}</MarkdownText>
				</label>
			</div>
			{markerEmoji && (
				<span className="text-xl text-theme" title={markerTitle}>
					{markerEmoji}
				</span>
			)}
			{removedByConfig && (
				<Popover
					ariaLabel={`${removedByConfig.name} config details`}
					content={
						<p className="max-w-xs text-sm">{removedByConfig.description}</p>
					}
				>
					<ConfigCard
						name={removedByConfig.name}
						rarity={removedByConfig.rarity}
						size="small"
					/>
				</Popover>
			)}
		</li>
	);
};
