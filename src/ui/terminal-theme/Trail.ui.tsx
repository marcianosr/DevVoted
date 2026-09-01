import { clsx } from "clsx";

import { Text } from "./Text.ui";

const STEP_DOT = "size-2 rounded-full";

const dotClass = (step: number, current: number) => {
	if (step < current) return "bg-celadon";
	if (step === current) return "bg-zinc-100";
	return "bg-zinc-700";
};

export type TrailProps = {
	count: number;
	current: number;
	label?: string;
};

export const Trail = ({ count, current, label }: TrailProps) => (
	<div className="flex items-center justify-between gap-4">
		<span className="flex items-center gap-2.5">
			{Array.from({ length: count }, (_, index) => index + 1).map((step) => (
				<span key={step} className="flex items-center gap-2.5">
					{step > 1 ? (
						<span aria-hidden className="text-xs text-zinc-600">
							›
						</span>
					) : null}
					<span className="flex items-center gap-1.5">
						<span
							aria-hidden
							className={clsx(STEP_DOT, dotClass(step, current))}
						/>
						<Text size="caption" tone={step === current ? "default" : "faint"}>
							{step}
						</Text>
					</span>
				</span>
			))}
		</span>
		{label === undefined ? null : <Text tone="muted">{label}</Text>}
	</div>
);
