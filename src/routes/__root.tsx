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

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import PageLayout from "~/components/PageLayout";
import { ensureUserExists } from "~/domains/users/services/userSync.service";

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
	const { user } = Route.useRouteContext();

	return (
		<>
			<div className="p-2 flex gap-2 text-lg items-center whitespace-nowrap overflow-auto">
				<Link
					to="/daily-poll"
					activeProps={{
						className: "underline",
					}}
					activeOptions={{ exact: true }}
				>
					Daily Poll
				</Link>

				{user ? (
					<>
						<span className="text-white">·</span>
						<Link
							to="/polls/new"
							activeProps={{
								className: "underline",
							}}
							activeOptions={{ exact: true }}
						>
							Suggest your own poll
						</Link>
						<div className="ml-auto flex gap-2 items-center">
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
								<span className="ml-2">{user.displayName || user.email}</span>
							</Link>
							<Link to="/logout">Logout</Link>
						</div>
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
