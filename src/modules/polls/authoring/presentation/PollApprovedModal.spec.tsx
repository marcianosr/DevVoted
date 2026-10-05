import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PollApprovedModal } from "~/modules/polls/authoring/presentation/PollApprovedModal.ui";

const BALANCE_BEAT_MS = 600;

const renderModal = () =>
	render(
		<PollApprovedModal
			heading="Your poll is live"
			reward="+16 KB"
			fromKb={496}
			toKb={512}
			questions={[
				{
					id: 74,
					segments: [{ kind: "text", text: "Which gym is in Pewter?" }],
				},
			]}
			onDismiss={vi.fn()}
		/>
	);

describe("PollApprovedModal", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("opens on the archive as it stood before the reward", () => {
		renderModal();

		expect(screen.getByRole("img", { name: "496 KB" })).toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: "512 KB" })
		).not.toBeInTheDocument();
	});

	it("counts the archive up to the balance after the reward", () => {
		renderModal();

		act(() => {
			vi.advanceTimersByTime(BALANCE_BEAT_MS);
		});

		expect(screen.getByRole("img", { name: "512 KB" })).toBeInTheDocument();
	});

	it("names the poll that went live and the reward it paid", () => {
		renderModal();

		expect(screen.getByText("Which gym is in Pewter?")).toBeInTheDocument();
		expect(screen.getAllByText("+16 KB").length).toBeGreaterThan(0);
	});
});
