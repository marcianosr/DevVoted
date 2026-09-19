import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RebaseList, type RebaseRow } from "./RebaseList.ui";

const ROWS: readonly RebaseRow[] = [
	{ id: "poll-0", category: "React" },
	{ id: "poll-1", category: "CSS" },
	{ id: "poll-2", category: "Git" },
];

const props = {
	label: "git rebase -i",
	hint: "Put the categories you are surest of first.",
	rows: ROWS,
};

describe("RebaseList", () => {
	it("lists the gate's categories as a rebase todo file", () => {
		render(<RebaseList {...props} onMove={() => {}} />);

		expect(screen.getAllByText("pick")).toHaveLength(ROWS.length);
		expect(screen.getByText("React")).toBeInTheDocument();
	});

	it("withholds answer types until a row carries one", () => {
		render(<RebaseList {...props} onMove={() => {}} />);

		expect(screen.queryByText("two answers")).toBeNull();
	});

	it("names which polls take more than one answer once v2 supplies it", () => {
		const typed = [{ ...ROWS[0], answerType: "two answers" }];
		render(<RebaseList {...props} rows={typed} onMove={() => {}} />);

		expect(screen.getByText("two answers")).toBeInTheDocument();
	});

	it("moves a row one place earlier", async () => {
		const onMove = vi.fn();
		render(<RebaseList {...props} onMove={onMove} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Move CSS earlier" })
		);

		expect(onMove).toHaveBeenCalledWith(1, 0);
	});

	it("moves a row one place later", async () => {
		const onMove = vi.fn();
		render(<RebaseList {...props} onMove={onMove} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Move CSS later" })
		);

		expect(onMove).toHaveBeenCalledWith(1, 2);
	});

	it("refuses to move the first row earlier or the last row later", () => {
		render(<RebaseList {...props} onMove={() => {}} />);

		expect(
			screen.getByRole("button", { name: "Move React earlier" })
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Move Git later" })
		).toBeDisabled();
	});

	it("drops every move press once the order is locked", () => {
		render(<RebaseList {...props} />);

		expect(screen.queryByRole("button")).toBeNull();
	});
});
