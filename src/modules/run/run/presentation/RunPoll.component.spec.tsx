import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	dispatchRunAction,
	getTodaysRun,
} from "~/modules/run/run/application/run.serverfn";
import { createMockPollView, createMockRunView } from "~/test/runView.factory";
import { RunPoll } from "~/modules/run/run/presentation/RunPoll.component";

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
	getRunRecap: vi.fn(),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

const renderPoll = (answerType: "single" | "multiple") => {
	const view = createMockRunView({
		poll: createMockPollView({ answerType }),
	});
	vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });
	vi.mocked(dispatchRunAction).mockResolvedValue({ success: true, data: view });

	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	render(
		<QueryClientProvider client={queryClient}>
			<RunPoll />
		</QueryClientProvider>
	);
	return view;
};

const answeredWith = () => {
	const action = vi.mocked(dispatchRunAction).mock.calls.at(0)?.[0]
		?.data.action;
	return action?.type === "answer" ? action : undefined;
};

describe("RunPoll", () => {
	it("holds a single-answer pick until the submit is pressed", async () => {
		const user = userEvent.setup();
		const view = renderPoll("single");
		const option = view.poll?.options[1];

		await user.click(await screen.findByRole("button", { name: /^B/ }));
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();

		await user.click(
			await screen.findByRole("button", { name: /^Lock in 1 answer/ })
		);

		await waitFor(() =>
			expect(answeredWith()).toEqual({
				type: "answer",
				optionIds: [option?.id],
				elapsedMs: expect.any(Number),
			})
		);
	});

	it("replaces the held pick on a single-answer poll rather than adding to it", async () => {
		const user = userEvent.setup();
		const view = renderPoll("single");

		await user.click(await screen.findByRole("button", { name: /^B/ }));
		await user.click(await screen.findByRole("button", { name: /^C/ }));
		await user.click(
			await screen.findByRole("button", { name: /^Lock in 1 answer/ })
		);

		await waitFor(() =>
			expect(answeredWith()?.optionIds).toEqual([view.poll?.options[2].id])
		);
	});

	it("collects picks on a select-all poll and waits for the submit", async () => {
		const user = userEvent.setup();
		const view = renderPoll("multiple");

		await user.click(await screen.findByRole("button", { name: /^A/ }));
		await user.click(await screen.findByRole("button", { name: /^C/ }));
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();

		await user.click(
			await screen.findByRole("button", { name: /^Lock in 2 answers/ })
		);

		await waitFor(() =>
			expect(answeredWith()?.optionIds).toEqual([
				view.poll?.options[0].id,
				view.poll?.options[2].id,
			])
		);
	});
});
