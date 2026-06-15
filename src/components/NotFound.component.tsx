import { Link } from "@tanstack/react-router";

import { NotFoundUI } from "~/ui/NotFoundUI.component";

export function NotFound({ children }: { children?: React.ReactNode }) {
	return (
		<NotFoundUI
			onGoBack={() => window.history.back()}
			homeLink={
				<Link
					to="/"
					className="bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm"
				>
					Start Over
				</Link>
			}
		>
			{children}
		</NotFoundUI>
	);
}
