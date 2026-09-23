import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { NotFoundUI } from "~/ui/kanto-theme/NotFound.ui";

export const NotFound = ({ children }: { children?: ReactNode }) => (
	<NotFoundUI
		onGoBack={() => window.history.back()}
		homeLink={
			<Link to="/" className="underline">
				Start Over
			</Link>
		}
	>
		{children}
	</NotFoundUI>
);
