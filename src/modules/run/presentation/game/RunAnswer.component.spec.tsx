import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
	abandonRun,
	dispatchRunAction,
	getTodaysRun,
} from "~/modules/run/api/run";
import { createMockRunView } from "~/test/runView.factory";

import { RunAnswer } from "./RunAnswer.component";
import { todaysRunQueryKey } from "./useTodaysRun.hook";

vi.mock("~/modules/run/api/run", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
}));

// jsdom does not implement HTMLDialogElement.showModal / close.
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

const answeringView = createMockRunView();
const question = answeringView.poll?.question ?? "";

const renderAnswerScreen = async (view = answeringView) => {
	const initial = { success: true as const, data: view };
	vi.mocked(getTodaysRun).mockResolvedValue(initial);
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	render(
		<QueryClientProvider client={queryClient}>
			<RunAnswer />
		</QueryClientProvider>
	);
	await screen.findByText(view.poll?.question ?? "");
	return { queryClient, initial };
};

describe("RunAnswer", () => {
	it("a single-answer poll replaces the pick instead of stacking it", async () => {
		const user = userEvent.setup();
		await renderAnswerScreen();
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: true,
			data: createMockRunView(),
		});

		await user.click(screen.getByRole("button", { name: /Silph Co\./ }));
		await user.click(screen.getByRole("button", { name: /Pokémon Tower/ }));
		await user.click(screen.getByRole("button", { name: /Submit answer/ }));

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledWith({
				data: { action: { type: "answer", optionIds: ["option-2"] } },
			})
		);
	});

	it("a multiple-answer poll toggles picks on and off", async () => {
		const user = userEvent.setup();
		const poll = answeringView.poll;
		if (!poll) throw new Error("factory produced no poll");
		await renderAnswerScreen(
			createMockRunView({ poll: { ...poll, answerType: "multiple" } })
		);
		vi.mocked(dispatchRunAction).mockResolvedValue({
			success: true,
			data: createMockRunView(),
		});

		await user.click(screen.getByRole("button", { name: /Silph Co\./ }));
		await user.click(screen.getByRole("button", { name: /Pokémon Tower/ }));
		await user.click(screen.getByRole("button", { name: /Silph Co\./ }));
		await user.click(screen.getByRole("button", { name: /Submit answer/ }));

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledWith({
				data: { action: { type: "answer", optionIds: ["option-2"] } },
			})
		);
	});

	it("submitting stages the reveal without committing the server result", async () => {
		const user = userEvent.setup();
		const { queryClient, initial } = await renderAnswerScreen();
		const afterAnswer = {
			success: true as const,
			data: createMockRunView({
				status: "rewarding",
				answeredThisGate: [
					{
						id: "poll-1",
						question,
						category: answeringView.poll?.category ?? "js",
						outcome: "correct",
						picked: ["Silph Co."],
						correct: ["Silph Co."],
					},
				],
			}),
		};
		vi.mocked(dispatchRunAction).mockResolvedValue(afterAnswer);

		await user.click(screen.getByRole("button", { name: /Silph Co\./ }));
		await user.click(screen.getByRole("button", { name: /Submit answer/ }));

		// The reveal beat: Next appears, but the run itself hasn't advanced.
		await screen.findByRole("button", { name: /Next/ });
		expect(queryClient.getQueryData(todaysRunQueryKey())).toEqual(initial);
	});

	it("advancing from the reveal commits the staged view", async () => {
		const user = userEvent.setup();
		const { queryClient } = await renderAnswerScreen();
		const afterAnswer = {
			success: true as const,
			data: createMockRunView({
				status: "rewarding",
				answeredThisGate: [
					{
						id: "poll-1",
						question,
						category: answeringView.poll?.category ?? "js",
						outcome: "correct",
						picked: ["Silph Co."],
						correct: ["Silph Co."],
					},
				],
			}),
		};
		vi.mocked(dispatchRunAction).mockResolvedValue(afterAnswer);

		await user.click(screen.getByRole("button", { name: /Silph Co\./ }));
		await user.click(screen.getByRole("button", { name: /Submit answer/ }));
		await user.click(await screen.findByRole("button", { name: /Next/ }));

		await waitFor(() =>
			expect(queryClient.getQueryData(todaysRunQueryKey())).toEqual(afterAnswer)
		);
	});

	it("abandoning asks for confirmation and surfaces the server error", async () => {
		const user = userEvent.setup();
		await renderAnswerScreen();
		vi.mocked(abandonRun).mockResolvedValue({
			success: false,
			error: "No active run to abandon",
		});

		await user.click(screen.getByRole("button", { name: "Abandon run" }));

		const dialog = screen.getByRole("dialog");
		expect(within(dialog).getByText("Abandon this run?")).toBeInTheDocument();

		await user.click(
			within(dialog).getByRole("button", { name: "Abandon run" })
		);

		await waitFor(() =>
			expect(
				within(dialog).getByText("No active run to abandon")
			).toBeInTheDocument()
		);
	});
});
