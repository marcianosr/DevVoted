import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Choice, type ChoiceSeal } from "./Choice.ui";

const SEAL: ChoiceSeal = {
	price: "4 KB",
	hint: "Unseal this answer for 4 KB",
	onUnseal: () => {},
};

describe("a sealed answer row", () => {
	it("covers the label with a bar rather than printing the redaction text", () => {
		render(<Choice letter="C" label="?????" seal={SEAL} onPick={() => {}} />);

		expect(screen.queryByText("?????")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "C, sealed answer" })
		).toBeInTheDocument();
	});

	it("sizes the bar off the letter, so no width can be read as an answer length", () => {
		const { container: first } = render(
			<Choice letter="C" label="?????" seal={SEAL} />
		);
		const { container: same } = render(
			<Choice letter="C" label="a much longer answer" seal={SEAL} />
		);

		const widthOf = (container: HTMLElement) =>
			container.querySelector("span.rounded-md[aria-hidden]")?.className;

		expect(widthOf(first)).toBe(widthOf(same));
	});

	it("prices the unseal press and hands the press back when it is used", async () => {
		const onUnseal = vi.fn();
		render(
			<Choice
				letter="C"
				label="?????"
				seal={{ ...SEAL, onUnseal }}
				onPick={() => {}}
			/>
		);

		expect(screen.getByText("4")).toBeInTheDocument();
		expect(screen.getByText("KB")).toBeInTheDocument();
		await userEvent.click(
			screen.getByRole("button", { name: SEAL.hint ?? "unseal" })
		);

		expect(onUnseal).toHaveBeenCalledOnce();
	});

	it("disables the press when the balance cannot cover the fee", () => {
		render(
			<Choice
				letter="C"
				label="?????"
				seal={{ price: "4 KB", hint: "not enough storage" }}
				onPick={() => {}}
			/>
		);

		expect(
			screen.getByRole("button", { name: "not enough storage" })
		).toBeDisabled();
	});

	it("stays pickable, because gambling blind is the play the seal sells", async () => {
		const onPick = vi.fn();
		render(<Choice letter="C" label="?????" seal={SEAL} onPick={onPick} />);

		await userEvent.click(
			screen.getByRole("button", { name: "C, sealed answer" })
		);

		expect(onPick).toHaveBeenCalledOnce();
	});
});

describe("a readable answer row", () => {
	it("keeps the label inside the one button the row is", async () => {
		const onPick = vi.fn();
		render(<Choice letter="A" label="at(−1)" onPick={onPick} />);

		await userEvent.click(screen.getByRole("button", { name: /at\(−1\)/ }));

		expect(onPick).toHaveBeenCalledOnce();
	});

	it("marks a picked row as pressed", () => {
		render(<Choice letter="A" label="at(−1)" selected onPick={() => {}} />);

		expect(screen.getByRole("button", { name: /at\(−1\)/ })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
	});
});
