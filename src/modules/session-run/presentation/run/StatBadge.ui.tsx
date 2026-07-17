import type { ReactNode } from "react";
import type { CategoryCode } from "~/domains/shared/categories";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type StatBadgeProps = {
	label: string;
	value: ReactNode;
	category?: CategoryCode;
};

export const StatBadge = ({ label, value, category }: StatBadgeProps) => {
	const themed = category ? categoryTheme(category) : {};
	return (
		<div className="flex flex-col" {...themed}>
			<Subtitle>{label}</Subtitle>
			<span className="text-theme text-xl font-extrabold">{value}</span>
		</div>
	);
};
