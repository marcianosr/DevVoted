import type { ReactNode } from "react";
import type { CategoryCode } from "~/domains/shared/categories";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type StatBadgeProps = {
	label: string;
	value: ReactNode;
	category?: CategoryCode;
	valueTone?: "theme" | "gradient" | "muted";
	/** The value before a pending change — renders muted, with an arrow to the
	 * new value in celadon (the configure preview's old → new strip). */
	from?: ReactNode;
};

const VALUE_COLOR: Record<NonNullable<StatBadgeProps["valueTone"]>, string> = {
	theme: "text-theme",
	gradient: "text-gradient-green",
	muted: "text-zinc-500",
};

export const StatBadge = ({
	label,
	value,
	category,
	valueTone = "theme",
	from,
}: StatBadgeProps) => {
	const themed = category ? categoryTheme(category) : {};
	return (
		<div className="flex flex-col" {...themed}>
			<Subtitle as="p">{label}</Subtitle>
			<span className="text-xl font-extrabold">
				{from != null ? (
					<>
						<span className="text-zinc-500">{from}</span>
						<span className="text-celadon"> → {value}</span>
					</>
				) : (
					<span className={VALUE_COLOR[valueTone]}>{value}</span>
				)}
			</span>
		</div>
	);
};
