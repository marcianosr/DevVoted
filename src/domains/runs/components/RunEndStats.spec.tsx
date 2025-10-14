import { render, screen } from "@testing-library/react";
import { RunEndStats } from "./RunEndStats";
import { describe, expect, it } from "vitest";

const mockCategoryXp = [
	{
		categoryCode: "rareware",
		currentXp: 150,
		currentStreak: 3,
		bestStreak: 5,
		pollsAnswered: 12,
	},
	{
		categoryCode: "pokemon",
		currentXp: 80,
		currentStreak: 0,
		bestStreak: 2,
		pollsAnswered: 8,
	},
];

describe("RunEndStats", () => {
	it("displays total XP and questions answered", () => {
		render(
			<RunEndStats
				totalXp={230}
				totalPollsAnswered={20}
				categoryCoverage={mockCategoryXp}
				duration="2m 45s"
			/>
		);

		expect(screen.getByText("230")).toBeInTheDocument();
		expect(screen.getByText("Total XP Earned")).toBeInTheDocument();
		expect(screen.getByText("20")).toBeInTheDocument();
		expect(screen.getByText("Questions Answered")).toBeInTheDocument();
	});

	it("displays duration", () => {
		render(
			<RunEndStats
				totalXp={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryXp}
				duration="1m 30s"
			/>
		);

		expect(screen.getByText("Duration: 1m 30s")).toBeInTheDocument();
	});

	it("displays category performance details", () => {
		render(
			<RunEndStats
				totalXp={230}
				totalPollsAnswered={20}
				categoryCoverage={mockCategoryXp}
				duration="2m 45s"
			/>
		);

		expect(screen.getByText("rareware")).toBeInTheDocument();
		expect(screen.getByText("150 XP")).toBeInTheDocument();
		expect(
			screen.getByText("12 questions • Best streak: 5")
		).toBeInTheDocument();
		expect(screen.getByText("Streak: 3")).toBeInTheDocument();

		expect(screen.getByText("pokemon")).toBeInTheDocument();
		expect(screen.getByText("80 XP")).toBeInTheDocument();
		expect(
			screen.getByText("8 questions • Best streak: 2")
		).toBeInTheDocument();
		expect(screen.getByText("Streak: 0")).toBeInTheDocument();
	});

	it("shows game completion status with default reason", () => {
		render(
			<RunEndStats
				totalXp={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryXp}
				duration="1m 30s"
			/>
		);

		expect(screen.getByText("🏆")).toBeInTheDocument();
		expect(screen.getByText("Game completed")).toBeInTheDocument();
	});

	it("shows threshold not met reason", () => {
		render(
			<RunEndStats
				totalXp={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryXp}
				duration="1m 30s"
				reason="threshold_not_met"
			/>
		);

		expect(screen.getByText("⚠️")).toBeInTheDocument();
		expect(screen.getByText("Threshold not met")).toBeInTheDocument();
	});

	it("shows wrong answer reason", () => {
		render(
			<RunEndStats
				totalXp={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryXp}
				duration="1m 30s"
				reason="wrong_answer"
			/>
		);

		expect(screen.getByText("❌")).toBeInTheDocument();
		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
	});
});
