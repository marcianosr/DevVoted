import type { CategoryCode } from "~/domains/shared/categories";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type StatBadgeProps = {
	label: string;
	value: string | number;
	/** Colors the value in this category's Kanto color. Falls back to the ambient theme when unset. */
	category?: CategoryCode;
};

export const StatBadge = ({ label, value, category }: StatBadgeProps) => {
	const themed = category ? categoryTheme(category) : {};
	return (
		<div className="flex flex-col" {...themed}>
			<Subtitle>{label}</Subtitle>
			<span className="text-theme text-xl font-bold">{value}</span>
		</div>
	);
};
