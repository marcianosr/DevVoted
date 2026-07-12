import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CheckStatus } from "~/modules/session-run/configs/effect";
import { GateRequirementList } from "./GateRequirementList.ui";

const checks: CheckStatus[] = [
	{ label: "Correct", progress: "3/3", state: "success" },
	{ label: "Coverage", progress: "2%/4%", state: "running" },
	{ label: ".js mastery", progress: "not seen", state: "skipped" },
	{ label: "Speed", progress: "0/2 fast", state: "failed" },
];

describe("GateRequirementList", () => {
	it("renders the section header and each check", () => {
		render(<GateRequirementList checks={checks} />);
		expect(
			screen.getByText("This gate needs (all must pass)")
		).toBeInTheDocument();
		expect(screen.getByText(/Correct/)).toBeInTheDocument();
		expect(screen.getByText("2%/4%")).toBeInTheDocument();
	});

	it("uses GitHub-style state colors: success green, running orange, skipped grey, failed red", () => {
		render(<GateRequirementList checks={checks} />);
		expect(screen.getByText("3/3")).toHaveClass("text-viridian");
		expect(screen.getByText("2%/4%")).toHaveClass("text-vermillion");
		expect(screen.getByText("not seen")).toHaveClass("text-pewter");
		expect(screen.getByText("0/2 fast")).toHaveClass("text-cinnabar");
	});
});
