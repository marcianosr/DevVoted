import type { ReactNode } from "react";
import { clsx } from "clsx";

import type { StarterStack } from "~/modules/run/configs/stack.model";
import { Badge } from "~/ui/Badge.component";
import { RadioDot } from "~/ui/RadioDot.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "./ConfigChip.ui";

type StackPickerProps = {
	stacks: readonly StarterStack[];
	selectedStackId?: string;
	onPick: (stackId: string) => void;
	onCustomBuild?: () => void;
	selectedDetail?: ReactNode;
};

const StackHeader = ({
	stack,
	selected,
}: {
	stack: StarterStack;
	selected: boolean;
}) => (
	<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
		<RadioDot checked={selected} />
		<Paragraph
			as="span"
			size="sm"
			tone={selected ? "celadon" : "default"}
			className="font-bold underline underline-offset-4"
		>
			{stack.name}
		</Paragraph>
		{stack.recommended ? (
			<Badge tone="positive" size="pill">
				Recommended
			</Badge>
		) : null}
		<Paragraph as="span" tone="muted">
			{stack.blurb}
		</Paragraph>
	</span>
);

export const StackPicker = ({
	stacks,
	selectedStackId,
	onPick,
	onCustomBuild,
	selectedDetail,
}: StackPickerProps) => (
	<div className="flex flex-col gap-3">
		<div role="radiogroup" aria-label="Starter stacks" className="contents">
			{stacks.map((stack) => {
				const selected = stack.id === selectedStackId;
				const expanded = selected && Boolean(selectedDetail);

				return (
					<div
						key={stack.id}
						className={clsx(
							"rounded-md border p-4 transition",
							selected
								? "border-celadon bg-celadon/5"
								: "border-zinc-700 hover:border-zinc-500 hover:bg-white/5"
						)}
					>
						<button
							type="button"
							role="radio"
							aria-checked={selected}
							onClick={() => onPick(stack.id)}
							className="flex w-full cursor-pointer flex-col gap-2 text-left"
						>
							<StackHeader stack={stack} selected={selected} />
							{expanded ? null : (
								<span className="flex flex-wrap gap-2 pl-6">
									{stack.configs.map((config) => (
										<ConfigChip key={config.id} config={config} noTooltip />
									))}
								</span>
							)}
						</button>
						{expanded ? (
							<div className="pl-6 pt-2">{selectedDetail}</div>
						) : null}
					</div>
				);
			})}
		</div>
		{onCustomBuild ? (
			<button
				type="button"
				onClick={onCustomBuild}
				className="cursor-pointer rounded-md border border-dashed border-zinc-700 p-4 text-left transition hover:border-zinc-500 hover:bg-white/5"
			>
				<Paragraph
					as="span"
					size="sm"
					tone="muted"
					className="underline underline-offset-4"
				>
					Customize all 3 slots →
				</Paragraph>
			</button>
		) : null}
	</div>
);
