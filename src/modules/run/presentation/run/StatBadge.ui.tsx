import type { ReactNode } from "react";
import type { CategoryCode } from "~/domains/shared/categories";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type StatBadgeProps = {
	label: string;
	value: ReactNode;
	category?: CategoryCode;
	valueTone?: "theme" | "gradient";
};

export const StatBadge = ({
	label,
	value,
	category,
	valueTone = "theme",
}: StatBadgeProps) => {
	const themed = category ? categoryTheme(category) : {};
	const valueColor =
		valueTone === "gradient" ? "text-gradient-green" : "text-theme";
	return (
		<div className="flex flex-col" {...themed}>
			<Subtitle as="p">{label}</Subtitle>
			<span className={`${valueColor} text-xl font-extrabold`}>{value}</span>
		</div>
	);
};
