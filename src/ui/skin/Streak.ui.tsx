import { Subtitle } from "./Subtitle.ui";

const STREAK = "inline-flex items-center gap-2";
const BARS = "flex items-end gap-0.5";
const BAR = "h-3 w-1 rounded-sm";
const LIT = "bg-theme";
const DIM = "bg-zinc-700";

export type StreakProps = {
	multiplier: number;
	lit: number;
	total: number;
};

export const Streak = ({ multiplier, lit, total }: StreakProps) => (
	<span className={STREAK}>
		<Subtitle>streak</Subtitle>
		<Subtitle tone="theme">×{multiplier}</Subtitle>
		<span
			className={BARS}
			role="img"
			aria-label={`${lit} of ${total} toward the next step`}
		>
			{Array.from({ length: total }, (_, index) => (
				<span key={index} className={`${BAR} ${index < lit ? LIT : DIM}`} />
			))}
		</span>
	</span>
);
