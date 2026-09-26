import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
	dispatchRunAction,
	getTodaysRun,
} from "~/modules/run/run/application/run.serverfn";
import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { RunCommunity } from "~/modules/run/community/presentation/RunCommunity.component";
import { TEST_DATES } from "~/test/kanto";
import { createMockRunView } from "~/test/runView.factory";

import { RunPoll } from "~/modules/run/run/presentation/RunPoll.component";
import { RunNew } from "~/modules/run/build/presentation/RunNew.component";
import { RunLayout } from "~/modules/run/run/presentation/RunLayout.component";
import { RunOver } from "~/modules/run/run/presentation/RunOver.component";
import { RunPrep } from "~/modules/run/run/presentation/RunPrep.component";
import { RunGate } from "~/modules/run/gate/presentation/RunGate.component";
import { RunShop } from "~/modules/run/shop/presentation/RunShop.component";
import { RunStart } from "~/modules/run/run/presentation/RunStart.component";

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
}));

vi.mock("~/modules/run/community/application/community.serverfn", () => ({
	getRunCommunity: vi.fn(),
}));

beforeAll(() => {
	HTMLDialogElement.prototype.showModal = vi.fn(function (
		this: HTMLDialogElement
	) {
		this.setAttribute("open", "");
	});
	HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
		this.removeAttribute("open");
	});
});

beforeEach(() => {
	vi.clearAllMocks();
});

const renderRunRoutes = (initialPath: string) => {
	const rootRoute = createRootRoute();
	const runRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "run",
		component: RunLayout,
	});
	const leaf = (path: string, component: () => React.ReactNode) =>
		createRoute({ getParentRoute: () => runRoute, path, component });
	const communityRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "run/community",
		component: RunCommunity,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([
			runRoute.addChildren([
				leaf("/", RunStart),
				leaf("new", RunNew),
				leaf("prep", RunPrep),
				leaf("poll", RunPoll),
				leaf("gate", RunGate),
				leaf("shop", RunShop),
				leaf("over", RunOver),
			]),
			communityRoute,
		]),
		history: createMemoryHistory({ initialEntries: [initialPath] }),
	});
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	render(
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
	return router;
};

describe("run route sync", () => {
	it("redirects a deep link to the screen the run is actually on", async () => {
		const view = createMockRunView();
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

		const router = renderRunRoutes("/run/shop");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/poll")
		);
		expect(await screen.findByText(view.poll?.question ?? "")).toBeVisible();
	});

	it("redirects a deep link past the first gate to prep, not the live poll", async () => {
		const view = createMockRunView({ gatesCleared: 1 });
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

		const router = renderRunRoutes("/run/shop");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
		expect(await screen.findByText("#1 - Boulder Gate")).toBeVisible();
	});

	it("sends a day without a run to the start screen", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: null });

		const router = renderRunRoutes("/run/new");

		await waitFor(() => expect(router.state.location.pathname).toBe("/run"));
		expect(await screen.findByText("Today’s climb")).toBeVisible();
	});

	it("keeps a player whose run could not be read where they are, and says why", async () => {
		vi.mocked(getTodaysRun).mockRejectedValue(new Error("Not authenticated"));

		const router = renderRunRoutes("/run/new");

		expect(await screen.findByText("Not authenticated")).toBeVisible();
		expect(router.state.location.pathname).toBe("/run/new");
		expect(screen.queryByText("Today’s climb")).not.toBeInTheDocument();
	});

	it("surfaces a failed read the server reported as a failure, not a rejection", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: false,
			error: "Run state not found",
		});

		const router = renderRunRoutes("/run/new");

		expect(await screen.findByText("Run state not found")).toBeVisible();
		expect(router.state.location.pathname).toBe("/run/new");
	});

	it("the shop exit continues to the prep hub without closing the shop", async () => {
		const user = userEvent.setup();
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "rewarding",
				gatesCleared: 1,
				poll: null,
			}),
		});

		const router = renderRunRoutes("/run/shop");
		await user.click(await screen.findByRole("button", { name: /To prep/ }));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();
	});

	it("prep's community nudge reaches the community board", async () => {
		const user = userEvent.setup();
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "rewarding",
				gatesCleared: 1,
				poll: null,
			}),
		});
		vi.mocked(getRunCommunity).mockResolvedValue({
			success: true,
			data: {
				date: TEST_DATES.birthday,
				totalPlayers: 3,
				topPercent: null,
				leaders: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/prep");
		await user.click(await screen.findByRole("button", { name: /Community/ }));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/community")
		);
	});

	it("the community board's back-to-run lands on gate prep, not the live poll", async () => {
		const user = userEvent.setup();
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "answering",
				gatesCleared: 1,
				poll: null,
			}),
		});
		vi.mocked(getRunCommunity).mockResolvedValue({
			success: true,
			data: {
				date: TEST_DATES.birthday,
				totalPlayers: 3,
				topPercent: null,
				leaders: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/community");
		await user.click(
			await screen.findByRole("button", { name: "Back to your run →" })
		);

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
	});

	it("the community board's back-to-run skips prep on the very first gate", async () => {
		const user = userEvent.setup();
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "answering",
				gatesCleared: 0,
				poll: null,
			}),
		});
		vi.mocked(getRunCommunity).mockResolvedValue({
			success: true,
			data: {
				date: TEST_DATES.birthday,
				totalPlayers: 3,
				topPercent: null,
				leaders: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/community");
		await user.click(
			await screen.findByRole("button", { name: "Back to your run →" })
		);

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/poll")
		);
	});

	it("starting the gate from the prep hub commits finish-reward and reaches the poll", async () => {
		const user = userEvent.setup();
		let serverView = createMockRunView({
			status: "rewarding",
			gatesCleared: 1,
			poll: null,
		});
		vi.mocked(getTodaysRun).mockImplementation(async () => ({
			success: true,
			data: serverView,
		}));
		vi.mocked(dispatchRunAction).mockImplementation(async () => {
			serverView = createMockRunView({ status: "answering", gatesCleared: 1 });
			return { success: true, data: serverView };
		});

		const router = renderRunRoutes("/run/prep");
		await user.click(
			await screen.findByRole("button", { name: /Start Boulder/ })
		);

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledWith({
				data: { action: { type: "finish-reward" } },
			})
		);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/poll")
		);
	});

	it("the shop exit always opens toward prep — no gate grades it (ADR-035)", async () => {
		const user = userEvent.setup();
		const serverView = createMockRunView({
			status: "rewarding",
			gatesCleared: 4,
			configs: [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd],
			poll: null,
		});
		vi.mocked(getTodaysRun).mockImplementation(async () => ({
			success: true,
			data: serverView,
		}));

		const router = renderRunRoutes("/run/shop");
		await user.click(await screen.findByRole("button", { name: /To prep/ }));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
	});

	it("the opening build turns the page to gate-0 prep", async () => {
		const user = userEvent.setup();
		const view = createMockRunView({
			status: "configuring",
			gatesCleared: 0,
			poll: null,
			configs: [CONFIGS.js],
			canStart: true,
		});
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

		const router = renderRunRoutes("/run/new");
		await user.click(await screen.findByRole("button", { name: /gate prep/ }));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();
	});

	it("starting the gate from prep reaches the first poll", async () => {
		const user = userEvent.setup();
		const view = createMockRunView({ status: "answering", gatesCleared: 1 });
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

		renderRunRoutes("/run/prep");
		await user.click(await screen.findByRole("button", { name: /^Start / }));

		expect(await screen.findByText(view.poll?.question ?? "")).toBeVisible();
	});

	it("lands a run awaiting tomorrow's polls on the community board", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "answering",
				poll: null,
				awaitingTomorrow: true,
			}),
		});
		vi.mocked(getRunCommunity).mockResolvedValue({
			success: true,
			data: {
				date: TEST_DATES.birthday,
				totalPlayers: 3,
				topPercent: null,
				leaders: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/poll");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/community")
		);
		const back = await screen.findByRole("button", {
			name: /Back to your run →/,
		});
		expect(back).toBeDisabled();
		expect(screen.getByText(/New polls in/)).toBeInTheDocument();
	});

	it("keeps a finished run on the summary and hides the HUD", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({ status: "dead", poll: null }),
		});

		const router = renderRunRoutes("/run/poll");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/over")
		);
	});
});
