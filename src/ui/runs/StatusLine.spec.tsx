import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatusLine } from "./StatusLine.ui";

describe(StatusLine.name, () => {
	it("renders the badge and the line", () => {
		render(<StatusLine badge="pass" line="adds two numbers" />);
		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("adds two numbers")).toBeInTheDocument();
	});

	it("renders the leading and trailing slots", () => {
		render(
			<StatusLine
				badge="run"
				line="requires a passing test"
				leading={<span>unit-tests</span>}
				trailing={<span>running</span>}
			/>
		);
		expect(screen.getByText("unit-tests")).toBeInTheDocument();
		expect(screen.getByText("running")).toBeInTheDocument();
	});

	it("is a plain, non-interactive container when onActivate is absent", () => {
		render(<StatusLine badge="skip" line="dormant" />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("becomes a keyboard-activatable button that fires onActivate on click", () => {
		const onActivate = vi.fn();
		render(
			<StatusLine badge="pass" line="remove me" onActivate={onActivate} />
		);
		fireEvent.click(screen.getByRole("button"));
		expect(onActivate).toHaveBeenCalledTimes(1);
	});

	it("fires onActivate on Enter and Space", () => {
		const onActivate = vi.fn();
		render(
			<StatusLine badge="pass" line="remove me" onActivate={onActivate} />
		);
		const row = screen.getByRole("button");
		fireEvent.keyDown(row, { key: "Enter" });
		fireEvent.keyDown(row, { key: " " });
		expect(onActivate).toHaveBeenCalledTimes(2);
	});

	it("renders as a summary element when asked, for a collapsible row", () => {
		const { container } = render(
			<StatusLine as="summary" badge="pass" line="typeof null?" />
		);
		expect(container.querySelector("summary")).not.toBeNull();
	});
});
