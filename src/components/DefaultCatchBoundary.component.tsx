import {
	ErrorComponent,
	Link,
	rootRouteId,
	useMatch,
	useRouter,
} from "@tanstack/react-router";

import type { ErrorComponentProps } from "@tanstack/react-router";
import { CatchBoundaryUI } from "~/ui/kanto-theme/CatchBoundary.ui";

const LINK = "underline";

export const DefaultCatchBoundary = ({ error }: ErrorComponentProps) => {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});

	console.error(error);

	const navigationLink = isRoot ? (
		<Link to="/" className={LINK}>
			Home
		</Link>
	) : (
		<Link
			to="/"
			className={LINK}
			onClick={(event) => {
				event.preventDefault();
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
};
