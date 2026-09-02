import { ReactNode } from "react";

type PageLayoutUIProps = {
	footer: ReactNode;
	children: ReactNode;
};

// flex-1 under the body's min-h-dvh, not min-h-screen: the navigation sits above
// this element, so demanding a full viewport here made every page overflow by
// exactly the height of the nav. A page that wants to fit the screen now can.
export const PageLayoutUI = ({ footer, children }: PageLayoutUIProps) => (
	<main className="flex flex-1 flex-col" style={{ backgroundColor: "#2a2627" }}>
		{children}
		{footer}
	</main>
);
