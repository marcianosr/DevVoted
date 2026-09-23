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

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.component";
import { NotFound } from "~/components/NotFound.component";
import { Footer } from "~/components/Footer.component";
import { fetchUser } from "~/modules/account/auth/application/auth.serverfn";
import { NavDisclosure, NavDivider } from "~/ui/kanto-theme/NavDisclosure.ui";

import appCss from "../styles/app.css?url";
import { seo } from "~/shared/utils/seo";

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: "https://aba674879b6205e4794be9321356edac@o4510300365651968.ingest.de.sentry.io/4510300654665808",
		sendDefaultPii: true,
	});
}

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
				title: "DevVoted | Daily Polls with a competitive roguelite twist!",
				description: `DevVoted is a platform for daily polls with a competitive roguelite twist!`,
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
	beforeLoad: async () => ({ user: await fetchUser() }),
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
				<main className="flex flex-1 flex-col bg-zinc-950">
					<Outlet />
					<Footer />
				</main>
			</QueryClientProvider>
		</RootDocument>
	);
}

function Navigation() {
	const { user } = Route.useRouteContext();

	return (
		<>
			<div className="p-2 flex gap-2 text-lg items-center">
				{user && (
					<div className="md:hidden">
						<NavDisclosure
							align="left"
							summary={
								<span
									className="inline-flex h-9 w-9 items-center justify-center border border-gray-700 text-gray-200"
									aria-label="Open menu"
								>
									☰
								</span>
							}
						>
							<>
								<Link
									to="/run"
									className="block w-full text-left px-4 py-2 text-base hover:bg-gray-800"
								>
									Daily Run
								</Link>

								<Link
									to="/dex"
									className="block w-full text-left px-4 py-2 text-base hover:bg-gray-800"
								>
									Dex
								</Link>

								<Link
									to="/polls/new"
									className="block w-full text-left px-4 py-2 text-base hover:bg-gray-800"
								>
									Suggest your own poll
								</Link>
								<Link
									to="/profile/$userId"
									params={{ userId: user.id }}
									hash="border-shop"
									className="block w-full px-4 py-2 text-left text-base hover:bg-gray-800"
								>
									Border Shop
									<span className="ml-1 text-xs text-green-400">(new)</span>
								</Link>
							</>
						</NavDisclosure>
					</div>
				)}

				<div className="hidden md:flex gap-2 items-center min-w-0">
					<Link
						to="/run"
						activeProps={{ className: "underline" }}
						activeOptions={{ exact: true }}
					>
						Daily Run
					</Link>

					{user && (
						<>
							<span className="text-white">·</span>
							<Link
								to="/dex"
								activeProps={{ className: "underline" }}
								activeOptions={{ exact: true }}
							>
								Dex
							</Link>
							<span className="text-white">·</span>
							<Link
								to="/polls/new"
								activeProps={{ className: "underline" }}
								activeOptions={{ exact: true }}
							>
								Suggest your own poll
							</Link>
							<span className="text-white">·</span>
							{/* TEMP: surface the new border shop until it gets a real home */}
							<Link
								to="/profile/$userId"
								params={{ userId: user.id }}
								hash="border-shop"
								activeProps={{ className: "underline" }}
							>
								Border Shop
								<span className="ml-1 text-green-400 text-sm">(new)</span>
							</Link>
						</>
					)}
				</div>

				{user ? (
					<>
						<div className="ml-auto flex items-center">
							<NavDisclosure
								summary={
									<span className="flex items-center gap-2 text-base">
										{user.photoUrl && (
											<img
												src={user.photoUrl}
												alt={user.displayName}
												className="h-8 w-8 rounded-full"
											/>
										)}
										<span>{user.displayName || user.email}</span>
									</span>
								}
							>
								<Link
									to="/profile/$userId"
									params={{ userId: user.id }}
									className="block w-full px-4 py-2 text-left text-base hover:bg-gray-800"
								>
									Profile
								</Link>
								<Link
									to="/polls"
									className="block w-full px-4 py-2 text-left text-base hover:bg-gray-800"
								>
									My Polls
								</Link>
								<NavDivider />
								<Link
									to="/logout"
									className="block w-full px-4 py-2 text-left text-base hover:bg-gray-800"
								>
									Logout
								</Link>
							</NavDisclosure>
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
			<body className="bg-black text-white min-h-dvh flex flex-col">
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
