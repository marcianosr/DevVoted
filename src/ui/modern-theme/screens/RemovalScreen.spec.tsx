import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "../Chip.ui";

import {
	RemovalScreen,
	type RemovalConfig,
	type RemovalScreenProps,
} from "./RemovalScreen.ui";

const configs: readonly RemovalConfig[] = [
	{ id: "ts", label: ".ts", notes: <Chip tone="celadon">×1.25</Chip> },
	{ id: "AGENTS", label: "AGENTS.md" },
	{ id: "ESLint", label: "ESLint" },
	{ id: "IndexedDB", label: "IndexedDB" },
];

const props: RemovalScreenProps = {
	gateName: "Lavender",
	required: 2,
	configs,
	selectedIds: [],
	onToggle: () => {},
	onRemove: () => {},
	theme: "lavender",
};

const CONTINUE = "Remove and go to shop";

describe("RemovalScreen", () => {
	it("names the gate that held and the price in configs", () => {
		render(<RemovalScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender gate · remove 2 configs" })
		).toBeInTheDocument();
	});

	it("lists the build open, with nothing to collapse it behind", () => {
		const { container } = render(<RemovalScreen {...props} />);

		expect(screen.getByRole("heading", { name: "Build" })).toBeInTheDocument();
		expect(container.querySelector("details")).toBeNull();
	});

	it("shows what each config gives beside its name", () => {
		render(<RemovalScreen {...props} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
	});

	it("hands the toggled config back by id", async () => {
		const onToggle = vi.fn();
		render(<RemovalScreen {...props} onToggle={onToggle} />);

		await userEvent.click(screen.getByText("AGENTS.md"));

		expect(onToggle).toHaveBeenCalledWith("AGENTS");
	});

	it("holds the way out shut until the quota is exact", () => {
		render(<RemovalScreen {...props} selectedIds={["ESLint"]} />);

		expect(screen.getByRole("button", { name: CONTINUE })).toBeDisabled();
	});

	it("opens the way out once the quota is met", () => {
		render(<RemovalScreen {...props} selectedIds={["ESLint", "ts"]} />);

		expect(screen.getByRole("button", { name: CONTINUE })).toBeEnabled();
	});

	it("shuts the way out again when the player overshoots the quota", () => {
		render(
			<RemovalScreen {...props} selectedIds={["ESLint", "ts", "AGENTS"]} />
		);

		expect(screen.getByRole("button", { name: CONTINUE })).toBeDisabled();
	});

	it("names the gap in the direction it exists, so the fix is never guessed", () => {
		const { rerender } = render(<RemovalScreen {...props} />);

		expect(
			screen.getByText("Pick 2 more configs to remove")
		).toBeInTheDocument();

		rerender(<RemovalScreen {...props} selectedIds={["ESLint"]} />);
		expect(
			screen.getByText("Pick 1 more config to remove")
		).toBeInTheDocument();

		rerender(
			<RemovalScreen {...props} selectedIds={["ESLint", "ts", "AGENTS"]} />
		);
		expect(screen.getByText("Unpick 1 config")).toBeInTheDocument();
	});

	it("stops instructing once there is nothing left to correct", () => {
		render(<RemovalScreen {...props} selectedIds={["ESLint", "ts"]} />);

		expect(
			screen.getByText("Remove these and open the shop")
		).toBeInTheDocument();
	});

	it("commits the removal from the one button that can", async () => {
		const onRemove = vi.fn();
		render(
			<RemovalScreen
				{...props}
				selectedIds={["ESLint", "ts"]}
				onRemove={onRemove}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: CONTINUE }));

		expect(onRemove).toHaveBeenCalledOnce();
	});

	it("ends the footer on the button, after the consequence it commits to", () => {
		render(<RemovalScreen {...props} />);

		const sentence = screen.getByText(/without the uninstall refund/);
		const button = screen.getByRole("button", { name: CONTINUE });

		expect(
			sentence.compareDocumentPosition(button) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	// The screen opened on the forfeit and never named the cause, so a peeled
	// build read as arbitrary rather than as the consequence of a missed demand.
	it("names the missed coverage before it asks for the configs", () => {
		render(<RemovalScreen {...props} />);

		const cause = screen.getByText(
			"Uh-oh, your build didn't meet the coverage goal for this gate!"
		);
		const list = screen.getByText("Build");

		expect(cause).toHaveClass("text-cinnabar");
		expect(
			cause.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("says the removal is forced and unpaid, not a trade", () => {
		render(<RemovalScreen {...props} />);

		expect(
			screen.getByText(
				"You are forced to remove 2 configs from this run without the uninstall refund!"
			)
		).toBeInTheDocument();
	});
});
