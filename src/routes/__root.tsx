/// <reference types="vite/client" />
import * as React from "react";

import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";

import { useState } from "react";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.component";
import { NotFound } from "~/components/NotFound.component";
import PageLayout from "~/components/PageLayout.component";
import { useFinishRun } from "~/domains/runs/hooks/useFinishRun";
import { deriveNavRunState } from "~/domains/runs/utils/deriveNavRunState";
import { ensureUserExists } from "~/domains/users/services/userSync.service";
import { ConfirmDialog } from "~/ui/ConfirmDialog.component";
import {
	Dropdown,
	DropdownDivider,
	DropdownItem,
} from "~/ui/Dropdown.component";

import { getActiveRun } from "../domains/runs/api/runs";
import appCss from "../styles/app.css?url";
import { seo } from "../utils/seo";
import { getSupabaseServerClient } from "../utils/supabase";

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: "https://aba674879b6205e4794be9321356edac@o4510300365651968.ingest.de.sentry.io/4510300654665808",
		sendDefaultPii: true,
	});
}

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.getUser();

		if (error) {
			Sentry.captureException(error, {
				level: "warning",
				extra: {
					operation: "fetchUser.getUser",
				},
			});
			return null;
		}

		if (!data.user?.email) {
			return null;
		}

		const user = await ensureUserExists({
			id: data.user.id,
			email: data.user.email,
			displayName:
				data.user.user_metadata?.display_name ||
				data.user.user_metadata?.full_name,
			photoUrl: data.user.user_metadata?.avatar_url,
		});

		return user;
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: {
				operation: "fetchUser.ensureUserExists",
			},
		});
		return null;
	}
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
		const [activeRun, user] = await Promise.all([getActiveRun(), fetchUser()]);

		return {
			user,
			activeRun,
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
				<PageLayout>
					<Outlet />
				</PageLayout>
			</QueryClientProvider>
		</RootDocument>
	);
}

function Navigation() {
	const { user, activeRun } = Route.useRouteContext();
	const { hasActiveRun, hasPendingPipelineUpgrade, canEndRun } =
		deriveNavRunState(activeRun);

	const [isEndRunDialogOpen, setIsEndRunDialogOpen] = useState(false);
	const finishRun = useFinishRun({
		userId: user?.id,
		redirectTo: "/game-over",
	});

	const handleEndRunConfirm = () => {
		finishRun.mutate(undefined, {
			onSuccess: () => setIsEndRunDialogOpen(false),
		});
	};

	return (
		<>
			<div className="p-2 flex gap-2 text-lg items-center whitespace-nowrap">
				<div className="flex gap-2 items-center min-w-0 overflow-auto">
					<Link
						to="/daily-poll"
						activeProps={{ className: "underline" }}
						activeOptions={{ exact: true }}
					>
						Daily Poll
					</Link>

					{user && (
						<>
							<span className="text-white">·</span>
							<Link
								to="/pipelines"
								activeProps={{ className: "underline" }}
								activeOptions={{ exact: true }}
							>
								Pipelines
								{hasPendingPipelineUpgrade && (
									<span className="ml-1 text-green-400 text-sm">(new)</span>
								)}
							</Link>
							<span className="text-white">·</span>
							<Link
								to="/polls/new"
								activeProps={{ className: "underline" }}
								activeOptions={{ exact: true }}
							>
								Suggest your own poll
							</Link>
						</>
					)}
				</div>

				{user ? (
					<>
						<div className="ml-auto flex items-center">
							<Dropdown
								trigger={({ isOpen }) => (
									<span className="flex items-center gap-2 text-base">
										{user.photoUrl && (
											<img
												src={user.photoUrl}
												alt={user.displayName}
												className="w-8 h-8 rounded-full"
											/>
										)}
										<span>{user.displayName || user.email}</span>
										<span
											className={`text-xs transition-transform ${
												isOpen ? "rotate-180" : ""
											}`}
											aria-hidden="true"
										>
											▾
										</span>
									</span>
								)}
							>
								{({ close }) => (
									<>
										<Link
											to="/profile/$userId"
											params={{ userId: user.id }}
											className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
											onClick={close}
										>
											Profile
										</Link>
										<Link
											to="/polls"
											className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
											onClick={close}
										>
											My Polls
										</Link>
										{hasActiveRun && (
											<>
												<DropdownDivider />
												<DropdownItem
													variant="danger"
													disabled={!canEndRun}
													onClick={() => {
														close();
														setIsEndRunDialogOpen(true);
													}}
												>
													{canEndRun
														? "End Run"
														: "End Run (reach gate 5 first)"}
												</DropdownItem>
											</>
										)}
										<DropdownDivider />
										<Link
											to="/logout"
											className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
											onClick={close}
										>
											Logout
										</Link>
									</>
								)}
							</Dropdown>
						</div>

						<ConfirmDialog
							isOpen={isEndRunDialogOpen}
							onConfirm={handleEndRunConfirm}
							onCancel={() => setIsEndRunDialogOpen(false)}
							title="End current run"
							message="Your remaining storage will be archived in full. Ready to wrap up this run?"
							confirmText="End run"
						/>
						{finishRun.error && (
							<span className="ml-2 text-sm text-red-400">
								{finishRun.error.message}
							</span>
						)}
					</>
				) : (
					<Link to="/login" className="ml-auto">
						Login
					</Link>
				)}
			</div>
			<hr />
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
