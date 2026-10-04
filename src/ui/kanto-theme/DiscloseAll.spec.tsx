import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DiscloseAll, discloseAllFor } from "./DiscloseAll.ui";

describe("DiscloseAll", () => {
	it("offers to expand them all while any card is shut", () => {
		render(<DiscloseAll allOpen={false} onToggle={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "expand all" })
		).toBeInTheDocument();
	});

	it("offers to collapse them all once every card is open", () => {
		render(<DiscloseAll allOpen onToggle={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "collapse all" })
		).toBeInTheDocument();
	});

	it("draws a mark, since the panel header has no room for the words", () => {
		render(<DiscloseAll allOpen={false} onToggle={vi.fn()} />);

		const press = screen.getByRole("button", { name: "expand all" });

		expect(press).toHaveClass("size-7");
		expect(press).toHaveTextContent("");
	});

	it("hands the press back to the panel rather than holding the state", async () => {
		const onToggle = vi.fn();
		render(<DiscloseAll allOpen={false} onToggle={onToggle} />);

		await userEvent.click(screen.getByRole("button", { name: "expand all" }));

		expect(onToggle).toHaveBeenCalledOnce();
	});
});

describe("discloseAllFor", () => {
	const onToggleAll = vi.fn();

	it("draws nothing for a panel no screen wired a toggle to", () => {
		expect(discloseAllFor({}, 3)).toBeUndefined();
	});

	it("reads a panel with every card open as collapsible", () => {
		render(
			<>{discloseAllFor({ onToggleAll, openInfo: new Set(["a", "b"]) }, 2)}</>
		);

		expect(
			screen.getByRole("button", { name: "collapse all" })
		).toBeInTheDocument();
	});

	it("reads a panel with one card shut as expandable", () => {
		render(<>{discloseAllFor({ onToggleAll, openInfo: new Set(["a"]) }, 2)}</>);

		expect(
			screen.getByRole("button", { name: "expand all" })
		).toBeInTheDocument();
	});

	it("calls an empty panel expandable rather than already open", () => {
		render(<>{discloseAllFor({ onToggleAll, openInfo: new Set() }, 0)}</>);

		expect(
			screen.getByRole("button", { name: "expand all" })
		).toBeInTheDocument();
	});
});
