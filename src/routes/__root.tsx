/// <reference types="vite/client" />
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRoute,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { ConfirmDialog } from "../components/ConfirmDialog";
import appCss from "../styles/app.css?url";
import { seo } from "../utils/seo";
import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { finishRunFn } from "../domains/runs/api/runs";
import { useActiveRun } from "~/domains/runs/hooks";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import { SecondaryButton } from "~/ui/SecondaryButton";

import * as Sentry from "@sentry/react";
import { fetchUser } from "~/utils/fetchUser";

Sentry.init({
	dsn: "https://aba674879b6205e4794be9321356edac@o4510300365651968.ingest.de.sentry.io/4510300654665808",
	// Setting this option to true will send default PII data to Sentry.
	// For example, automatic IP address collection on events
	sendDefaultPii: true,
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "DevVoted | Daily Polls with a competitive roguelike twist!",
				description: `DevVoted is a platform for daily polls with a competitive roguelike twist!`,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async () => {
		const user = await fetchUser();

		return {
			user,
		};
	},
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	const queryClient = new QueryClient();

	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<Navigation />
				<Outlet />
			</QueryClientProvider>
		</RootDocument>
	);
}

function Navigation() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);

	const { hasActiveRun } = useActiveRun(user?.id);

	const finishRunMutation = useMutation({
		mutationFn: () => finishRunFn(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
			setIsDialogOpen(false);
			navigate({ to: "/daily-poll" });
		},
	});

	const handleStartNewRunClick = () => {
		if (hasActiveRun) {
			setIsDialogOpen(true);
		} else {
			navigate({ to: "/daily-poll" });
		}
	};

	const handleConfirmFinishRun = () => {
		finishRunMutation.mutate();
	};

	const handleCancelFinishRun = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<div className="p-2 flex gap-2 text-lg">
				<Link
					to="/daily-poll"
					activeProps={{
						className: "underline",
					}}
					activeOptions={{ exact: true }}
				>
					Daily Poll
				</Link>{" "}
				<div className="ml-auto flex gap-2 items-center">
					{user ? (
						<>
							<SecondaryButton
								onClick={handleStartNewRunClick}
								className="px-3 py-1 text-sm"
							>
								Start New Run
							</SecondaryButton>
							<Link
								to="/profile/$userId"
								params={{ userId: user.id }}
								activeProps={{
									className: "underline",
								}}
							>
								{user.photoUrl && (
									<img
										src={user.photoUrl}
										alt={user.displayName}
										className="w-[30px] h-[30px] rounded-full inline-block mr-2"
									/>
								)}
								<span className="ml-2">
									{user.displayName || user.email}
								</span>
							</Link>
							<Link to="/logout">Logout</Link>
						</>
					) : (
						<Link to="/login">Login</Link>
					)}
				</div>
			</div>
			<hr />
			<ConfirmDialog
				isOpen={isDialogOpen}
				onConfirm={handleConfirmFinishRun}
				onCancel={handleCancelFinishRun}
				title="Start New Run"
				message="Are you sure you want to break off your current run?"
			/>
		</>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="bg-black text-white min-h-dvh">
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
