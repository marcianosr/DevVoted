import { render, screen } from "@testing-library/react";
import { ScoreBreakdownDisplay } from "./ScoreBreakdownDisplay";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";

describe("ScoreBreakdownDisplay", () => {
	const mockBreakdown: PollScoreBreakdown = {
		streak: 3,
		earnedCoverage: 2,
		delta: 2,
	};

	const mockActiveConfigIds = [".js-config", "math-random-config"];
	const mockCategoryCode = "js";

	it("renders breakdown with active configs", () => {
		render(
			<ScoreBreakdownDisplay
				breakdown={mockBreakdown}
				activeConfigIds={mockActiveConfigIds}
				categoryCode={mockCategoryCode}
				coverageBonus={0.5}
			/>
		);

		// Check main heading
		expect(screen.getByText("Coverage Breakdown")).toBeInTheDocument();

		// Check base coverage
		expect(screen.getByText("Base Coverage")).toBeInTheDocument();
		expect(screen.getByText("1%")).toBeInTheDocument();

		// Check streak display
		expect(screen.getByText("Current Streak")).toBeInTheDocument();
		expect(screen.getByText("3 correct")).toBeInTheDocument();

		// Check config effects
		expect(screen.getByText("Config Effects Active:")).toBeInTheDocument();
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText("Math Random")).toBeInTheDocument();

		// Check correctness factor note
		expect(screen.getByText("Correctness factor")).toBeInTheDocument();

		// Check final earned coverage
		expect(screen.getByText("Coverage Earned")).toBeInTheDocument();
		expect(screen.getByText("2.0%")).toBeInTheDocument();
	});

	it("renders when no breakdown provided", () => {
		render(
			<ScoreBreakdownDisplay
				breakdown={null}
				activeConfigIds={[]}
				categoryCode="js"
			/>
		);

		// Should not render anything
		expect(screen.queryByText("Coverage Breakdown")).not.toBeInTheDocument();
	});

	it("calculates config coverage bonus correctly", () => {
		const mockBreakdownWithBonus: PollScoreBreakdown = {
			streak: 2,
			earnedCoverage: 2,
			delta: 2,
		};

		render(
			<ScoreBreakdownDisplay
				breakdown={mockBreakdownWithBonus}
				activeConfigIds={[".js-config"]}
				categoryCode="js"
				coverageBonus={0.5}
			/>
		);

		// Should show +0.5% coverage bonus
		expect(screen.getByText("+0.5%")).toBeInTheDocument();
		expect(screen.getByText(".js")).toBeInTheDocument();
	});

	it("handles configs that don't affect current category", () => {
		render(
			<ScoreBreakdownDisplay
				breakdown={mockBreakdown}
				activeConfigIds={[".css-config"]} // CSS config won't affect JS polls
				categoryCode="js"
			/>
		);

		// Should not show config effects section
		expect(screen.queryByText("Config Effects Active:")).not.toBeInTheDocument();
		expect(screen.queryByText(".css")).not.toBeInTheDocument();
	});
});