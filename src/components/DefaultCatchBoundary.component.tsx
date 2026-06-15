import {
	ErrorComponent,
	Link,
	rootRouteId,
	useMatch,
	useRouter,
} from "@tanstack/react-router";

import type { ErrorComponentProps } from "@tanstack/react-router";
import { CatchBoundaryUI } from "~/ui/CatchBoundaryUI.component";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});

	console.error(error);

	const navigationLink = isRoot ? (
		<Link
			to="/"
			className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
		>
			Home
		</Link>
	) : (
		<Link
			to="/"
			className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
			onClick={(e) => {
				e.preventDefault();
				window.history.back();
			}}
		>
			Go Back
		</Link>
	);

	return (
		<CatchBoundaryUI
			errorDisplay={<ErrorComponent error={error} />}
			onRetry={() => router.invalidate()}
			navigationLink={navigationLink}
		/>
	);
}
