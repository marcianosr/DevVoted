import { Text } from "./Text.ui";

const clamped = (percent: number) => Math.min(100, Math.max(0, percent));

export type SplitBarProps = {
	kept: {
		label: string;
		percent: number;
	};
	lost: {
		label: string;
	};
};

export const SplitBar = ({ kept, lost }: SplitBarProps) => (
	<div className="flex h-9 w-full overflow-hidden rounded-lg border border-edge">
		<span
			style={{ width: `${clamped(kept.percent)}%` }}
			className="flex shrink-0 items-center bg-viridian/25 px-3"
		>
			<Text className="whitespace-nowrap">{kept.label}</Text>
		</span>
		<span className="flex min-w-0 flex-1 items-center bg-cinnabar/10 px-3">
			<Text tone="faint" className="truncate">
				{lost.label}
			</Text>
		</span>
	</div>
);
