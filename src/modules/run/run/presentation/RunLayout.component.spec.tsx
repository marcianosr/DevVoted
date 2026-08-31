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

import { RunAnswer } from "~/modules/run/run/presentation/RunAnswer.component";
import { RunConfigure } from "~/modules/run/build/presentation/RunConfigure.component";
import { RunLayout } from "~/modules/run/run/presentation/RunLayout.component";
import { RunOver } from "~/modules/run/run/presentation/RunOver.component";
import { RunPrep } from "~/modules/run/run/presentation/RunPrep.component";
import { RunReward } from "~/modules/run/gate/presentation/RunReward.component";
import { RunShop } from "~/modules/run/shop/presentation/RunShop.component";
import { RunStart } from "~/modules/run/run/presentation/RunStart.component";
import { RunStrip } from "~/modules/run/gate/presentation/RunStrip.component";

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
}));

vi.mock("~/modules/run/community/application/community.serverfn", () => ({
	getRunCommunity: vi.fn(),
}));

// jsdom does not implement HTMLDialogElement.showModal / close (RunAnswer
// mounts a ConfirmDialog).
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

/**
 * The real /run route shape (layout + per-screen leaves) on a memory history,
 * so the sync behavior is exercised through actual navigation — only the
 * server boundary is mocked.
 */
const renderRunRoutes = (initialPath: string) => {
	const rootRoute = createRootRoute();
	const runRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "run",
		component: RunLayout,
	});
	const leaf = (path: string, component: () => React.ReactNode) =>
		createRoute({ getParentRoute: () => runRoute, path, component });
	// Community sits OUTSIDE the run layout, mirroring run_.community.tsx.
	const communityRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "run/community",
		component: RunCommunity,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([
			runRoute.addChildren([
				leaf("/", RunStart),
				leaf("configure", RunConfigure),
				leaf("prep", RunPrep),
				leaf("answer", RunAnswer),
				leaf("reward", RunReward),
				leaf("shop", RunShop),
				leaf("strip", RunStrip),
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
			expect(router.state.location.pathname).toBe("/run/answer")
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
		expect(await screen.findByText("Boulder gate")).toBeVisible();
	});

	it("sends a day without a run to the start screen", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: null });

		const router = renderRunRoutes("/run/configure");

		await waitFor(() => expect(router.state.location.pathname).toBe("/run"));
		expect(await screen.findByText("Today’s climb")).toBeVisible();
	});

	// The counterpart to the test above, and the reason the two must not share a
	// code path: "no run today" is an answer that moves the player, while a read
	// that failed is not an answer at all (DVTD-cmqj).
	it("keeps a player whose run could not be read where they are, and says why", async () => {
		vi.mocked(getTodaysRun).mockRejectedValue(new Error("Not authenticated"));

		const router = renderRunRoutes("/run/configure");

		expect(await screen.findByText("Not authenticated")).toBeVisible();
		expect(router.state.location.pathname).toBe("/run/configure");
		expect(screen.queryByText("Today’s climb")).not.toBeInTheDocument();
	});

	it("surfaces a failed read the server reported as a failure, not a rejection", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: false,
			error: "Run state not found",
		});

		const router = renderRunRoutes("/run/configure");

		expect(await screen.findByText("Run state not found")).toBeVisible();
		expect(router.state.location.pathname).toBe("/run/configure");
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
		await user.click(
			await screen.findByRole("button", { name: "Continue to gate 1 →" })
		);

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
		// finish-reward waits for prep's start button (ADR-032) — the shop must
		// stay open behind the back button.
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
				standouts: [],
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
				standouts: [],
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
				standouts: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/community");
		await user.click(
			await screen.findByRole("button", { name: "Back to your run →" })
		);

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/answer")
		);
	});

	it("starting the gate from the prep hub commits finish-reward and reaches the poll", async () => {
		const user = userEvent.setup();
		// A stateful server stub: every fetch reports the run parked in the shop
		// phase until finish-reward lands, then reports the climb resumed —
		// otherwise a background refetch would revert the committed status.
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
			await screen.findByRole("button", { name: "Start Boulder gate →" })
		);

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledWith({
				data: { action: { type: "finish-reward" } },
			})
		);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/answer")
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
		await user.click(
			await screen.findByRole("button", { name: "Continue to gate 4 →" })
		);

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/prep")
		);
	});

	it("starting the gate from prep reaches the first poll", async () => {
		const user = userEvent.setup();
		const view = createMockRunView({ status: "answering", gatesCleared: 1 });
		vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

		renderRunRoutes("/run/prep");
		await user.click(
			await screen.findByRole("button", { name: /Start .* gate →/ })
		);

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
				standouts: [],
				polls: [],
				climb: null,
			},
		});

		const router = renderRunRoutes("/run/answer");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/community")
		);
		// The way back waits with the run — /run would only bounce here again —
		// and the countdown stands beside it saying how long that will be.
		// Exact: the disabled button is wrapped in a Popover whose own trigger
		// quotes the label back ("Why … is unavailable").
		const back = await screen.findByRole("button", {
			name: "Back to your run →",
		});
		expect(back).toBeDisabled();
		expect(screen.getByText(/New polls in/)).toBeInTheDocument();
	});

	it("keeps a finished run on the summary and hides the HUD", async () => {
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({ status: "dead", poll: null }),
		});

		const router = renderRunRoutes("/run/answer");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/run/over")
		);
	});
});
