import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RewardScreen } from "./RewardScreen.ui";

const base = {
	gatesCleared: 1,
	storage: 280,
	coverageByCategory: { js: 8, css: 3.5 },
	answered: [
		{
			id: "js1",
			question: "typeof null?",
			category: "js" as const,
			correct: true,
			picked: ['"object"'],
		},
		{
			id: "js2",
			question: "at(-1)?",
			category: "js" as const,
			correct: false,
			picked: ["pop()"],
		},
	],
	passedChecks: [
		{
			label: "Correct",
			progress: "2/2",
			current: 2,
			target: 2,
			state: "success" as const,
		},
	],
	configs: [],
};

describe("RewardScreen", () => {
	it("shows the cleared gate, storage, and the answer results", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Gate #1 cleared/ })
		).toBeInTheDocument();
		expect(screen.getByText("280KB")).toBeInTheDocument();
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText(/Correct/)).toBeInTheDocument();
	});
});
