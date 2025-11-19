import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollAnswerReview } from "./PollAnswerReview";
import { createMockPoll } from "~/domains/polls/factories/poll";
import { createPollOption } from "~/domains/polls/models/pollOption";

describe("PollAnswerReview", () => {
	describe("visual feedback", () => {
		it("highlights correct selected options in green", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Mumbo's Mountain",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Treasure Trove Cove",
					correct: false,
					pollId: 1,
				}),
			];

			const { container } = render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1]}
					correctOptionIds={[1]}
					isCorrect={true}
				/>
			);

			expect(screen.getByText("Mumbo's Mountain")).toBeInTheDocument();
			expect(
				screen.getByText("[ YOUR ANSWER ]", { exact: false })
			).toBeInTheDocument();

			const correctOption = screen
				.getByText("Mumbo's Mountain")
				.closest("div.border");
			expect(correctOption).toHaveClass("border-green-500");
			expect(correctOption).toHaveClass("bg-green-900/30");
		});

		it("highlights incorrect selected options in red", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Kazooie",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Gruntilda",
					correct: false,
					pollId: 1,
				}),
			];

			const { container } = render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[2]}
					correctOptionIds={[1]}
					isCorrect={false}
				/>
			);

			const incorrectOption = screen
				.getByText("Gruntilda")
				.closest("div.border");
			expect(incorrectOption).toHaveClass("border-red-500");
			expect(incorrectOption).toHaveClass("bg-red-900/30");
		});

		it("shows unselected correct options with green border", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Banjo",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Bottles",
					correct: false,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[2]}
					correctOptionIds={[1]}
					isCorrect={false}
				/>
			);

			const correctOption = screen
				.getByText("Banjo")
				.closest("div.border");
			expect(correctOption).toHaveClass("border-green-700");
			expect(correctOption).toHaveClass("bg-green-900/10");
			expect(
				screen.queryByText("[ YOUR ANSWER ]", { exact: false })
			).toBeInTheDocument();
		});

		it("shows unselected incorrect options in gray", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Tooty",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Klungo",
					correct: false,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1]}
					correctOptionIds={[1]}
					isCorrect={true}
				/>
			);

			const incorrectOption = screen
				.getByText("Klungo")
				.closest("div.border");
			expect(incorrectOption).toHaveClass("border-zinc-700");
			expect(incorrectOption).toHaveClass("bg-zinc-900/20");
		});
	});

	describe.skip("status messages", () => {
		it("shows success message when all answers are correct", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Spiral Mountain",
					correct: true,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1]}
					correctOptionIds={[1]}
					isCorrect={true}
				/>
			);

			expect(
				screen.getByText(/Correct! You got all answers right!/i)
			).toBeInTheDocument();
		});

		it("shows partially correct message with count", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Jiggy",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Honeycomb",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Jinjo",
					correct: false,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1, 3]}
					correctOptionIds={[1, 2]}
					isCorrect={false}
				/>
			);

			expect(
				screen.getByText(/Partially correct \(1\/2\)/i)
			).toBeInTheDocument();
		});

		it("shows incorrect message when no answers are correct", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Click Clock Wood",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Rusty Bucket Bay",
					correct: false,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[2]}
					correctOptionIds={[1]}
					isCorrect={false}
				/>
			);

			expect(screen.getByText(/Incorrect answer/i)).toBeInTheDocument();
		});
	});

	describe("multiple selections", () => {
		it("handles multiple correct selections", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Grunty's Lair",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Freezeezy Peak",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Mad Monster Mansion",
					correct: false,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1, 2]}
					correctOptionIds={[1, 2]}
					isCorrect={true}
				/>
			);

			const yourAnswerLabels = screen.getAllByText("[ YOUR ANSWER ]", {
				exact: false,
			});
			expect(yourAnswerLabels).toHaveLength(2);
		});

		it("handles mixed correct and incorrect selections", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Bubblegloop Swamp",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Gobi's Valley",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Clanker's Cavern",
					correct: true,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1, 2]}
					correctOptionIds={[1, 3]}
					isCorrect={false}
				/>
			);

			// Verify selections are rendered correctly
			const yourAnswerLabels = screen.getAllByText("[ YOUR ANSWER ]", {
				exact: false,
			});
			expect(yourAnswerLabels).toHaveLength(2);
		});
	});

	describe("edge cases", () => {
		it("renders when no options are selected", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "Rare",
					correct: true,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[]}
					correctOptionIds={[1]}
					isCorrect={false}
				/>
			);

			expect(screen.getByText("Review your answer")).toBeInTheDocument();
			expect(
				screen.queryByText("[ YOUR ANSWER ]")
			).not.toBeInTheDocument();
		});

		it("renders with single option poll", () => {
			const poll = createMockPoll({ id: 1 });
			const options = [
				createPollOption({
					id: 1,
					option: "The only answer",
					correct: true,
					pollId: 1,
				}),
			];

			render(
				<PollAnswerReview
					poll={poll}
					options={options}
					selectedOptionIds={[1]}
					correctOptionIds={[1]}
					isCorrect={true}
				/>
			);

			expect(screen.getByText("The only answer")).toBeInTheDocument();
			expect(
				screen.getByText("[ YOUR ANSWER ]", { exact: false })
			).toBeInTheDocument();
		});
	});
});
