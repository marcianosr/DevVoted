/// <reference types="vite/client" />
import * as React from "react";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.component";
import { NotFound } from "~/components/NotFound.component";
import { Footer } from "~/components/Footer.component";
import { Nav } from "~/components/Nav.component";
import { fetchUser } from "~/modules/account/auth/application/auth.serverfn";
import { ViewerContext } from "~/modules/account/auth/application/useViewer.hook";
import { AdvertisementBanner } from "~/modules/account/profile/presentation/Advertisement.component";
import { recordScreen } from "~/modules/ops/pulse/application/visit.serverfn";
import { PlayerHover } from "~/modules/run/community/presentation/PlayerHover.component";
import {
	PageThemeContext,
	pageThemeAttributes,
	type PageTheme,
} from "~/ui/kanto-theme/usePageTheme.hook";
import {
	NavRunContext,
	type NavRunReading,
} from "~/ui/kanto-theme/useNavRun.hook";
import appCss from "../styles/app.css?url";
import { seo } from "~/shared/utils/seo";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
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
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
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
			{ rel: "manifest", href: "/site.webmanifest" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async ({ matches, preload }) => {
		const user = await fetchUser();
		if (!preload) recordScreen(matches);
		return { user };
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
	const { queryClient, user } = Route.useRouteContext();
	const [navRun, setNavRun] = React.useState<NavRunReading>();

	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<ViewerContext.Provider value={user}>
					<PlayerHover>
						<NavRunContext.Provider value={setNavRun}>
							<Nav user={user} published={navRun} />
							<main
								className={
									user === null
										? "flex flex-1 flex-col bg-zinc-950"
										: "flex flex-1 flex-col bg-zinc-950 pb-[var(--tab-bar)] [--tab-bar:3.75rem] md:[--tab-bar:0px]"
								}
							>
								<Outlet />
								<Footer />
								<AdvertisementBanner />
							</main>
						</NavRunContext.Provider>
					</PlayerHover>
				</ViewerContext.Provider>
			</QueryClientProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const [page, setPage] = React.useState<PageTheme>({});

	return (
		<PageThemeContext.Provider value={setPage}>
			<html className="dark">
				<head>
					<HeadContent />
				</head>
				<body
					className="bg-black text-white min-h-dvh flex flex-col"
					{...pageThemeAttributes(page)}
				>
					{children}
					<TanStackRouterDevtools position="bottom-right" />
					<Scripts />
				</body>
			</html>
		</PageThemeContext.Provider>
	);
}
