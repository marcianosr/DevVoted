import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApprovalList, type ApprovalRow } from "./ApprovalList.ui";

const ROWS: readonly ApprovalRow[] = [
	{ pollId: "100", slot: 1, category: "javascript" },
	{ pollId: "101", slot: 2, category: "css", refusal: "needs 2 approvals" },
	{ pollId: "102", slot: 3, category: "python" },
];

const props = {
	label: "LGTM",
	hint: "Approve one of the five without reading it.",
	rows: ROWS,
	committed: null,
};

describe("ApprovalList", () => {
	it("names every slot by the category behind it", () => {
		render(<ApprovalList {...props} onApprove={() => {}} />);

		expect(screen.getByText("javascript")).toBeInTheDocument();
		expect(screen.getByText("python")).toBeInTheDocument();
	});

	it("sends the poll the player approved, not its position", async () => {
		const onApprove = vi.fn();
		render(<ApprovalList {...props} onApprove={onApprove} />);

		await userEvent.click(screen.getByRole("button", { name: "3" }));

		expect(onApprove).toHaveBeenCalledWith("102");
	});

	it("states what a slot short of the threshold is waiting for", () => {
		render(<ApprovalList {...props} onApprove={() => {}} />);

		expect(screen.getByText("needs 2 approvals")).toBeInTheDocument();
	});

	it("leaves a slot short of the threshold unpressable", () => {
		render(<ApprovalList {...props} onApprove={() => {}} />);

		expect(screen.queryByRole("button", { name: "2" })).not.toBeInTheDocument();
	});

	it("never states how many people have answered", () => {
		render(<ApprovalList {...props} onApprove={() => {}} />);

		expect(screen.queryByText(/\b\d+ (answers|answered)\b/)).toBeNull();
	});

	it("arms the approved slot and says so beside it", () => {
		render(<ApprovalList {...props} committed="100" onApprove={() => {}} />);

		expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByText("approved")).toBeInTheDocument();
	});

	it("drops every press when the whole control is refused", () => {
		render(<ApprovalList {...props} refusal="the mirror inverts the room" />);

		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.getByText("the mirror inverts the room")).toBeInTheDocument();
	});
});
