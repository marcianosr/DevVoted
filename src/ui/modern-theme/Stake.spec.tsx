import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Stake } from "./Stake.ui";

const props = { removeOnMiss: 1, coveragePerWrong: -0.3 };

describe("Stake", () => {
	// A build is chosen against this panel, so it is the one section on the gate
	// screens that cannot be put away.
	it("cannot be folded away, unlike every other section beside it", () => {
		const { container } = render(<Stake {...props} />);

		expect(container.querySelector("details")).toBeNull();
		expect(screen.getByText("Stake")).toBeInTheDocument();
	});

	// One per-answer row and one per-gate row, in the order Rewards uses, so the
	// two folds line up as opposites rather than as two unrelated lists.
	it("mirrors the Rewards list: a per-answer row above a per-gate row", () => {
		render(<Stake {...props} />);

		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
		expect(screen.getByText("−0.3")).toBeInTheDocument();
		expect(screen.getByText("Gate missed")).toBeInTheDocument();
		expect(screen.getByText("remove 1 config")).toBeInTheDocument();
	});

	// The mirror holds on layout too: Rewards sets its figures on the label's
	// line, so what a gate takes cannot sit a gutter away from what takes it.
	it("sets what a miss costs on the label's line, not across the row", () => {
		render(<Stake {...props} />);

		expect(
			screen.getByText("remove 1 config").closest(".flex-1")
		).not.toBeNull();
		expect(screen.getByText("−0.3").closest(".flex-1")).not.toBeNull();
	});

	it("stays quiet about the run ending while the build survives a miss", () => {
		render(<Stake {...props} />);

		expect(screen.queryByText(/the run ends here/)).not.toBeInTheDocument();
	});

	// The peel count still shows: what changes is that the row says what the
	// count amounts to.
	it("warns on the peel row once it would take the whole build", () => {
		render(<Stake removeOnMiss={3} coveragePerWrong={-1.3} missIsFatal />);

		expect(screen.getByText("remove 3 configs")).toBeInTheDocument();
		expect(
			screen.getByText("your whole build — the run ends here")
		).toHaveClass("text-cinnabar");
	});
});
