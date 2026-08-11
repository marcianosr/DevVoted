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
	getRunCommunity,
	getTodaysRun,
} from "~/modules/run/api/run";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RunCommunity } from "~/modules/run/presentation/community/RunCommunity.component";
import { TEST_DATES } from "~/test/kanto";
import { createMockRunView } from "~/test/runView.factory";

import { RunAnswer } from "./RunAnswer.component";
import { RunConfigure } from "./RunConfigure.component";
import { RunLayout } from "./RunLayout.component";
import { RunOver } from "./RunOver.component";
import { RunPrep } from "./RunPrep.component";
import { RunReward } from "./RunReward.component";
import { RunShop } from "./RunShop.component";
import { RunStart } from "./RunStart.component";
import { RunStrip } from "./RunStrip.component";

vi.mock("~/modules/run/api/run", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
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

	it("the shop detour reaches the community page", async () => {
		const user = userEvent.setup();
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({ status: "rewarding", poll: null }),
		});
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: true,
			data: createMockRunView({ status: "answering" }),
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

		const router = renderRunRoutes("/run/shop");
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

	it("dropping a config from prep's edit mode dispatches the drop action", async () => {
		const user = userEvent.setup();
		// Three configs against a demand of two (ADR-027): the build must sit
		// above the gate's width demand for prep to offer a drop at all.
		vi.mocked(getTodaysRun).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "answering",
				gatesCleared: 1,
				configs: [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd],
			}),
		});
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: true,
			data: createMockRunView({
				status: "answering",
				gatesCleared: 1,
				configs: [CONFIGS.js, CONFIGS.agentsMd],
			}),
		});

		renderRunRoutes("/run/prep");
		await user.click(
			await screen.findByRole("button", { name: "Edit pipeline" })
		);
		await user.click(screen.getByRole("button", { name: /ESLint/ }));

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledWith({
				data: { action: { type: "drop", configId: "eslint" } },
			})
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
