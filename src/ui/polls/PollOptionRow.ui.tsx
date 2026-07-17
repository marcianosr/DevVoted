import { cva } from "class-variance-authority";

import { ConfigCard } from "~/ui/economy/ConfigCard.ui";
import { Popover } from "~/ui/Popover.component";
import type { Rarity } from "~/ui/rarityColors";

import { MarkdownText } from "./PollMarkdown.ui";

const optionWrapper = cva("flex items-start gap-2", {
	variants: {
		disabled: {
			true: "opacity-50",
			false: "",
		},
	},
});

const optionInput = cva(
	"mt-1 w-5 h-5 bg-zinc-900 border-2 border-theme accent-theme",
	{
		variants: {
			disabled: {
				true: "cursor-not-allowed",
				false: "cursor-pointer",
			},
		},
	}
);

const optionLabel = cva("markdown flex-1", {
	variants: {
		disabled: {
			true: "cursor-not-allowed text-gray-500",
			false: "cursor-pointer text-white",
		},
	},
});

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
			<div className={optionWrapper({ disabled })}>
				<input
					type={inputType}
					name="selectedOptions"
					id={inputId}
					value={id}
					checked={checked}
					onChange={onToggle}
					disabled={disabled}
					className={optionInput({ disabled })}
				/>
				<label htmlFor={inputId} className={optionLabel({ disabled })}>
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
