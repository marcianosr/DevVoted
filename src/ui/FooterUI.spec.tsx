import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterUI } from "./FooterUI.component";

const defaultProps = {
	pollCount: 142,
	isLoading: false,
	categoryCount: 8,
	configCount: 24,
	lastCommitDate: "13 May 2025",
	statsLink: <a href="/stats">Stats</a>,
};

describe("FooterUI", () => {
	it("shows poll count when loaded", () => {
		render(<FooterUI {...defaultProps} />);
		expect(screen.getByText("142 polls")).toBeInTheDocument();
	});

	it("hides poll count when loading", () => {
		render(<FooterUI {...defaultProps} isLoading pollCount={null} />);
		expect(screen.queryByText(/polls/)).not.toBeInTheDocument();
	});

	it("shows category and config counts", () => {
		render(<FooterUI {...defaultProps} />);
		expect(screen.getByText("8 categories")).toBeInTheDocument();
		expect(screen.getByText("24 configs")).toBeInTheDocument();
	});

	it("shows the last commit date", () => {
		render(<FooterUI {...defaultProps} />);
		expect(screen.getByText(/13 May 2025/)).toBeInTheDocument();
	});

	it("renders the stats link slot", () => {
		render(<FooterUI {...defaultProps} />);
		expect(screen.getByRole("link", { name: "Stats" })).toBeInTheDocument();
	});

	it("renders the GitHub bug report link", () => {
		render(<FooterUI {...defaultProps} />);
		expect(
			screen.getByRole("link", { name: "Report it on GitHub" })
		).toBeInTheDocument();
	});
});
