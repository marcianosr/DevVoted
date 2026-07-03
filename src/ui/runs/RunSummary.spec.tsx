import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { RunSummary } from "./RunSummary.ui";

const baseData: ComponentProps<typeof RunSummary>["data"] = {
	pollsAnswered: 5,
	pollsCorrect: 3,
	totalCoverage: 0.5,
	bestStreak: 1,
	gatesCleared: 2,
	pipelinesFought: 4,
	shopRebuilds: 0,
	archivedCredit: 0,
};

const statValue = (label: string): string | null =>
	screen.getByText(label).parentElement?.querySelector("span:last-child")
		?.textContent ?? null;

describe(RunSummary.name, () => {
	it("derives wrong answers from answered minus correct", () => {
		render(<RunSummary data={baseData} />);
		expect(statValue("Wrong answers")).toBe("2");
	});

	it("shows correct answers as a plain count, not a fraction", () => {
		render(<RunSummary data={baseData} />);
		expect(statValue("Correct answers")).toBe("3");
	});

	it("shows gates cleared and pipelines fought", () => {
		render(<RunSummary data={baseData} />);
		expect(statValue("Gates cleared")).toBe("2");
		expect(statValue("Pipelines fought")).toBe("4");
	});

	it("shows no wrong answers when every poll was correct", () => {
		render(
			<RunSummary data={{ ...baseData, pollsAnswered: 3, pollsCorrect: 3 }} />
		);
		expect(statValue("Wrong answers")).toBe("0");
	});
});
