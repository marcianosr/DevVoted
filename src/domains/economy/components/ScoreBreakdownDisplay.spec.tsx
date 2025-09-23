import { render, screen } from "@testing-library/react";
import { ScoreBreakdownDisplay } from "./ScoreBreakdownDisplay";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";

describe("ScoreBreakdownDisplay", () => {
	const mockBreakdown: PollScoreBreakdown = {
		round: 2,
		streak: 3,
		base: 20,
		amp: 1.8,
		earnedXP: 36,
		delta: 36,
	};

	const mockActiveConfigIds = [".js-config", "math-random-config"];
	const mockCategoryCode = "js";

	it("renders breakdown with active configs", () => {
		render(
			<ScoreBreakdownDisplay
				breakdown={mockBreakdown}
				activeConfigIds={mockActiveConfigIds}
				categoryCode={mockCategoryCode}
			/>
		);

		// Check main heading
		expect(screen.getByText("XP Breakdown - Round 2")).toBeInTheDocument();

		// Check base XP calculation
		expect(screen.getByText("Base XP (Round × 10)")).toBeInTheDocument();
		expect(screen.getByText("20 XP")).toBeInTheDocument();

		// Check streak bonus
		expect(screen.getByText("Streak Bonus (3 correct)")).toBeInTheDocument();
		expect(screen.getByText("×1.3")).toBeInTheDocument();

		// Check config effects
		expect(screen.getByText("Config Effects Active:")).toBeInTheDocument();
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText("Math Random")).toBeInTheDocument();

		// Check pre-correctness calculation
		expect(screen.getByText("Pre-correctness: 20 × 1.8")).toBeInTheDocument();
		expect(screen.getByText("= 36 XP")).toBeInTheDocument();

		// Check correctness factor note
		expect(screen.getByText("Correctness factor applied")).toBeInTheDocument();

		// Check final earned XP
		expect(screen.getByText("Final XP Earned")).toBeInTheDocument();
		expect(screen.getByText("36 XP")).toBeInTheDocument();
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
		expect(screen.queryByText("XP Breakdown")).not.toBeInTheDocument();
	});

	it("calculates config amp bonus correctly", () => {
		const mockBreakdownWithBonus: PollScoreBreakdown = {
			round: 3,
			streak: 2,
			base: 30,
			amp: 1.7, // Base amp would be 1.2 (1 + 0.1 * 2), so config bonus is +0.5
			earnedXP: 51,
			delta: 51,
		};

		render(
			<ScoreBreakdownDisplay
				breakdown={mockBreakdownWithBonus}
				activeConfigIds={[".js-config"]}
				categoryCode="js"
			/>
		);

		// Should show +0.5 amp bonus
		expect(screen.getByText("+0.5 amp")).toBeInTheDocument();
		expect(screen.getByText("×1.7")).toBeInTheDocument();
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