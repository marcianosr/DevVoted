import { QueryClientProvider } from "@tanstack/react-query";

import { createTestQueryClient } from "~/test/queryClient.harness";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	dispatchRunAction,
	getTodaysRun,
} from "~/modules/run/run/application/run.serverfn";
import { submitCrowdPick } from "~/modules/run/community/application/community.serverfn";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { createMockPollView, createMockRunView } from "~/test/runView.factory";
import { RunPoll } from "~/modules/run/run/presentation/RunPoll.component";

vi.mock("~/modules/run/run/application/run.serverfn", () => ({
	getTodaysRun: vi.fn(),
	startRun: vi.fn(),
	abandonRun: vi.fn(),
	dispatchRunAction: vi.fn(),
	getRunRecap: vi.fn(),
}));

vi.mock("~/modules/run/community/application/community.serverfn", () => ({
	submitCrowdPick: vi.fn(),
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

	const queryClient = createTestQueryClient();
	render(
		<QueryClientProvider client={queryClient}>
			<RunPoll />
		</QueryClientProvider>
	);
	return view;
};

const renderApprovedPoll = () => {
	const poll = createMockPollView({ id: "approved-1", answerType: "single" });
	const view = createMockRunView({ poll, approvedPollId: poll.id });
	vi.mocked(getTodaysRun).mockResolvedValue({ success: true, data: view });

	const queryClient = createTestQueryClient();
	const rendered = render(
		<QueryClientProvider client={queryClient}>
			<RunPoll />
		</QueryClientProvider>
	);
	return { view, poll, queryClient, ...rendered };
};

const roomAnswered = (poll: {
	id: string;
	question: string;
}): AnsweredPoll => ({
	id: poll.id,
	category: "js",
	question: poll.question,
	outcome: "correct",
	picked: ["A"],
	correct: ["A"],
	options: ["A", "B", "C"],
	coverageEarned: 12,
	explanation: "The room got this one.",
});

const answeredWith = () => {
	const action = vi.mocked(dispatchRunAction).mock.calls.at(0)?.[0]
		?.data.action;
	return action?.type === "answer" ? action : undefined;
};

describe("RunPoll", () => {
	it("answers a single-answer poll the moment an option is tapped", async () => {
		const user = userEvent.setup();
		const view = renderPoll("single");
		const option = view.poll?.options[1];

		await user.click(await screen.findByRole("button", { name: /^B/ }));

		await waitFor(() =>
			expect(answeredWith()).toEqual({
				type: "answer",
				optionIds: [option?.id],
				elapsedMs: expect.any(Number),
			})
		);
	});

	it("sends a single answer once, however fast the second tap follows", async () => {
		const user = userEvent.setup();
		renderPoll("single");

		await user.click(await screen.findByRole("button", { name: /^B/ }));
		await user.click(screen.getByRole("button", { name: /^C/ }));

		await waitFor(() =>
			expect(vi.mocked(dispatchRunAction)).toHaveBeenCalledOnce()
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

	it("shows the room's answer before moving on when the poll is approved", async () => {
		const user = userEvent.setup();
		const { view, poll } = renderApprovedPoll();
		vi.mocked(submitCrowdPick).mockResolvedValue({
			success: true,
			data: { ...view, answeredThisGate: [roomAnswered(poll)] },
		});

		await user.click(await screen.findByRole("button", { name: /^LGTM/ }));

		expect(
			await screen.findByText("The room got this one.")
		).toBeInTheDocument();
		expect(vi.mocked(dispatchRunAction)).not.toHaveBeenCalled();
	});

	it("states why the room could not answer a refused approval", async () => {
		const user = userEvent.setup();
		renderApprovedPoll();
		vi.mocked(submitCrowdPick).mockResolvedValue({
			success: false,
			error: "This poll does not have enough approvals yet",
		});

		await user.click(await screen.findByRole("button", { name: /^LGTM/ }));

		expect(
			await screen.findByText("This poll does not have enough approvals yet")
		).toBeInTheDocument();
	});

	it("writes an unread reveal into today's run when the poll is left before Next", async () => {
		const user = userEvent.setup();
		const { view, poll, queryClient, unmount } = renderApprovedPoll();
		const staged = {
			success: true as const,
			data: { ...view, answeredThisGate: [roomAnswered(poll)] },
		};
		vi.mocked(submitCrowdPick).mockResolvedValue(staged);

		await user.click(await screen.findByRole("button", { name: /^LGTM/ }));
		await screen.findByText("The room got this one.");
		unmount();

		expect(queryClient.getQueryData(sessionRunQueryKeys.todaysRun())).toEqual(
			staged
		);
	});
});
