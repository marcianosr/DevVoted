import type { ReactNode } from "react";

import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "../theme/categoryTheme";

type TitleProps = {
	children: ReactNode;
	category?: CategoryCode;
	as?: "h1" | "h2" | "h3";
	className?: string;
};

export const Title = ({
	children,
	category,
	as = "h1",
	className = "",
}: TitleProps) => {
	const Tag = as;
	const themed = category
		? {
				...categoryTheme(category),
				className: `text-3xl font-bold text-theme ${className}`,
			}
		: { className: `text-3xl font-bold text-white ${className}` };
	return <Tag {...themed}>{children}</Tag>;
};
