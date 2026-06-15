import { ReactNode } from "react";

type PageLayoutUIProps = {
	footer: ReactNode;
	children: ReactNode;
};

export const PageLayoutUI = ({ footer, children }: PageLayoutUIProps) => (
	<main className="flex flex-col min-h-screen pb-24">
		{children}
		{footer}
	</main>
);
