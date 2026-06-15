import { ReactNode } from "react";

type ContentSectionProps = {
	categoryCode?: string;
	children: ReactNode;
};

export const ContentSection = ({
	categoryCode,
	children,
}: ContentSectionProps) => (
	<section
		data-category-theme={categoryCode}
		className="w-full sm:max-w-5xl mx-auto p-4"
	>
		{children}
	</section>
);
