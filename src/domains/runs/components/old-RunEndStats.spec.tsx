import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RunEndStats } from "./old-RunEndStats";

const mockCategoryCoverage = [
	{
		categoryCode: "js" as const,
		currentCoverage: 150,
		currentStreak: 3,
		bestStreak: 5,
		pollsAnswered: 12,
	},
	{
		categoryCode: "react" as const,
		currentCoverage: 80,
		currentStreak: 0,
		bestStreak: 2,
		pollsAnswered: 8,
	},
];

describe(RunEndStats, () => {
	it("displays victory completion message", () => {
		render(
			<RunEndStats
				totalCoverage={230}
				totalPollsAnswered={20}
				categoryCoverage={mockCategoryCoverage}
				duration="2m 45s"
				reason="victory"
			/>
		);

		expect(screen.getByText("🎉")).toBeInTheDocument();
		expect(
			screen.getByText("You mastered all CI gates in this run!")
		).toBeInTheDocument();
	});

	it("displays duration", () => {
		render(
			<RunEndStats
				totalCoverage={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryCoverage}
				duration="1m 30s"
				reason="victory"
			/>
		);

		expect(screen.getByText("Duration: 1m 30s")).toBeInTheDocument();
	});

	it("displays category performance details", () => {
		render(
			<RunEndStats
				totalCoverage={230}
				totalPollsAnswered={20}
				categoryCoverage={mockCategoryCoverage}
				duration="2m 45s"
				reason="victory"
			/>
		);

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("150%")).toBeInTheDocument();
		expect(
			screen.getByText("12 questions • Best streak: 5")
		).toBeInTheDocument();
		expect(screen.getByText("Streak: 3")).toBeInTheDocument();

		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("80%")).toBeInTheDocument();
		expect(
			screen.getByText("8 questions • Best streak: 2")
		).toBeInTheDocument();
		expect(screen.getByText("Streak: 0")).toBeInTheDocument();
	});

	it("shows manual break off reason", () => {
		render(
			<RunEndStats
				totalCoverage={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryCoverage}
				duration="1m 30s"
				reason="manual_break_off"
			/>
		);

		expect(screen.getByText("🛑")).toBeInTheDocument();
		expect(screen.getByText("Manually broke off the run")).toBeInTheDocument();
	});

	it("shows threshold not met reason", () => {
		render(
			<RunEndStats
				totalCoverage={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryCoverage}
				duration="1m 30s"
				reason="threshold_not_met"
			/>
		);

		expect(screen.getByText("⚠️")).toBeInTheDocument();
		expect(screen.getByText("CI gate failed!")).toBeInTheDocument();
	});

	it("shows wrong answer reason", () => {
		render(
			<RunEndStats
				totalCoverage={100}
				totalPollsAnswered={10}
				categoryCoverage={mockCategoryCoverage}
				duration="1m 30s"
				reason="wrong_answer"
			/>
		);

		expect(screen.getByText("❌")).toBeInTheDocument();
		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
	});
});
